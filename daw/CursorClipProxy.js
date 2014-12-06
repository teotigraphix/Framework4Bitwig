// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorClipProxy (stepSize, rowSize)
{
    this.stepSize    = stepSize;
    this.rowSize     = rowSize;
    this.step        = -1;
    this.playStart   = 0.0;
    this.playEnd     = 4.0;
    this.loopStart   = 0.0;
    this.loopLength  = 4.0;
    this.loopEnabled = true;
    this.shuffle     = true;
    this.accent      = 0;

    this.data = [];
    for (var step = 0; step < this.stepSize; step++)
        this.data[step] = initArray (false, this.rowSize);

    this.clip = host.createCursorClip (this.stepSize, this.rowSize);
    this.clip.addPlayingStepObserver (doObject (this, CursorClipProxy.prototype.handlePlayingStep));
    this.clip.addStepDataObserver (doObject (this, CursorClipProxy.prototype.handleStepData));
    
    this.clip.getPlayStart ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handlePlayStart));
    this.clip.getPlayStop ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handlePlayStop));
    this.clip.getLoopStart ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handleLoopStart));
    this.clip.getLoopLength ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handleLoopLength));
    this.clip.isLoopEnabled ().addValueObserver (doObject (this, CursorClipProxy.prototype.handleLoopEnabled));
    this.clip.getShuffle ().addValueObserver (doObject (this, CursorClipProxy.prototype.handleShuffle));
    this.clip.getAccent ().addRawValueObserver (doObject (this, CursorClipProxy.prototype.handleAccent));
}

CursorClipProxy.prototype.getPlayStart = function ()
{
    return this.playStart;
};

CursorClipProxy.prototype.setPlayStart = function (start)
{
    this.clip.getPlayStart ().setRaw (start);
};

CursorClipProxy.prototype.setPlayEnd = function (end)
{
    this.clip.getPlayStop ().setRaw (end);
};

CursorClipProxy.prototype.setPlayRange = function (start, end)
{
    // Need to distinguish if we move left or right since the start and 
    // end cannot be the same value
    if (this.getPlayStart () < start)
    {
        this.setPlayEnd (end);
        this.setPlayStart (start);
    }
    else
    {
        this.setPlayStart (start);
        this.setPlayEnd (end);
    }
};

CursorClipProxy.prototype.changePlayStart = function (value, fractionValue)
{
    this.playStart = Math.min (this.playEnd, changeValue (value, this.playStart, fractionValue, Number.MAX_VALUE));
    this.setPlayStart (this.playStart);
};

CursorClipProxy.prototype.getPlayEnd = function ()
{
    return this.playEnd;
};

CursorClipProxy.prototype.changePlayEnd = function (value, fractionValue)
{
    this.playEnd = Math.max (this.playStart, changeValue (value, this.playEnd, fractionValue, Number.MAX_VALUE));
    if (this.loopEnabled)
        this.playEnd = Math.min (this.loopStart + this.loopLength, this.playEnd);
    this.setPlayEnd (this.playEnd);
};

CursorClipProxy.prototype.getLoopStart = function ()
{
    return this.loopStart;
};

CursorClipProxy.prototype.setLoopStart = function (start)
{
    this.clip.getLoopStart ().setRaw (start);
};

CursorClipProxy.prototype.changeLoopStart = function (value, fractionValue)
{
    this.loopStart = changeValue (value, this.loopStart, fractionValue, Number.MAX_VALUE);
    this.setLoopStart (this.loopStart);
};

CursorClipProxy.prototype.getLoopLength = function ()
{
    return this.loopLength;
};

CursorClipProxy.prototype.setLoopLength = function (length)
{
    this.clip.getLoopLength ().setRaw (length);
};

CursorClipProxy.prototype.changeLoopLength = function (value, fractionValue)
{
    this.loopLength = changeValue (value, this.loopLength, fractionValue, Number.MAX_VALUE);
    this.setLoopLength (this.loopLength);
};

CursorClipProxy.prototype.isLoopEnabled = function ()
{
    return this.loopEnabled;
};

CursorClipProxy.prototype.setLoopEnabled = function (enable)
{
    this.clip.isLoopEnabled ().set (enable);
};

CursorClipProxy.prototype.isShuffleEnabled = function ()
{
    return this.shuffle;
};

CursorClipProxy.prototype.setShuffleEnabled = function (enable)
{
    this.clip.getShuffle ().set (enable);
};

CursorClipProxy.prototype.getAccent = function ()
{
    var value = Math.round (this.accent * 10000) / 100;
    return value + "%";
};

CursorClipProxy.prototype.changeAccent = function (value, fractionValue)
{
    this.accent = Math.max (-1, changeValue (value, this.accent, fractionValue / 100, 1, -1));
    this.clip.getAccent ().setRaw (this.accent);
};

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
    if (typeof (this.data[step]) == 'undefined' || typeof (this.data[step][row]) == 'undefined')
    {
        host.errorln ("Attempt to get undefined step data: " + step + " : " + row);
        return false;
    }
    return this.data[step][row];
};

CursorClipProxy.prototype.toggleStep = function (step, row, velocity)
{
    this.clip.toggleStep (step, row, velocity);
};

CursorClipProxy.prototype.setStep = function (step, row, velocity, duration)
{
    this.clip.setStep (step, row, velocity, duration);
};

CursorClipProxy.prototype.clearRow = function (row)
{
    // Can be calculated but it is complicated:
    //   var quartersPerPad = this.model.getQuartersPerMeasure ();
    //   var stepsPerMeasure = Math.round (quartersPerPad / this.resolutions[this.selectedIndex]);
    //   var numOfSteps = this.playEnd * stepsPerMeasure;
    
    // We suggest a maximum of 32 measures with a resolution of 64 steps each
    // Would be nice to have a dedicated function
    for (var step = 0; step < 64 * 32; step++)
        this.clip.clearStep (step, row);
};

CursorClipProxy.prototype.hasRowData = function (row)
{
    for (var step = 0; step < this.stepSize; step++)
        if (this.data[step][row])
            return true;
    return false;
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

//--------------------------------------
// Callback Handlers
//--------------------------------------

CursorClipProxy.prototype.handlePlayingStep = function (step)
{
    this.step = step;
};
    
CursorClipProxy.prototype.handleStepData = function (col, row, state)
{
    this.data[col][row] = state; // true/false
};

CursorClipProxy.prototype.handlePlayStart = function (position)
{
    this.playStart = position;
};

CursorClipProxy.prototype.handlePlayStop = function (position)
{
    this.playEnd = position;
};

CursorClipProxy.prototype.handleLoopStart = function (position)
{
    this.loopStart = position;
};

CursorClipProxy.prototype.handleLoopLength = function (position)
{
    this.loopLength = position;
};

CursorClipProxy.prototype.handleLoopEnabled = function (enabled)
{
    this.loopEnabled = enabled;
};

CursorClipProxy.prototype.handleShuffle = function (enabled)
{
    this.shuffle = enabled;
};

CursorClipProxy.prototype.handleAccent = function (value)
{
    // In the range of -1 .. 1
    this.accent = value;
};