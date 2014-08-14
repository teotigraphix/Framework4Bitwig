// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

TransportProxy.INC_FRACTION_TIME      = 1.0;        // 1 beat
TransportProxy.INC_FRACTION_TIME_SLOW = 1.0 / 20;    // 1/20th of a beat
TransportProxy.TEMPO_RESOLUTION       = 647;

function TransportProxy ()
{
    this.transport = host.createTransport ();

    this.isClickOn   = false;
    this.isPlaying   = false;
    this.isRecording = false;
    this.isLooping   = false;
    
    // For tap tempo calculation
    this.ttLastMillis = -1;
    this.ttLastBPM    = -1;
    this.ttHistory    = [];
    
    // Note: For real BPM add 20
    this.setInternalTempo (100);

    this.transport.addClickObserver (doObject (this, function (isOn)
    {
        this.isClickOn = isOn;
    }));
    // Play
    this.transport.addIsPlayingObserver (doObject (this, function (isPlaying)
    {
        this.isPlaying = isPlaying;
    }));
    // Record
    this.transport.addIsRecordingObserver (doObject (this, function (isRec)
    {
        this.isRecording = isRec;
    }));
    // Loop
    this.transport.addIsLoopActiveObserver (doObject (this, function (isLoop)
    {
        this.isLooping = isLoop;
    }));
    // Tempo
    this.transport.getTempo ().addValueObserver (TransportProxy.TEMPO_RESOLUTION, doObject (this, function (value)
    {
        this.setInternalTempo (value);
    }));
}

//--------------------------------------
// Bitwig Transport API
//--------------------------------------

TransportProxy.prototype.fastForward = function ()
{
    this.transport.fastForward ();
};

TransportProxy.prototype.getInPosition = function ()
{
    this.transport.getInPosition ();
};

TransportProxy.prototype.getOutPosition = function ()
{
    this.transport.getOutPosition ();
};

TransportProxy.prototype.getPosition = function ()
{
    this.transport.getPosition ();
};

TransportProxy.prototype.incPosition = function (deltaBase, snap)
{
    this.transport.incPosition (deltaBase, snap);
};

TransportProxy.prototype.play = function ()
{
    this.transport.play ();
};

TransportProxy.prototype.record = function ()
{
    this.transport.record ();
};

TransportProxy.prototype.resetAutomationOverrides = function ()
{
    this.transport.resetAutomationOverrides ();
};

TransportProxy.prototype.restart = function ()
{
    this.transport.restart ();
};

TransportProxy.prototype.returnToArrangement = function ()
{
    this.transport.returnToArrangement ();
};

TransportProxy.prototype.rewind = function ()
{
    this.transport.rewind ();
};

TransportProxy.prototype.setAutomationWriteMode = function (mode)
{
    this.transport.setAutomationWriteMode (mode);
};

TransportProxy.prototype.setClick = function (on)
{
    this.transport.setClick (on);
};

TransportProxy.prototype.setLauncherOverdub = function (on)
{
    this.transport.setLauncherOverdub (on);
};

TransportProxy.prototype.setLoop = function (on)
{
    this.transport.setLoop (on);
};

TransportProxy.prototype.setMetronomeValue = function (amount, range)
{
    this.transport.setMetronomeValue (amount, range);
};

TransportProxy.prototype.setOverdub = function (on)
{
    this.transport.setOverdub (on);
};

TransportProxy.prototype.setPosition = function (beats)
{
    this.transport.setPosition (beats);
};

TransportProxy.prototype.stop = function ()
{
    this.transport.stop ();
};

TransportProxy.prototype.toggleClick = function ()
{
    this.transport.toggleClick ();
};

TransportProxy.prototype.toggleLatchAutomationWriteMode = function ()
{
    this.transport.toggleLatchAutomationWriteMode ();
};

TransportProxy.prototype.toggleLauncherOverdub = function ()
{
    this.transport.toggleLauncherOverdub ();
};

TransportProxy.prototype.toggleLoop = function ()
{
    this.transport.toggleLoop ();
};

TransportProxy.prototype.toggleMetronomeTicks = function ()
{
    this.transport.toggleMetronomeTicks ();
};

TransportProxy.prototype.toggleOverdub = function ()
{
    this.transport.toggleOverdub ();
};

TransportProxy.prototype.togglePlay = function ()
{
    this.transport.togglePlay ();
};

TransportProxy.prototype.togglePunchIn = function ()
{
    this.transport.togglePunchIn ();
};

TransportProxy.prototype.togglePunchOut = function ()
{
    this.transport.togglePunchOut ();
};

TransportProxy.prototype.toggleWriteArrangerAutomation = function ()
{
    this.transport.toggleWriteArrangerAutomation ();
};

TransportProxy.prototype.toggleWriteClipLauncherAutomation = function ()
{
    this.transport.toggleWriteClipLauncherAutomation ();
};

//--------------------------------------
// Public API
//--------------------------------------

TransportProxy.prototype.stopAndRewind = function ()
{
    this.transport.stop ();
    this.transport.setPosition (0);
};

TransportProxy.prototype.changePosition = function (increase, slow)
{
    var frac = slow ? TransportProxy.INC_FRACTION_TIME_SLOW : TransportProxy.INC_FRACTION_TIME;
    this.transport.incPosition (increase ? frac : -frac, false);
};

TransportProxy.prototype.tapTempo = function ()
{
    var millis = new Date ().getTime ();

    // First press?
    if (this.ttLastMillis == -1)
    {
        this.ttLastMillis = millis;
        return;
    }

    // Calc the difference
    var diff = millis - this.ttLastMillis;
    this.ttLastMillis = millis;

    // Store up to 8 differences for average calculation
    this.ttHistory.push (diff);
    if (this.ttHistory.length > 8)
        this.ttHistory.shift ();

    // Calculate the new average difference
    var sum = 0;
    for (var i = 0; i < this.ttHistory.length; i++)
        sum += this.ttHistory[i];
    var average = sum / this.ttHistory.length;
    var bpm = 60000 / average;

    // If the deviation is greater 20bpm, reset history
    if (this.ttLastBPM != -1 && Math.abs (this.ttLastBPM - bpm) > 20)
    {
        this.ttHistory.length = 0;
        this.ttLastBPM = -1;
    }
    else
    {
        this.ttLastBPM = bpm;
        this.setTempo (bpm);
    }
};

TransportProxy.prototype.changeTempo = function (increase)
{
    this.tempo = increase ? Math.min (this.tempo + 1, TransportProxy.TEMPO_RESOLUTION) : Math.max (0, this.tempo - 1);
    this.transport.getTempo ().set (this.tempo, TransportProxy.TEMPO_RESOLUTION);
};

TransportProxy.prototype.setTempo = function (bpm)
{
    this.transport.getTempo ().set (Math.min (Math.max (0, bpm - 20), TransportProxy.TEMPO_RESOLUTION), TransportProxy.TEMPO_RESOLUTION);
};

TransportProxy.prototype.setTempoIndication = function (isTouched)
{
    this.transport.getTempo ().setIndication (isTouched);
};

TransportProxy.prototype.setInternalTempo = function (t)
{
    this.tempo = t;
};

TransportProxy.prototype.setLauncherOverdub = function (on)
{
    // Note: This is a bug: On and off are switched
    this.transport.setLauncherOverdub (!on);
};
