
function ControlSurfaceConfig (model, input, output, buttons, gridNotes)
{
    this.model = model;
    this.input = input;
    this.output = output;
    this.buttons = buttons;
    this.gridNotes = gridNotes;

    this.selectButtonId = -1;
    this.shiftButtonId = -1;
    this.display = null;
}

function ControlSurface ()
{
    this.model = null;
    this.input = null;
    this.output = null;
    this.buttons = null;
    this.gridNotes = null;

    this.selectButtonId = -1;
    this.shiftButtonId = -1;

    this.noteInput = null;

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

    this.display = null;

    // Button related
    this.buttons = [];
    this.buttonStates = [];
}

ControlSurface.buttonStateInterval = 400;

ControlSurface.prototype.configure = function (config)
{
    this.model = config.model;
    this.input = config.input;
    this.output = config.output;
    this.buttons = config.buttons;
    this.gridNotes = config.gridNotes;

    this.selectButtonId = config.selectButtonId;
    this.shiftButtonId = config.shiftButtonId;
    this.display = config.display;

    this.input.init ();
    this.input.setMidiCallback (doObject (this, this.handleMidi));

    this.noteInput = this.input.createNoteInput ();

    for (var i = 0; i < this.buttons.length; i++)
        this.buttonStates[this.buttons[i]] = ButtonEvent.UP;
};

//--------------------------------------
// Display
//--------------------------------------

ControlSurface.prototype.setButton = function (button, state)
{
    this.output.sendCC (button, state);
};

ControlSurface.prototype.flush = function ()
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
        }), null, 5);
    }
    //this.redrawGrid ();
}

ControlSurface.prototype.shutdown = function ()
{
};

ControlSurface.prototype.scheduledFlush = function ()
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

ControlSurface.prototype.addView = function (viewId, view)
{
    view.attachTo (this);
    // TODO is this correct?
    view.model = this.model;
    this.views[viewId] = view;
};

ControlSurface.prototype.setActiveView = function (viewId)
{
    this.activeViewId = viewId;

    var view = this.getActiveView ();
    if (view == null)
    {
        this.turnOff ();
        return;
    }

    this.updateButtons();

    view.onActivate ();
};

ControlSurface.prototype.updateButtons = function ()
{
    //    for (var i = 0; i < this.buttons.length; i++)
    //        this.setButton (this.buttons[i], view.usesButton (this.buttons[i]) ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);
}

ControlSurface.prototype.getActiveView = function ()
{
    if (this.activeViewId < 0)
        return null;
    var view = this.views[this.activeViewId];
    return view ? view : null;
};

ControlSurface.prototype.isActiveView = function (viewId)
{
    return this.activeViewId == viewId;
};

//--------------------------------------
// ModeState
//--------------------------------------

ControlSurface.prototype.addMode = function (modeId, mode)
{
    mode.attachTo (this);
    this.modes[modeId] = mode;
};

// listener must be a 2 parameter function: [int] oldMode, [int] newMode
ControlSurface.prototype.addModeListener = function (listener)
{
    this.modeListeners.push (listener);
};

ControlSurface.prototype.setDefaultMode = function (mode)
{
    this.defaultMode = mode;
    if (this.currentMode == null)
        this.currentMode = this.defaultMode;
    if (this.previousMode == null)
        this.previousMode = this.defaultMode;
};

ControlSurface.prototype.setPendingMode = function (mode)
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
}

ControlSurface.prototype.getPreviousMode = function ()
{
    return this.previousMode;
};

ControlSurface.prototype.getCurrentMode = function ()
{
    return this.currentMode;
};

ControlSurface.prototype.getActiveMode = function ()
{
    if (this.activeModeId < 0)
        return null;
    var mode = this.modes[this.activeModeId];
    return mode ? mode : null;
};

ControlSurface.prototype.setActiveMode = function (modeId)
{
    this.activeModeId = modeId;

    var mode = this.getActiveMode ();
    if (mode == null)
        return;

    mode.onActivate ();
};

ControlSurface.prototype.isActiveMode = function (modeId)
{
    return this.activeModeId == modeId;
};

ControlSurface.prototype.getMode = function (modeId)
{
    return this.modes[modeId];
};

//--------------------------------------
// Gesture
//--------------------------------------

ControlSurface.prototype.isSelectPressed = function ()
{
    return this.isPressed (this.selectButtonId);
};

ControlSurface.prototype.isShiftPressed = function ()
{
    return this.isPressed (this.shiftButtonId);
};

ControlSurface.prototype.isPressed = function (button)
{
    return this.buttonStates[button] != ButtonEvent.UP;
};

//--------------------------------------
// Handlers
//--------------------------------------

ControlSurface.prototype.handleMidi = function (status, data1, data2)
{
    //println(MIDIChannel(status));
    var channel = MIDIChannel (status);
    if (!this.isActiveMode (channel))
    {
        this.setActiveMode (channel);
        this.scheduledFlush ();
    }

    switch (status & 0xF0)
    {
        case 0x80:
        case 0x90:
            if (this.isGridNote (data1))
                this.handleGrid (data1, data2);
            else
                this.handleTouch (data1, data2);
            break;

        case 0xB0:
            this.handleCC (data1, data2);
            break;
    }
};

ControlSurface.prototype.handleGrid = function (note, velocity)
{
    var view = this.getActiveView ();
    if (view != null)
        view.onGrid (note, velocity);
};

ControlSurface.prototype.handleTouch = function (knob, value) {
    var view = this.getActiveView();
    if (view == null)
        return;

    switch (knob) {
    }
};

ControlSurface.prototype.handleCC = function (cc, value)
{
    if (this.isButton (cc))
    {
        this.buttonStates[cc] = value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP;
        if (this.buttonStates[cc] == ButtonEvent.DOWN)
        {
            scheduleTask (function (object, buttonID)
            {
                object.checkButtonState (buttonID);
            }, [this, cc], ControlSurface.buttonStateInterval);
        }
    }

    this.handleEvent (cc, value);
};

/**
 * Override in subclass with buttons array usage
 * @param cc
 * @param value
 */
ControlSurface.prototype.handleEvent = function (cc, value) {};

ControlSurface.prototype.isButton = function (cc)
{
    return typeof (this.buttonStates[cc]) != 'undefined';
};

ControlSurface.prototype.checkButtonState = function (buttonID)
{
    if (this.buttonStates[buttonID] != ButtonEvent.DOWN)
        return;

    this.buttonStates[buttonID] = ButtonEvent.LONG;
    this.handleEvent (buttonID, 127);
};

ControlSurface.prototype.isGridNote = function (note)
{
    return this.gridNotes[note -12] != null;
};

ControlSurface.prototype.getFractionValue = function ()
{
    return this.isShiftPressed () ? Config.fractionMinValue : Config.fractionValue;
};

ControlSurface.prototype.changeValue = function (control, value)
{
    return changeValue (control, value, this.getFractionValue (), Config.maxParameterValue);
}