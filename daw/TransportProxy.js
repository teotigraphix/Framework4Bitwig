// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

TransportProxy.INC_FRACTION_TIME      = 1.0;        // 1 beat
TransportProxy.INC_FRACTION_TIME_SLOW = 1.0 / 20;   // 1/20th of a beat
TransportProxy.TEMPO_MIN              = 20;
TransportProxy.TEMPO_MAX              = 666;

TransportProxy.PREROLL_NONE   = "none";
TransportProxy.PREROLL_1_BAR  = "one_bar";
TransportProxy.PREROLL_2_BARS = "two_bars";
TransportProxy.PREROLL_4_BARS = "four_bars";


function TransportProxy ()
{
    this.transport = host.createTransport ();

    this.isClickOn                       = false;
    this.isPlaying                       = false;
    this.isRecording                     = false;
    this.isLooping                       = false;
    this.punchIn                         = false;
    this.punchOut                        = false;
    this.isOverdub                       = false;
    this.isLauncherOverdub               = false;
    this.automationWriteMode             = "latch";
    this.isAutomationOverride            = false;
    this.isWritingArrangerAutomation     = false;
    this.isWritingClipLauncherAutomation = false;
    this.crossfade                       = 0;
    this.numerator                       = 4;
    this.denominator                     = 4;
    this.metroVolume                     = 95;
    this.preroll                         = 0;
    this.prerollClick                    = false;
    this.position                        = 0;
    
    this.transport.isPlaying ().addValueObserver (doObject (this, TransportProxy.prototype.handleIsPlaying));
    this.transport.isArrangerRecordEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleIsRecording));
    this.transport.isArrangerOverdubEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleOverdub));
    this.transport.isClipLauncherOverdubEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleLauncherOverdub));
    this.transport.automationWriteMode ().addValueObserver (doObject (this, TransportProxy.prototype.handleAutomationWriteMode));
    this.transport.isArrangerAutomationWriteEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleIsWritingArrangerAutomation));
    this.transport.isClipLauncherAutomationWriteEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleIsWritingClipLauncherAutomation));
    this.transport.isAutomationOverrideActive ().addValueObserver (doObject (this, TransportProxy.prototype.handleAutomationOverrideObserver));
    this.transport.isArrangerLoopEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleIsLoopActive));
    this.transport.isPunchInEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handlePunchIn));
    this.transport.isPunchOutEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handlePunchOut));
    this.transport.isMetronomeEnabled ().addValueObserver (doObject (this, TransportProxy.prototype.handleClick));
    
    // TODO
    // isMetronomeTickPlaybackEnabled ()  
    
    this.transport.metronomeVolume ().addValueObserver (doObject (this, TransportProxy.prototype.handleMetronomeVolume));
    this.transport.isMetronomeAudibleDuringPreRoll ().addValueObserver (doObject (this, TransportProxy.prototype.handlePreRollClick));
    this.transport.preRoll ().addValueObserver (doObject (this, TransportProxy.prototype.handlePreRoll));
    
    this.transport.tempo ().addRawValueObserver (doObject (this, TransportProxy.prototype.handleTempo));
    this.transport.getPosition ().addTimeObserver (":", 3, 2, 2, 2, doObject (this, TransportProxy.prototype.handlePosition));
    this.transport.getCrossfade ().addValueObserver (Config.maxParameterValue, doObject (this, TransportProxy.prototype.handleCrossfade));
    
    var ts = this.transport.getTimeSignature ();
    ts.getNumerator ().addValueObserver (doObject (this, TransportProxy.prototype.handleNumerator));
    ts.getDenominator ().addValueObserver (doObject (this, TransportProxy.prototype.handleDenominator));
}

TransportProxy.prototype.fastForward = function ()
{
    this.transport.fastForward ();
};

TransportProxy.prototype.getInPosition = function ()
{
    return this.transport.getInPosition ();
};

