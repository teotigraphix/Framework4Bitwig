// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt


AbstractRaindropsView.NUM_DISPLAY_ROWS = 8;
AbstractRaindropsView.NUM_DISPLAY_COLS = 8;
AbstractRaindropsView.NUM_OCTAVE       = 12;
AbstractRaindropsView.START_KEY        = 36;

function AbstractRaindropsView (model)
{
    if (!model) // Called on first prototype creation
        return;
    AbstractSequencerView.call (this, model, 128, 32 * 16 /* Biggest number in Fixed Length */);
    this.offsetY = AbstractRaindropsView.START_KEY;
    this.clip.scrollTo (0, AbstractRaindropsView.START_KEY);
    
    this.canScrollUp = false;
    this.canScrollDown = false;
    this.ongoingResolutionChange = false;
}
AbstractRaindropsView.prototype = new AbstractSequencerView ();

AbstractRaindropsView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

AbstractRaindropsView.prototype.updateArrowStates = function ()
{
    this.canScrollLeft = this.offsetY - AbstractRaindropsView.NUM_OCTAVE >= 0;
    this.canScrollRight = this.offsetY + AbstractRaindropsView.NUM_OCTAVE <= this.clip.getRowSize () - AbstractRaindropsView.NUM_OCTAVE;
};

AbstractRaindropsView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

AbstractRaindropsView.prototype.updateScale = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () ? this.scales.getSequencerMatrix (AbstractRaindropsView.NUM_DISPLAY_COLS, this.offsetY) : this.scales.getEmptyMatrix ();
};

AbstractRaindropsView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes ())
        return;
    if (velocity == 0)
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);
    var stepsize = y == 0 ? 1 : 2 * y;

    var length = this.clip.getLoopLength () / this.resolutions[this.selectedIndex];
    var distance = this.getNoteDistance (this.noteMap[x], length);
    this.clip.clearRow (this.noteMap[x]);
    if (distance == -1 || distance != (y == 0 ? 1 : y * 2))
    {
        var offset = this.clip.getCurrentStep () % stepsize;
        for (var i = offset; i < length; i += stepsize)
            this.clip.setStep (i, this.noteMap[x], Config.accentActive ? Config.fixedAccentValue : velocity, this.resolutions[this.selectedIndex]);
    }
};

AbstractRaindropsView.prototype.scrollRight = function (event)
{
    this.offsetY = Math.min (this.clip.getRowSize () - AbstractRaindropsView.NUM_OCTAVE, this.offsetY + AbstractRaindropsView.NUM_OCTAVE);
    this.updateScale ();
    displayNotification (this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

AbstractRaindropsView.prototype.scrollLeft = function (event)
{
    this.offsetY = Math.max (0, this.offsetY - AbstractRaindropsView.NUM_OCTAVE);
    this.updateScale ();
    displayNotification (this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[7]));
};

AbstractRaindropsView.prototype.drawGrid = function ()
{
    if (!this.model.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }
    
    if (this.ongoingResolutionChange)
        return;

    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();

    var length = this.clip.getLoopLength () / this.resolutions[this.selectedIndex];
    var step = this.clip.getCurrentStep ();
    for (var x = 0; x < AbstractRaindropsView.NUM_DISPLAY_COLS; x++)
    {
        var left = this.getNoteDistanceToTheLeft (this.noteMap[x], step, length);
        var right = this.getNoteDistanceToTheRight (this.noteMap[x], step, length);
        var isOn = left >= 0 && right >= 0;
        var sum = left + right;
        var distance = sum == 0 ? 0 : (sum + 1) / 2;

        for (var y = 0; y < AbstractRaindropsView.NUM_DISPLAY_ROWS; y++)
        {
            var color = y == 0 ? this.getColor (x, selectedTrack) : AbstractSequencerView.COLOR_NO_CONTENT;
            if (isOn)
            {
                if (y == distance)
                    color = AbstractSequencerView.COLOR_CONTENT;
                if ((left <= distance && y == left) || (left > distance && y == sum - left))
                    color = AbstractSequencerView.COLOR_STEP_HILITE_NO_CONTENT;
            }
            this.surface.pads.lightEx (x, AbstractRaindropsView.NUM_DISPLAY_ROWS - 1 - y, color, null, false);
        }
    }
};

AbstractRaindropsView.prototype.getNoteDistance = function (row, length)
{
    var step = 0;
    for (step = 0; step < length; step++)
    {
        if (this.clip.getStep (step, row))
            break;
    }
    if (step >= length)
        return -1;
    for (var step2 = step + 1; step2 < length; step2++)
    {
        if (this.clip.getStep (step2, row))
            return step2 - step;
    }
    return -1;
};

AbstractRaindropsView.prototype.getNoteDistanceToTheRight = function (row, start, length)
{
    if (start < 0 || start >= length)
        return -1;
    var step = start;
    var counter = 0;
    do
    {
        if (this.clip.getStep (step, row))
            return counter;
        step++;
        counter++;
        if (step >= length)
            step = 0;
    } while (step != start);
    return -1;
};

AbstractRaindropsView.prototype.getNoteDistanceToTheLeft = function (row, start, length)
{
    if (start < 0 || start >= length)
        return -1;
    start = start == 0 ? length - 1 : start - 1;
    var step = start;
    var counter = 0;
    do
    {
        if (this.clip.getStep (step, row))
            return counter;
        step--;
        counter++;
        if (step < 0)
            step = length - 1;
    } while (step != start);
    return -1;
};

AbstractRaindropsView.prototype.onScene = function (index, event)
{
    if (!event.isDown ())
        return;
    this.ongoingResolutionChange = true;
    AbstractSequencerView.prototype.onScene.call (this, index, event);
    this.ongoingResolutionChange = false;    
};

AbstractRaindropsView.prototype.onOctaveDown = function (event)
{
    if (event.isDown ())
        this.scrollLeft (event);
};

AbstractRaindropsView.prototype.onOctaveUp = function (event)
{
    if (event.isDown ())
        this.scrollRight (event);
};
