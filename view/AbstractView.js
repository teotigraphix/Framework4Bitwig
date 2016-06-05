// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

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
    this.scrollerInterval = 100;

    this.scrollerTask = new TimerTask (this, null, this.scrollerInterval);
}

AbstractView.prototype.attachTo = function (surface)
{
    this.surface = surface;
};

AbstractView.prototype.usesButton = function (buttonID)
{
    return true;
};

AbstractView.prototype.drawGrid = function () {};

AbstractView.prototype.onGridNote = function (note, velocity) {};

AbstractView.prototype.onActivate = function ()
{
    this.updateNoteMapping ();
};

AbstractView.prototype.onChannelAftertouch = function (value) {};

AbstractView.prototype.onPolyAftertouch = function (note, value) {};

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
    this.handleScroller (event, this.scrollUp);
};

AbstractView.prototype.onDown = function (event)
{
    this.handleScroller (event, this.scrollDown);
};

AbstractView.prototype.onLeft = function (event)
{
    this.handleScroller (event, this.scrollLeft);
};

AbstractView.prototype.onRight = function (event)
{
    this.handleScroller (event, this.scrollRight);
};

AbstractView.prototype.handleScroller = function (event, method)
{
    if (event.isDown ())
        method.call (this, event);
    else if (event.isLong ())
    {
        this.scrollerTask.stop ();
        this.scrollerTask.callback = method;
        this.scrollerTask.start ([event]);
    }
    else if (event.isUp ())
        this.scrollerTask.stop ();
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
    this.model.getCurrentTrackBank ().select (index);
};

AbstractView.prototype.updateButtons = function () {};

AbstractView.prototype.updateArrows = function () {};

AbstractView.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (initArray (-1, 128));
};

AbstractView.prototype.doubleClickTest = function ()
{
    this.restartFlag = true;
    scheduleTask (doObject (this, function ()
    {
        this.restartFlag = false;
    }), null, 250);
};
