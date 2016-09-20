// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;

    AbstractView.call (this, model);

    this.resolutions    = [ 1, 2/3, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12 ];
    this.resolutionsStr = [ "1/4", "1/4t", "1/8", "1/8t", "1/16", "1/16t", "1/32", "1/32t" ];
    this.selectedIndex  = 4;
    this.scales = this.model.getScales ();

    this.offsetX = 0;
    this.offsetY = 0;

    this.clip = this.model.createCursorClip (cols, rows);
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
}
AbstractSequencerView.prototype = new AbstractView ();

AbstractSequencerView.prototype.scrollLeft = function (event)
{
    var newOffset = this.offsetX - this.clip.getStepSize ();
    if (newOffset < 0)
        this.offsetX = 0;
    else
    {
        this.offsetX = newOffset;
        this.clip.scrollStepsPageBackwards ();
    }
};

AbstractSequencerView.prototype.scrollRight = function (event)
{
    this.offsetX = this.offsetX + this.clip.getStepSize ();
    this.clip.scrollStepsPageForward ();
};

AbstractSequencerView.prototype.onScene = function (index, event)
{
    if (!event.isDown () || !this.model.canSelectedTrackHoldNotes ())
        return;
    this.selectedIndex = 7 - index;
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
    displayNotification (this.resolutionsStr[this.selectedIndex]);
};

AbstractSequencerView.prototype.isInXRange = function (x)
{
    return x >= this.offsetX && x < this.offsetX + this.clip.getStepSize ();
};
