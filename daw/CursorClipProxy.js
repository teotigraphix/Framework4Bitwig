// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorClipProxy (stepSize, rowSize)
{
    this.stepSize      = stepSize;
    this.rowSize       = rowSize;
    this.step          = -1;
    this.playStart     = 0.0;
    this.playEnd       = 4.0;
    this.loopStart     = 0.0;
    this.loopLength    = 4.0;
    this.loopEnabled   = true;
    this.shuffle       = true;
    this.accent        = 0;
    this.accentDisplay = 0;

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

CursorClipProxy.prototype.enableObservers = function (enable)
{
    // TODO
    
    this.clip.getPlayStart ().setIsSubscribed (enable);
    this.clip.getPlayStop ().setIsSubscribed (enable);
    this.clip.getLoopStart ().setIsSubscribed (enable);
    this.clip.getLoopLength ().setIsSubscribed (enable);
    this.clip.isLoopEnabled ().setIsSubscribed (enable);
    this.clip.getShuffle ().setIsSubscribed (enable);
    this.clip.getAccent ().setIsSubscribed (enable);
};

CursorClipProxy.prototype.setColor = function (red, green, blue)
{
    this.clip.color ().set (red, green, blue);
};

CursorClipProxy.prototype.getPlayStart = function ()
{
    return this.playStart;
};

CursorClipProxy.prototype.setPlayStart = function (start)
{
    this.clip.getPlayStart ().set (start);
};

CursorClipProxy.prototype.setPlayEnd = function (end)
{
    this.clip.getPlayStop ().set (end);
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
    this.clip.getPlayStart ().inc (calcKnobSpeed (value, fractionValue));
};

CursorClipProxy.prototype.getPlayEnd = function ()
{
    return this.playEnd;
};

CursorClipProxy.prototype.changePlayEnd = function (value, fractionValue)
{
    this.clip.getPlayStop ().inc (calcKnobSpeed (value, fractionValue));
};

CursorClipProxy.prototype.getLoopStart = function ()
{
    return this.loopStart;
};

CursorClipProxy.prototype.setLoopStart = function (start)
{
    this.clip.getLoopStart ().set (start);
};

CursorClipProxy.prototype.changeLoopStart = function (value, fractionValue)
{
    this.clip.getLoopStart ().inc (calcKnobSpeed (value, fractionValue));
};

CursorClipProxy.prototype.getLoopLength = function ()
{
    return this.loopLength;
};

CursorClipProxy.prototype.setLoopLength = function (length)
{
    this.clip.getLoopLength ().set (length);
};

CursorClipProxy.prototype.changeLoopLength = function (value, fractionValue)
{
    this.clip.getLoopLength ().inc (calcKnobSpeed (value, fractionValue));
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
    return (Math.round (this.accent * 10000) / 100) + "%";
};

CursorClipProxy.prototype.resetAccent = function ()
{
    this.clip.getAccent ().set (0.5);
};

CursorClipProxy.prototype.changeAccent = function (value, fractionValue)
{
    this.clip.getAccent ().inc (calcKnobSpeed (value, fractionValue / 100));
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
    if (row < 0)
        return 0;
    if (typeof (this.data[step]) == 'undefined' || typeof (this.data[step][row]) == 'undefined')
    {
        host.errorln ("Attempt to get undefined step data: " + step + " : " + row);
        return 0;
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
    this.clip.clearSteps (row);
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

CursorClipProxy.prototype.duplicate = function ()
{
    this.clip.duplicate ();
};

CursorClipProxy.prototype.duplicateContent = function ()
{
    this.clip.duplicateContent ();
};

CursorClipProxy.prototype.quantize = function (amount)
{
    this.clip.quantize (amount);
};

CursorClipProxy.prototype.transpose = function (semitones)
{
    this.clip.transpose (semitones);
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
    // state: step is empty (0) or a note continues playing (1) or starts playing (2)
    this.data[col][row] = state;
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
