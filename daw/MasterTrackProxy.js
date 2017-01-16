// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function MasterTrackProxy ()
{
    this.masterTrack = host.createMasterTrack (0);
    this.listeners = [];
    this.name = null;
    this.vu = null;
    this.color = null;
    this.mute = null;
    this.solo = null;
    this.recarm = false;
    this.monitor = false;
    this.autoMonitor = false;
    this.activated = true;
    this.pan = null;
    this.panStr = null;
    this.volume = null;
    this.volumeStr = null;
    this.selected = false;
    this.isGroup = false;

    this.textLength = GlobalConfig.MASTER_TRACK_TEXT_LENGTH;

    // DeviceChain attributes
    this.masterTrack.addIsSelectedObserver (doObject (this, MasterTrackProxy.prototype.handleIsSelected));
    this.masterTrack.addNameObserver (this.textLength, '', doObject (this, MasterTrackProxy.prototype.handleName));
    
    // Channel attributes
    this.masterTrack.isActivated ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleActivated));
    var v = this.masterTrack.getVolume ();
    v.addValueObserver (Config.parameterRange, doObject (this, MasterTrackProxy.prototype.handleVolume));
    v.addValueDisplayObserver (this.textLength, '', doObject (this, MasterTrackProxy.prototype.handleVolumeStr));
    var p = this.masterTrack.getPan ();
    p.addValueObserver (Config.parameterRange, doObject (this, MasterTrackProxy.prototype.handlePan));
    p.addValueDisplayObserver (this.textLength, '', doObject (this, MasterTrackProxy.prototype.handlePanStr));
    this.masterTrack.getMute ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleMute));
    this.masterTrack.getSolo ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleSolo));
    this.masterTrack.addVuMeterObserver (Config.parameterRange, -1, true, doObject (this, MasterTrackProxy.prototype.handleVuMeter));
    this.masterTrack.addColorObserver (doObject (this, MasterTrackProxy.prototype.handleColor));

    // Track attributes
    this.masterTrack.getArm ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleRecArm));
    this.masterTrack.getMonitor ().addValueObserver (doObjectIndex (this, i, MasterTrackProxy.prototype.handleMonitor));
    this.masterTrack.getAutoMonitor ().addValueObserver (doObjectIndex (this, i, MasterTrackProxy.prototype.handleAutoMonitor));
}

// listener has 1 parameter: [boolean] isSelected
MasterTrackProxy.prototype.addTrackSelectionListener = function (listener)
{
    this.listeners.push (listener);
};

MasterTrackProxy.prototype.isSelected = function () { return this.selected; };
MasterTrackProxy.prototype.getName = function () { return this.name; };
MasterTrackProxy.prototype.getVU = function () { return this.vu; };

MasterTrackProxy.prototype.getColorEntry = function ()
{ 
    return AbstractTrackBankProxy.getColorEntry (this.color);
};

MasterTrackProxy.prototype.getColor = function () { return this.color; };

MasterTrackProxy.prototype.isMute = function () { return this.mute; };
MasterTrackProxy.prototype.isSolo = function () { return this.solo; };
MasterTrackProxy.prototype.getPan = function () { return this.pan; };
MasterTrackProxy.prototype.getPanString = function () { return this.panStr; };
MasterTrackProxy.prototype.getVolume = function () { return this.volume; };
MasterTrackProxy.prototype.getVolumeString = function () { return this.volumeStr; };

MasterTrackProxy.prototype.changeVolume = function (value, fractionValue)
{
    this.masterTrack.getVolume ().inc (calcKnobSpeed (value, fractionValue), Config.parameterRange);
};

MasterTrackProxy.prototype.setVolume = function (value)
{
    this.volume = value;
    this.masterTrack.getVolume ().set (this.volume, Config.parameterRange);
};

MasterTrackProxy.prototype.setVolumeIndication = function (indicate)
{
    this.masterTrack.getVolume ().setIndication (indicate);
};

MasterTrackProxy.prototype.resetVolume = function ()
{
    this.masterTrack.getVolume ().reset ();
};

MasterTrackProxy.prototype.touchVolume = function (isBeingTouched)
{
    this.masterTrack.getVolume ().touch (isBeingTouched);
};

