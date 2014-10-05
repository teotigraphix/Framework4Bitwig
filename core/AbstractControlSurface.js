// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractControlSurface.buttonStateInterval = 400;


function AbstractControlSurface (output, input, buttons)
{
    if (output == null)
        return;

    this.output = output;
    this.input = input;
    this.input.init ();
    this.input.setMidiCallback (doObject (this, this.handleMidi));
    this.noteInput = this.input.createNoteInput ();
    
    this.selectButtonId = -1;
    this.shiftButtonId  = -1;

    // Mode related
    this.previousMode  = null;
    this.currentMode   = null;
    this.defaultMode   = null;
    this.activeModeId  = -1;
    this.modes         = [];
    this.modeListeners = [];

    // View related
    this.activeViewId = -1;
    this.views = [];
    this.viewChangeListeners = [];

    this.gridNotes = [];
    this.pads = null;
    this.display = null;

    // Button related
    this.buttons = buttons;
    this.buttonStates = [];
    this.buttonConsumed = [];
    if (this.buttons)
    {
        for (var i = 0; i < this.buttons.length; i++)
        {
            this.buttonStates[this.buttons[i]] = ButtonEvent.UP;
            this.buttonConsumed[this.buttons[i]] = false;
        }
    }
    
    // Flush optimisation
    this.displayScheduled = false;
    this.taskReturning    = false;
};

AbstractControlSurface.prototype.getDisplay = function ()
{
    return this.display;
};


//--------------------------------------
// Display
//--------------------------------------

AbstractControlSurface.prototype.setButton = function (button, state) {};

AbstractControlSurface.prototype.flush = function ()
{
    if (this.taskReturning)
    {
        this.taskReturning = false;
        return;
    }

    if (!this.displayScheduled)
    {
        this.displayScheduled = true;
        scheduleTask (doObject (this, function ()
        {
            this.scheduledFlush ();
            this.displayScheduled = false;
            this.taskReturning = true;
        }), null, 70);
    }
    this.redrawGrid ();
};

AbstractControlSurface.prototype.redrawGrid = function ()
{
    var view = this.getActiveView ();
    if (view == null)
        return;
    view.drawGrid ();
    if (this.pads != null)
        this.pads.flush ();
};

AbstractControlSurface.prototype.shutdown = function ()
{
};

AbstractControlSurface.prototype.setKeyTranslationTable = function (table)
{
    this.noteInput.setKeyTranslationTable (table);
};

AbstractControlSurface.prototype.setVelocityTranslationTable = function (table)
{
    this.noteInput.setVelocityTranslationTable (table);
};

AbstractControlSurface.prototype.scheduledFlush = function ()
{
    var view = this.getActiveView ();
    if (view != null)
        view.updateDevice ();
    if (this.display != null)
        this.display.flush ();
};

//--------------------------------------
// ViewState
//--------------------------------------

AbstractControlSurface.prototype.addView = function (viewId, view)
{
    view.attachTo (this);
    this.views[viewId] = view;
};

AbstractControlSurface.prototype.setActiveView = function (viewId)
{
    var prevView = this.activeViewId;
    this.activeViewId = viewId;

    var view = this.getActiveView ();
    if (view == null)
    {
        this.shutdown ();
        return;
    }

    this.updateButtons ();

    view.onActivate ();
    
    // Notify all view change listeners
    for (var i = 0; i < this.viewChangeListeners.length; i++)
        this.viewChangeListeners[i].call (null, prevView, this.activeViewId);
};

AbstractControlSurface.prototype.updateButtons = function () {};

AbstractControlSurface.prototype.getView = function (viewId)
{
    return this.views[viewId];
};

AbstractControlSurface.prototype.getActiveView = function ()
{
    if (this.activeViewId < 0)
        return null;
    var view = this.views[this.activeViewId];
    return view ? view : null;
};

AbstractControlSurface.prototype.isActiveView = function (viewId)
{
    return this.activeViewId == viewId;
};

AbstractControlSurface.prototype.addViewChangeListener = function (listener)
{
    this.viewChangeListeners.push (listener);
};

//--------------------------------------
// ModeState
//--------------------------------------

AbstractControlSurface.prototype.addMode = function (modeId, mode)
{
    mode.attachTo (this);
    this.modes[modeId] = mode;
};

// listener must be a 2 parameter function: [int] oldMode, [int] newMode
AbstractControlSurface.prototype.addModeListener = function (listener)
{
    this.modeListeners.push (listener);
};

AbstractControlSurface.prototype.setDefaultMode = function (mode)
{
    this.defaultMode = mode;
    if (this.previousMode == null)
        this.previousMode = this.defaultMode;
};

