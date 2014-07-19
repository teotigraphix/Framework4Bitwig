// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseMode (model)
{
    this.model = model;
    this.id = null;
    // True if a specific mode always needs the 2nd button row
    this.hasSecondRowPriority = true;
    this.isTemporary = true;
}

BaseMode.prototype.attachTo = function (surface)
{
    this.surface = surface;
};

BaseMode.prototype.getId = function ()
{
    return this.id;
};

BaseMode.prototype.onActivate = function () {};
BaseMode.prototype.onValueKnob = function (index, value) {};
BaseMode.prototype.onValueKnobTouch = function (index, isTouched) {};

BaseMode.prototype.onFirstRow = function (index)
{
    this.model.getTrackBank ().select (index);
};

BaseMode.prototype.onSecondRow = function (index) {};

BaseMode.prototype.updateDisplay = function () {};

BaseMode.prototype.updateFirstRow = function ()
{
//    var tb = this.model.getTrackBank ();
//    var selTrack = tb.getSelectedTrack ();
//    var selIndex = selTrack == null ? -1 : selTrack.index;
//    for (var i = 0; i < 8; i++)
//    {
//        var isSel = i == selIndex;
//        // Light up selection and record buttons
//        this.push.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
//    }
};

BaseMode.prototype.updateSecondRow = function ()
{
//    var tb = this.model.getTrackBank ();
//    for (var i = 0; i < 8; i++)
//    {
//        var t = tb.getTrack (i);
//        if (!this.hasSecondRowPriority)
//            this.push.setButton (102 + i, t.recarm ? PUSH_COLOR2_RED_LO : PUSH_COLOR2_BLACK);
//    }
};

BaseMode.prototype.drawTrackNames = function ()
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    
    // Format track names
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var d = this.push.display;
    for (var i = 0; i < 8; i++)
    {
        var isSel = i == selIndex;
        var t = tb.getTrack (i);
        var n = optimizeName (t.name, isSel ? 7 : 8);
        d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
    }
    d.done (3);
};