MasterTrackProxy.prototype.changePan = function (value, fractionValue)
{
    this.masterTrack.getPan ().inc (calcKnobSpeed (value, fractionValue), Config.parameterRange);
};

MasterTrackProxy.prototype.setPan = function (value)
{
    this.pan = value;
    this.masterTrack.getPan ().set (this.pan, Config.parameterRange);
};

MasterTrackProxy.prototype.setPanIndication = function (indicate)
{
    this.masterTrack.getPan ().setIndication (indicate);
};

MasterTrackProxy.prototype.resetPan = function ()
{
    this.masterTrack.getPan ().reset ();
};

MasterTrackProxy.prototype.touchPan = function (isBeingTouched)
{
    this.masterTrack.getPan ().touch (isBeingTouched);
};

MasterTrackProxy.prototype.setIsActivated = function (value)
{
    this.masterTrack.isActivated ().set (value);
};

MasterTrackProxy.prototype.toggleIsActivated = function ()
{
    this.masterTrack.isActivated ().toggle ();
};

MasterTrackProxy.prototype.setMute = function (value)
{
    this.mute = value;
    this.masterTrack.getMute ().set (value);
};

MasterTrackProxy.prototype.toggleMute = function ()
{
    this.setMute (!this.mute);
};

MasterTrackProxy.prototype.setSolo = function (value)
{
    this.solo = value;
    this.masterTrack.getSolo ().set (value);
};

MasterTrackProxy.prototype.toggleSolo = function ()
{
    this.setSolo (!this.solo);
};

MasterTrackProxy.prototype.setArm = function (value)
{
    this.masterTrack.getArm ().set (value);
};

MasterTrackProxy.prototype.toggleArm = function ()
{
    this.setArm (!this.recarm);
};

MasterTrackProxy.prototype.setMonitor = function (value)
{
    this.masterTrack.getMonitor ().set (value);
};

MasterTrackProxy.prototype.toggleMonitor = function ()
{
    this.masterTrack.getMonitor ().toggle ();
};

MasterTrackProxy.prototype.setAutoMonitor = function (value)
{
    this.masterTrack.getAutoMonitor ().set (value);
};

MasterTrackProxy.prototype.toggleAutoMonitor = function ()
{
    this.masterTrack.getAutoMonitor ().toggle ();
};

//--------------------------------------
// Actions
//--------------------------------------

MasterTrackProxy.prototype.select = function ()
{
    this.masterTrack.selectInEditor ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

MasterTrackProxy.prototype.handleName = function (name)
{
    this.name = name;
};

MasterTrackProxy.prototype.handleIsSelected = function (isSelected)
{
    this.selected = isSelected;
    for (var l = 0; l < this.listeners.length; l++)
        this.listeners[l].call (null, isSelected);
};

MasterTrackProxy.prototype.handleVuMeter = function (value)
{
    this.vu = value;
};

MasterTrackProxy.prototype.handleColor = function (red, green, blue)
{
    this.color = AbstractTrackBankProxy.getColorIndex (red, green, blue);
};

MasterTrackProxy.prototype.handleActivated = function (isActivated)
{
    this.activated = isActivated;
};

MasterTrackProxy.prototype.handleMute = function (isMuted)
{
    this.mute = isMuted;
};

MasterTrackProxy.prototype.handleSolo = function (isSoloed)
{
    this.solo = isSoloed;
};

MasterTrackProxy.prototype.handleRecArm = function (isArmed)
{
    this.recarm = isArmed;
};

MasterTrackProxy.prototype.handleMonitor = function (index, on)
{
    this.monitor = on;
};

MasterTrackProxy.prototype.handleAutoMonitor = function (index, on)
{
    this.autoMonitor = on;
};

MasterTrackProxy.prototype.handlePan = function (value)
{
    this.pan = value;
};

MasterTrackProxy.prototype.handlePanStr = function (text)
{
    this.panStr = text;
};

MasterTrackProxy.prototype.handleVolume = function (value)
{
    this.volume = value;
};

MasterTrackProxy.prototype.handleVolumeStr = function (text)
{
    this.volumeStr = text;
};
