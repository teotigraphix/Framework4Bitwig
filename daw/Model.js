// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Model (userCCStart, scales, numTracks, numScenes, numSends)
{
    numTracks = numTracks ? numTracks : 8;
    numScenes = numScenes ? numScenes : 8;
    numSends  = numSends  ? numSends  : 6;

    this.application = new ApplicationProxy ();
    this.transport = new TransportProxy ();
    this.groove = new GrooveProxy ();
    this.masterTrack = new MasterTrackProxy ();
    this.trackBank = new TrackBankProxy (numTracks, numScenes, numSends);
    this.effectTrackBank = new EffectTrackBankProxy (numTracks, numScenes);
    this.userControlBank = new UserControlBankProxy (userCCStart);
    this.cursorDevice = new CursorDeviceProxy (host.createEditorCursorDevice (), numSends);
    this.arranger = new ArrangerProxy ();
    this.mixer = new MixerProxy ();
    this.sceneBank = new SceneBankProxy (numScenes);

    this.currentTrackBank = this.trackBank;

    this.scales = scales;
}

/**
 * @returns {Scales}
 */
Model.prototype.getScales = function ()
{
    return this.scales;
};

Model.prototype.hasSelectedDevice = function ()
{
    return this.cursorDevice.hasSelectedDevice ();
};

Model.prototype.getSelectedDevice = function ()
{
    return this.cursorDevice.getSelectedDevice ();
};

/**
 * @returns {ArrangerProxy}
 */
Model.prototype.getArranger = function () { return this.arranger; };


/**
 * @returns {MixerProxy}
 */
Model.prototype.getMixer = function () { return this.mixer; };

/**
 * @returns {TransportProxy}
 */
Model.prototype.getTransport = function () { return this.transport; };

/**
 * @returns {GrooveProxy}
 */
Model.prototype.getGroove = function () { return this.groove; };

/**
 * @returns {MasterTrackProxy}
 */
Model.prototype.getMasterTrack = function () { return this.masterTrack; };

Model.prototype.toggleCurrentTrackBank = function ()
{
    this.currentTrackBank = this.currentTrackBank === this.trackBank ? this.effectTrackBank : this.trackBank;
};

Model.prototype.isEffectTrackBankActive = function ()
{
    return this.currentTrackBank === this.effectTrackBank;
};

/**
 * @returns {AbstractTrackBankProxy}
 */
Model.prototype.getCurrentTrackBank = function ()
{
    return this.currentTrackBank;
};

/**
 * @returns {TrackBankProxy}
 */
Model.prototype.getTrackBank = function () { return this.trackBank; };

/**
 * @returns {EffectTrackBankProxy}
 */
Model.prototype.getEffectTrackBank = function () { return this.effectTrackBank; };

/**
 * @returns {CursorDeviceProxy}
 */
Model.prototype.getCursorDevice = function () { return this.cursorDevice; };

/**
 * @returns {UserControlBankProxy}
 */
Model.prototype.getUserControlBank = function () { return this.userControlBank; };

/**
 * @returns {ApplicationProxy}
 */
Model.prototype.getApplication = function ()
{
    return this.application;
};

/**
 * @returns {SceneBankProxy}
 */
Model.prototype.getSceneBank = function ()
{
    return this.sceneBank;
};

/**
 * @returns {CursorClipProxy}
 */
Model.prototype.createCursorClip = function (cols, rows)
{
    return new CursorClipProxy (cols, rows);
};

/**
 * Returns true if session recording is enabled, a clip is recording 
 * or overdub is enabled.
 */
Model.prototype.hasRecordingState = function ()
{
    return this.transport.isRecording ||
           this.transport.isLauncherOverdub ||
           this.currentTrackBank.isClipRecording ();
};

Model.prototype.getQuartersPerMeasure = function ()
{
    return 4 * this.transport.getNumerator () / this.transport.getDenominator ();
};