TransportProxy.prototype.getOutPosition = function ()
{
    return this.transport.getOutPosition ();
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

// mode = "latch", "touch" or "write"
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

TransportProxy.prototype.getPosition = function ()
{
    return this.transport.getPosition ();
};

TransportProxy.prototype.getPositionText = function ()
{
    return this.position;
};

TransportProxy.prototype.setPosition = function (beats)
{
    this.transport.setPosition (beats);
};

TransportProxy.prototype.changePosition = function (increase, slow)
{
    var frac = slow ? TransportProxy.INC_FRACTION_TIME_SLOW : TransportProxy.INC_FRACTION_TIME;
    this.transport.incPosition (increase ? frac : -frac, false);
};

TransportProxy.prototype.incPosition = function (deltaBase, snap)
{
    this.transport.incPosition (deltaBase, snap);
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

TransportProxy.prototype.stopAndRewind = function ()
{
    this.transport.stop ();
    // Delay the position movement to make sure that the playback is really stopped
    scheduleTask (doObject (this, function ()
    {
        this.transport.setPosition (0);
    }), null, 100);
};

TransportProxy.prototype.tapTempo = function ()
{
    this.transport.tapTempo ();
};

TransportProxy.prototype.changeTempo = function (increase, fine)
{
    var offset = fine ? 0.01 : 1;
    this.transport.getTempo ().incRaw (increase ? offset : -offset);
};

TransportProxy.prototype.setTempo = function (bpm)
{
    this.transport.getTempo ().setRaw (bpm);
};

// in bpm
TransportProxy.prototype.getTempo = function ()
{
    return this.tempo;
};

TransportProxy.prototype.setTempoIndication = function (isTouched)
{
    this.transport.getTempo ().setIndication (isTouched);
};

TransportProxy.prototype.setCrossfade = function (value)
{
    this.transport.getCrossfade ().set (value, Config.maxParameterValue);
};

TransportProxy.prototype.getCrossfade = function ()
{
    return this.crossfade;
};

TransportProxy.prototype.setLauncherOverdub = function (on)
{
    this.transport.isClipLauncherOverdubEnabled ().set (on);
};

TransportProxy.prototype.changeMetronomeVolume = function (value, fractionValue)
{
    this.metroVolume = changeValue (value, this.metroVolume, fractionValue, Config.maxParameterValue);
    this.transport.setMetronomeValue (this.metroVolume, Config.maxParameterValue);
};

TransportProxy.prototype.getPreroll = function ()
{
    return this.preroll;
};

TransportProxy.prototype.setPreroll = function (preroll)
{
    this.transport.setPreRoll (preroll);
};

TransportProxy.prototype.isPrerollClickEnabled = function ()
{
    return this.prerollClick;
};

TransportProxy.prototype.togglePrerollClick = function ()
{
    this.transport.toggleMetronomeDuringPreRoll ();
};

TransportProxy.prototype.getNumerator = function ()
{
    return this.numerator;
};

TransportProxy.prototype.getDenominator = function ()
{
    return this.denominator;
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

TransportProxy.prototype.handleClick = function (isOn)
{
    this.isClickOn = isOn;
};

TransportProxy.prototype.handleIsPlaying = function (isPlaying)
{
    this.isPlaying = isPlaying;
};

TransportProxy.prototype.handleIsRecording = function (isRec)
{
    this.isRecording = isRec;
};

TransportProxy.prototype.handleIsLoopActive = function (isLoop)
{
    this.isLooping = isLoop;
};

TransportProxy.prototype.handlePunchIn = function (isActive)
{
    this.punchIn = isActive;
};

TransportProxy.prototype.handlePunchOut = function (isActive)
{
    this.punchOut = isActive;
};

TransportProxy.prototype.handleOverdub = function (isOverdub)
{
    this.isOverdub = isOverdub;
};

TransportProxy.prototype.handleLauncherOverdub = function (isOverdub)
{
    this.isLauncherOverdub = isOverdub;
};

TransportProxy.prototype.handleAutomationWriteMode = function (writeMode)
{
    this.automationWriteMode = writeMode;
};

TransportProxy.prototype.handleAutomationOverrideObserver = function (isOverride)
{
    this.isAutomationOverride = isOverride;
};

TransportProxy.prototype.handleIsWritingArrangerAutomation = function (isAutomation)
{
    this.isWritingArrangerAutomation = isAutomation;
};

TransportProxy.prototype.handleIsWritingClipLauncherAutomation = function (isAutomation)
{
    this.isWritingClipLauncherAutomation = isAutomation;
};

TransportProxy.prototype.handleMetronomeVolume = function (volume)
{
    // volume is in the range of -48.0 to 0.0, scale to 0 to Config.maxParameterValue - 1
    this.metroVolume = Math.round ((48.0 + volume) * (Config.maxParameterValue - 1) / 48.0);
};

TransportProxy.prototype.handlePreRoll = function (prerollValue)
{
    this.preroll = prerollValue;
};

TransportProxy.prototype.handlePreRollClick = function (prerollClickValue)
{
    this.prerollClick = prerollClickValue;
};

TransportProxy.prototype.handleTempo = function (value)
{
    this.tempo = Math.min (TransportProxy.TEMPO_MAX, Math.max (TransportProxy.TEMPO_MIN, value));
};

TransportProxy.prototype.handleCrossfade = function (value)
{
    this.crossfade = value;
};

TransportProxy.prototype.handlePosition = function (value)
{
    this.position = value;
};

TransportProxy.prototype.handleNumerator = function (value)
{
    this.numerator = value;
};

TransportProxy.prototype.handleDenominator = function (value)
{
    this.denominator = value;
};
