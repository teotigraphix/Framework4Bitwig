// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractMode (model)
{
    this.model = model;
    this.id = null;
    // True if a specific mode always needs the 2nd button row
    this.hasSecondRowPriority = true;
    this.isTemporary = true;
}

AbstractMode.prototype.attachTo = function (surface)
{
    this.surface = surface;
};

AbstractMode.prototype.getId = function ()
{
    return this.id;
};

AbstractMode.prototype.onActivate = function () {};
AbstractMode.prototype.onValueKnob = function (index, value) {};
AbstractMode.prototype.onValueKnobTouch = function (index, isTouched) {};

AbstractMode.prototype.onFirstRow = function (index)
{
    this.model.getTrackBank ().select (index);
};

AbstractMode.prototype.onSecondRow = function (index) {};

AbstractMode.prototype.updateDisplay = function () {};

AbstractMode.prototype.updateFirstRow = function () {};

AbstractMode.prototype.updateSecondRow = function () {};

AbstractMode.prototype.drawTrackNames = function ()
{
    var tb = this.model.getTrackBank ();
    var selTrack = tb.getSelectedTrack ();
    
    // Format track names
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var d = this.surface.getDisplay ();
    for (var i = 0; i < 8; i++)
    {
        var isSel = i == selIndex;
        var t = tb.getTrack (i);
        var n = optimizeName (t.name, isSel ? 7 : 8);
        d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
    }
    d.done (3);
};