// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function CursorClipProxy (stepSize, rowSize, clip)
{
    this.stepSize = stepSize;
    this.rowSize = rowSize;
    this.step = -1;

    this.data = [];
    for (var y = 0; y < this.rowSize; y++)
        this.data[y] = initArray (false, this.stepSize);

    this.clip = host.createCursorClip (this.stepSize, this.rowSize);

    this.clip.addPlayingStepObserver (doObject (this, function (step)
    {
        this.step = step;
    }));
    
    this.clip.addStepDataObserver (doObject (this, function (column, row, state)
    {
        this.data[column][row] = state;
    }));
}

CursorClipProxy.prototype.getStepSize = function ()
{
    return this.stepSize;
};

CursorClipProxy.prototype.getRowSize = function ()
{
    return this.rowSize;
};

CursorClipProxy.prototype.getCurrentStep = function ()
{
    return this.step;
};

CursorClipProxy.prototype.getStep = function (step, row)
{
    return this.data[step][row];
};

CursorClipProxy.prototype.setStep = function (step, row, velocity)
{
    this.clip.toggleStep (step, row, velocity);
};

CursorClipProxy.prototype.setStepLength = function (length)
{
    this.clip.setStepSize (length);
};

CursorClipProxy.prototype.scrollTo = function (step, row)
{
    this.clip.scrollToKey (row);
    this.clip.scrollToStep (step);
};

CursorClipProxy.prototype.scrollStepsPageBackwards = function ()
{
    this.clip.scrollStepsPageBackwards ();
};

CursorClipProxy.prototype.scrollStepsPageForward = function ()
{
    this.clip.scrollStepsPageForward ();
};
