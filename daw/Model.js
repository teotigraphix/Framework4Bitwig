// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Model (userCCStart, scales)
{
    this.application = new ApplicationProxy ();
    this.transport = new TransportProxy ();
    this.groove = new GrooveProxy ();
    this.masterTrack = new MasterTrackProxy ();
    this.trackBank = new TrackBankProxy ();
    this.effectTrackBank = new EffectTrackBankProxy ();
    this.userControlBank = new UserControlBankProxy (userCCStart);
    this.cursorDevice = new CursorDeviceProxy ();
    
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
    return this.cursorDevice.getSelectedDevice ().name != 'None';
};

Model.prototype.getSelectedDevice = function ()
{
    return this.cursorDevice.getSelectedDevice ();
};

/**
 * @returns {TransportProxy|
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
 * @returns {CursorClipProxy}
 */
Model.prototype.createCursorClip = function (cols, rows)
{
    return new CursorClipProxy (cols, rows);
};
