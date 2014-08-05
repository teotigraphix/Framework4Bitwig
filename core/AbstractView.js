// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractView (model)
{
    this.surface = null;
    this.model = model;

    this.canScrollLeft  = true;
    this.canScrollRight = true;
    this.canScrollUp    = true;
    this.canScrollDown  = true;

    this.restartFlag   = false;

    // Override in subclass with specific Config value
    // TODO Eventually needs to listen to a config property change
    this.scrollerInterval = 100;

    this.scrollerLeft = new TimerTask (this, this.scrollLeft, this.scrollerInterval);
    this.scrollerRight = new TimerTask (this, this.scrollRight, this.scrollerInterval);
    this.scrollerUp = new TimerTask (this, this.scrollUp, this.scrollerInterval);
    this.scrollerDown = new TimerTask (this, this.scrollDown, this.scrollerInterval);
}

AbstractView.prototype.attachTo = function (surface)
{
    this.surface = surface;
};

AbstractView.prototype.usesButton = function (buttonID)
{
    return true;
};

AbstractView.prototype.onActivate = function () {};

AbstractView.prototype.updateDevice = function () {};

AbstractView.prototype.drawGrid = function () {};

AbstractView.prototype.onGridNote = function (note, velocity) {};

AbstractView.prototype.onActivate = function ()
{
    this.updateNoteMapping ();
};

AbstractView.prototype.updateDevice = function ()
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

AbstractView.prototype.onValueKnob = function (index, value)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnob (index, value);
};

AbstractView.prototype.onFirstRow = function (event, index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onTopRow (event, index);
};

AbstractView.prototype.onUp = function (event)
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

AbstractView.prototype.onDown = function (event)
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

AbstractView.prototype.onLeft = function (event)
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

AbstractView.prototype.onRight = function (event)
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
// Protected API
//--------------------------------------

// Implemented for Arrow scrolling in subclass Views
AbstractView.prototype.scrollUp = function (event) {};
AbstractView.prototype.scrollDown = function (event) {};
AbstractView.prototype.scrollLeft = function (event) {};
AbstractView.prototype.scrollRight = function (event) {};

AbstractView.prototype.selectTrack = function (index)
{
    this.model.getTrackBank ().select (index);
};

AbstractView.prototype.updateButtons = function ()
{
    var tb = this.model.getTrackBank ();
    var isMuteState = tb.isMuteState ();
//    this.surface.setButton (PUSH_BUTTON_MUTE, isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
//    this.surface.setButton (PUSH_BUTTON_SOLO, !isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

AbstractView.prototype.updateArrows = function ()
{
//    this.surface.setButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
//    this.surface.setButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

// TODO this really belong here?
AbstractView.prototype.getSelectedSlot = function (track)
{
    for (var i = 0; i < track.slots.length; i++)
        if (track.slots[i].isSelected)
            return i;
    return -1;
};

AbstractView.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (initArray (-1, 128));
};

AbstractView.prototype.turnOffBlink = function ()
{
//    for (var i = 36; i < 100; i++)
//        this.surface.pads.blink (i, PUSH_COLOR_BLACK);
};

AbstractView.prototype.doubleClickTest = function ()
{
    this.restartFlag = true;
    scheduleTask (doObject (this, function ()
    {
        this.restartFlag = false;
    }), null, 250);
};
