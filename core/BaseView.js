// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseView ()
{
    this.surface = null;

    this.canScrollLeft  = true;
    this.canScrollRight = true;
    this.canScrollUp    = true;
    this.canScrollDown  = true;

    this.restartFlag   = false;
//    this.stopPressed   = false;

    // override in subclass with specific Config value
    // TODO Eventually needs to listen to a config property change
    this.scrollerInterval = 100;

    this.scrollerLeft = new TimerTask (this, this.scrollLeft, this.scrollerInterval);
    this.scrollerRight = new TimerTask (this, this.scrollRight, this.scrollerInterval);
    this.scrollerUp = new TimerTask (this, this.scrollUp, this.scrollerInterval);
    this.scrollerDown = new TimerTask (this, this.scrollDown, this.scrollerInterval);
}
BaseView.prototype = new View ();

// BaseView.lastNoteView = VIEW_PLAY;

BaseView.prototype.onActivate = function ()
{
    this.updateNoteMapping ();
};

BaseView.prototype.updateDevice = function ()
{
    var m = this.surface.getActiveMode ();
    if (m != null)
    {
        m.updateDisplay ();
        m.updateFirstRow ();
        m.updateSecondRow ();
    }
    this.updateButtons ();
    this.updateArrows ();
};

//--------------------------------------
// Group 1
//--------------------------------------

// BaseView.prototype.onPlay = function (event)
// BaseView.prototype.onRecord = function (event)
// BaseView.prototype.onNew = function (event)
// BaseView.prototype.onDuplicate = function (event)
// BaseView.prototype.onAutomation = function (event)
// BaseView.prototype.onFixedLength = function (event)

//--------------------------------------
// Group 2
//--------------------------------------

// BaseView.prototype.onQuantize = function (event)
// BaseView.prototype.onDouble = function (event)
// BaseView.prototype.onDelete = function (event)
// BaseView.prototype.onUndo = function (event)

//--------------------------------------
// Group 3
//--------------------------------------

// BaseView.prototype.onSmallKnob1 = function (increase)
// BaseView.prototype.onSmallKnob1Touch = function (isTouched)
// BaseView.prototype.onSmallKnob2 = function (increase)

// BaseView.prototype.onSmallKnob2Touch = function (isTouched) {};

//--------------------------------------
// Group 4
//--------------------------------------

// BaseView.prototype.onMetronome = function (event)
// BaseView.prototype.onTapTempo = function (event)

//--------------------------------------
// Group 5
//--------------------------------------

BaseView.prototype.onValueKnob = function (index, value)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnob (index, value);
};

// BaseView.prototype.onValueKnobTouch = function (knob, isTouched) {};

// BaseView.prototype.onValueKnob9 = function (value)
// BaseView.prototype.onValueKnob9Touch = function (isTouched)

BaseView.prototype.onFirstRow = function (event, index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onTopRow (event, index);
};

// BaseView.prototype.onSecondRow = function (index)

//--------------------------------------
// Group 6
//--------------------------------------

// BaseView.prototype.onMaster = function (event)
// BaseView.prototype.onStop = function (event)

// BaseView.prototype.onScene = function (index) {};

//--------------------------------------
// Group 7
//--------------------------------------

// BaseView.prototype.onVolume = function (event)
// BaseView.prototype.onPanAndSend = function (event)
// BaseView.prototype.onTrack = function (event)

// BaseView.prototype.onClip = function (event) {};

// BaseView.prototype.onDevice = function (event)
// BaseView.prototype.onBrowse = function (event)

//--------------------------------------
// Group 8
//--------------------------------------

// BaseView.prototype.onDeviceLeft = function (event)
// BaseView.prototype.onDeviceRight = function (event)
// BaseView.prototype.onMute = function (event)
// BaseView.prototype.onSolo = function (event)
// BaseView.prototype.onScales = function (event)

// BaseView.prototype.onUser = function (event) {};

// BaseView.prototype.onRepeat = function (event) {};

// BaseView.prototype.onAccent = function (event)

// BaseView.prototype.onOctaveDown = function (event) {};

// BaseView.prototype.onOctaveUp = function (event) {};

//--------------------------------------
// Group 9
//--------------------------------------

// BaseView.prototype.onAddEffect = function (event)
// BaseView.prototype.onAddTrack = function (event)
// BaseView.prototype.onNote = function (event)
// BaseView.prototype.onSession = function (event)

// BaseView.prototype.onSelect = function (event) {};

// BaseView.prototype.onShift = function (event)

//--------------------------------------
// Group 10
//--------------------------------------

BaseView.prototype.onUp = function (event)
{
    if (event.isDown ())
    {
        this.scrollUp (event);
    }
    else if (event.isLong ())
    {
        this.scrollerUp.start ([event]);
    }
    else if (event.isUp ())
    {
        this.scrollerUp.stop ();
    }
};

BaseView.prototype.onDown = function (event)
{
    if (event.isDown ())
    {
        this.scrollDown (event);
    }
    else if (event.isLong ())
    {
        this.scrollerDown.start ([event]);
    }
    else if (event.isUp ())
    {
        this.scrollerDown.stop ();
    }
};

BaseView.prototype.onLeft = function (event)
{
    if (event.isDown ())
    {
        this.scrollLeft (event);
    }
    else if (event.isLong ())
    {
        this.scrollerLeft.start ([event]);
    }
    else if (event.isUp ())
    {
        this.scrollerLeft.stop ();
    }
};

BaseView.prototype.onRight = function (event)
{
    if (event.isDown ())
    {
        this.scrollRight (event);
    }
    else if (event.isLong ())
    {
        this.scrollerRight.start ([event]);
    }
    else if (event.isUp ())
    {
        this.scrollerRight.stop ();
    }
};

//--------------------------------------
// Group 11
//--------------------------------------

// BaseView.prototype.onFootswitch1 = function (value) {};

// BaseView.prototype.onFootswitch2 = function (value)

//--------------------------------------
// Protected API
//--------------------------------------

// implemented for Arrow scrolling in subclass Views
BaseView.prototype.scrollUp = function (event) {};
BaseView.prototype.scrollDown = function (event) {};
BaseView.prototype.scrollLeft = function (event) {};
BaseView.prototype.scrollRight = function (event) {};

BaseView.prototype.selectTrack = function (index)
{
    this.model.getTrackBank ().select (index);
};

BaseView.prototype.updateButtons = function ()
{
    var tb = this.model.getTrackBank ();
    var isMuteState = tb.isMuteState ();
//    this.surface.setButton (PUSH_BUTTON_MUTE, isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
//    this.surface.setButton (PUSH_BUTTON_SOLO, !isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.updateArrows = function ()
{
//    this.surface.setButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

// TODO this really belong here?
BaseView.prototype.getSelectedSlot = function (track)
{
    for (var i = 0; i < track.slots.length; i++)
        if (track.slots[i].isSelected)
            return i;
    return -1;
};

BaseView.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (initArray (-1, 128));
};

BaseView.prototype.turnOffBlink = function ()
{
//    for (var i = 36; i < 100; i++)
//        this.push.pads.blink (i, PUSH_COLOR_BLACK);
};

BaseView.prototype.doubleClickTest = function ()
{
    this.restartFlag = true;
    scheduleTask (doObject (this, function ()
    {
        this.restartFlag = false;
    }), null, 250);
};
