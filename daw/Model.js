// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Model (userCCStart, scales)
{
    this.application = new ApplicationProxy ();
    this.transport = new TransportProxy ();
    this.groove = new GrooveProxy ();
    this.masterTrack = new MasterTrackProxy ();
    this.trackBank = new TrackBankProxy ();
    this.userControlBank = new UserControlBankProxy (userCCStart);
    this.cursorDevice = new CursorDeviceProxy ();

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

/**
 * @returns {TrackBankProxy}
 */
Model.prototype.getTrackBank = function () { return this.trackBank; };

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
