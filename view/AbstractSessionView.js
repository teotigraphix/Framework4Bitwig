// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Needs to be overwritten with device specific colors
AbstractSessionView.CLIP_COLOR_IS_RECORDING        = { color: 0, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_IS_RECORDING_QUEUED = { color: 1, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_IS_PLAYING          = { color: 2, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_IS_PLAYING_QUEUED   = { color: 3, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_HAS_CONTENT         = { color: 4, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_NO_CONTENT          = { color: 5, blink: null, fast: false };
AbstractSessionView.CLIP_COLOR_RECORDING_ARMED     = { color: 6, blink: null, fast: false };
AbstractSessionView.USE_CLIP_COLOR                 = true;


function AbstractSessionView (model, rows, columns)
{
    AbstractView.call (this, model);
    
    this.rows = rows;
    this.columns = columns;

    this.flip = false;

    this.scrollerInterval = Config.sceneScrollInterval;
    this.isTemporary = false;
}
AbstractSessionView.prototype = new AbstractView ();

AbstractSessionView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);

    this.model.getCurrentTrackBank ().setIndication (true);
    this.drawSceneButtons ();
};

AbstractSessionView.prototype.updateArrows = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = this.flip ? tb.canScrollTracksUp () : tb.canScrollScenesDown ();
    this.canScrollDown = this.flip ? tb.canScrollTracksDown () : tb.canScrollScenesUp ();
    this.canScrollLeft = this.flip ? tb.canScrollScenesDown () : tb.canScrollTracksUp ();
    this.canScrollRight = this.flip ? tb.canScrollScenesUp () : tb.canScrollTracksDown ();
    AbstractView.prototype.updateArrows.call (this);
    // Flipped scene buttons are not updated unless we redraw them here
    this.drawSceneButtons ();
};

// note is expected to be from 36 to 100
AbstractSessionView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;

    var index = note - 36;
    var t = index % this.columns;
    var s = (this.rows - 1) - Math.floor (index / this.columns);

    if (this.flip)
    {
        var dummy = t;
        t = s;
        s = dummy;
    }

    var tb = this.model.getCurrentTrackBank ();
    var slot = tb.getTrack (t).slots[s];
    var slots = tb.getClipLauncherSlots (t);
    
    if (!this.surface.isSelectPressed ())
    {
        if (tb.getTrack (t).recarm)
        {
            if (slot.isRecording)
                slots.launch (s);
            else
                slots.record (s);
        }
        else
            slots.launch (s);
    }
    slots.select (s);
    
    /* TODO Focus must be on clip launcher!
    
    if (this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getApplication ().deleteSelection ();
    }*/
};

AbstractSessionView.prototype.scrollLeft = function (event)
{
    var tb = this.model.getCurrentTrackBank ();
    if (this.flip)
    {
        if (this.surface.isShiftPressed ())
            tb.scrollScenesPageUp ();
        else
            tb.scrollScenesUp ();
    }
    else
    {
        if (this.surface.isShiftPressed ())
            tb.scrollTracksPageUp ();
        else
            tb.scrollTracksUp ();
    }
};

AbstractSessionView.prototype.scrollRight = function (event)
{
    var tb = this.model.getCurrentTrackBank ();
    if (this.flip)
    {
        if (this.surface.isShiftPressed ())
            tb.scrollScenesPageDown ();
        else
            tb.scrollScenesDown ();
    }
    else
    {
        if (this.surface.isShiftPressed ())
            tb.scrollTracksPageDown ();
        else
            tb.scrollTracksDown ();
    }
};

AbstractSessionView.prototype.scrollUp = function (event)
{
    var tb = this.model.getCurrentTrackBank ();
    if (this.flip)
    {
        if (this.surface.isShiftPressed ())
            tb.scrollTracksPageUp ();
        else
            tb.scrollTracksUp ();
    }
    else
    {
        if (this.surface.isShiftPressed ())
            tb.scrollScenesPageUp ();
        else
            tb.scrollScenesUp ();
    }
};

AbstractSessionView.prototype.scrollDown = function (event)
{
    var tb = this.model.getCurrentTrackBank ();
    if (this.flip)
    {
        if (this.surface.isShiftPressed ())
            tb.scrollTracksPageDown ();
        else
            tb.scrollTracksDown ();
    }
    else
    {
        if (this.surface.isShiftPressed ())
            tb.scrollScenesPageDown ();
        else
            tb.scrollScenesDown ();
    }
};

AbstractSessionView.prototype.drawGrid = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var x = 0; x < this.columns; x++)
    {
        var t = tb.getTrack (x);
        for (var y = 0; y < this.rows; y++)
            this.drawPad (t.slots[y], this.flip ? y : x, this.flip ? x : y, t.recarm);
    }
};

AbstractSessionView.prototype.drawPad = function (slot, x, y, isArmed)
{
    var color;
    if (slot.isRecording)
        color = slot.isQueued ? AbstractSessionView.CLIP_COLOR_IS_RECORDING_QUEUED : AbstractSessionView.CLIP_COLOR_IS_RECORDING;
    else if (slot.isPlaying)
    {
        if (AbstractSessionView.USE_CLIP_COLOR && slot.color)
            color = { color: slot.color, blink: AbstractSessionView.CLIP_COLOR_IS_PLAYING.blink, fast: AbstractSessionView.CLIP_COLOR_IS_PLAYING.fast };
        else
            color = AbstractSessionView.CLIP_COLOR_IS_PLAYING;
    }
    else if (slot.isQueued)
    {
        if (AbstractSessionView.USE_CLIP_COLOR && slot.color)
            color = { color: slot.color, blink: AbstractSessionView.CLIP_COLOR_IS_PLAYING_QUEUED.blink, fast: AbstractSessionView.CLIP_COLOR_IS_PLAYING_QUEUED.fast };
        else
            color = AbstractSessionView.CLIP_COLOR_IS_PLAYING_QUEUED;
    }
    else if (slot.hasContent)
    {
        if (AbstractSessionView.USE_CLIP_COLOR && slot.color)
            color = { color: slot.color, blink: AbstractSessionView.CLIP_COLOR_HAS_CONTENT.blink, fast: AbstractSessionView.CLIP_COLOR_HAS_CONTENT.fast };
        else
            color = AbstractSessionView.CLIP_COLOR_HAS_CONTENT;
    }
    else if (isArmed)
        color = AbstractSessionView.CLIP_COLOR_RECORDING_ARMED;
    else
        color = AbstractSessionView.CLIP_COLOR_NO_CONTENT;

    this.surface.pads.lightEx (x, y, color.color, color.blink, color.fast);
};