AbstractControlSurface.prototype.setPendingMode = function (mode)
{
    if (mode == null)
        mode = this.defaultMode;

    if (mode != this.currentMode)
    {
        if (!this.getMode (this.currentMode).isTemporary)
            this.previousMode = this.currentMode;
        this.currentMode = mode;
        this.setActiveMode (this.currentMode);
    }

    // Notify all mode change listeners
    for (var i = 0; i < this.modeListeners.length; i++)
        this.modeListeners[i].call (null, this.previousMode, this.currentMode);
};

AbstractControlSurface.prototype.getPreviousMode = function ()
{
    return this.previousMode;
};

AbstractControlSurface.prototype.getCurrentMode = function ()
{
    return this.currentMode;
};

AbstractControlSurface.prototype.getActiveMode = function ()
{
    if (this.activeModeId < 0)
        return null;
    var mode = this.modes[this.activeModeId];
    return mode ? mode : null;
};

AbstractControlSurface.prototype.setActiveMode = function (modeId)
{
    this.activeModeId = modeId;

    var mode = this.getActiveMode ();
    if (mode == null)
        return;

    mode.onActivate ();
};

AbstractControlSurface.prototype.isActiveMode = function (modeId)
{
    return this.activeModeId == modeId;
};

AbstractControlSurface.prototype.getMode = function (modeId)
{
    return this.modes[modeId] ? this.modes[modeId] : this.modes[this.defaultMode];
};

//--------------------------------------
// Gesture
//--------------------------------------

AbstractControlSurface.prototype.isSelectPressed = function ()
{
    return this.isPressed (this.selectButtonId);
};

AbstractControlSurface.prototype.isShiftPressed = function ()
{
    return this.isPressed (this.shiftButtonId);
};

AbstractControlSurface.prototype.isPressed = function (button)
{
    switch (this.buttonStates[button])
    {
        case ButtonEvent.DOWN:
        case ButtonEvent.LONG:
            return true;
        default:
            return false;
    }
};

//--------------------------------------
// Handlers
//--------------------------------------

AbstractControlSurface.prototype.handleMidi = function (status, data1, data2)
{
    var code = status & 0xF0;
    switch (code)
    {
        case 0x80:
        case 0x90:
            if (this.isGridNote (data1))
                this.handleGridNote (data1, code == 0x80 ? 0 : data2);
            else
                this.handleTouch (data1, code == 0x80 ? 0 : data2);
            break;

        // Polyphonic Aftertouch
        case 0xA0:
            var view = this.getActiveView ();
            if (view != null)
                view.onPolyAftertouch (data1, data2);
            break;

        case 0xB0:
            this.handleCC (data1, data2);
            break;
            
        // Pitch Bend
        case 0xE0:
            var view = this.getActiveView ();
            if (view != null)
                view.onPitchbend (data1, data2);
            break;
    }
};

AbstractControlSurface.prototype.handleGridNote = function (note, velocity)
{
    var view = this.getActiveView ();
    if (view != null)
        view.onGridNote (note, velocity);
};

// Override if you like to handle touching knobs
AbstractControlSurface.prototype.handleTouch = function (knob, value) {};

AbstractControlSurface.prototype.handleCC = function (cc, value)
{
    if (this.isButton (cc))
    {
        this.buttonStates[cc] = value > 0 ? ButtonEvent.DOWN : ButtonEvent.UP;
        if (this.buttonStates[cc] == ButtonEvent.DOWN)
        {
            scheduleTask (function (object, buttonID)
            {
                object.checkButtonState (buttonID);
            }, [this, cc], AbstractControlSurface.buttonStateInterval);
        }

        // If consumed flag is set ignore the UP event
        if (this.buttonStates[cc] == ButtonEvent.UP && this.buttonConsumed[cc])
        {
            this.buttonConsumed[cc] = false;
            return;
        }
    }

    this.handleEvent (cc, value);
};

/**
 * Override in subclass with buttons array usage
 * @param cc
 * @param value
 */
AbstractControlSurface.prototype.handleEvent = function (cc, value) {};

AbstractControlSurface.prototype.isButton = function (cc)
{
    return typeof (this.buttonStates[cc]) != 'undefined';
};

AbstractControlSurface.prototype.setButtonConsumed = function (buttonID)
{
    this.buttonConsumed[buttonID] = true;
};

AbstractControlSurface.prototype.checkButtonState = function (buttonID)
{
    if (this.buttonStates[buttonID] != ButtonEvent.DOWN)
        return;

    this.buttonStates[buttonID] = ButtonEvent.LONG;
    this.handleEvent (buttonID, 127);
};

AbstractControlSurface.prototype.isGridNote = function (note)
{
    if (this.gridNotes && this.gridNotes.length > 0)
        return note >= this.gridNotes[0] && note <= this.gridNotes[this.gridNotes.length - 1];
    return false;
};

AbstractControlSurface.prototype.getFractionValue = function ()
{
    return this.isShiftPressed () ? Config.fractionMinValue : Config.fractionValue;
};

AbstractControlSurface.prototype.changeValue = function (control, value)
{
    return changeValue (control, value, this.getFractionValue (), Config.maxParameterValue);
};
