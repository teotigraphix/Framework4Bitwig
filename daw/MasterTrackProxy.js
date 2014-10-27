// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function MasterTrackProxy ()
{
    this.masterTrack = host.createMasterTrack (0);
    this.listeners = [];
    this.name = null;
    this.vu = null;
    this.mute = null;
    this.solo = null;
    this.monitor = false;
    this.autoMonitor = false;
    this.pan = null;
    this.panStr = null;
    this.volume = null;
    this.volumeStr = null;
    this.selected = false;

    this.masterTrack.addNameObserver (8, '', doObject (this, MasterTrackProxy.prototype.handleName));
    this.masterTrack.addIsSelectedObserver (doObject (this, MasterTrackProxy.prototype.handleIsSelected));
    this.masterTrack.addVuMeterObserver (Config.maxParameterValue, -1, true, doObject (this, MasterTrackProxy.prototype.handleVuMeter));
    this.masterTrack.getMute ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleMute));
    this.masterTrack.getSolo ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleSolo));
    this.masterTrack.getArm ().addValueObserver (doObject (this, MasterTrackProxy.prototype.handleRecArm));
    this.masterTrack.getMonitor ().addValueObserver (doObjectIndex (this, i, MasterTrackProxy.prototype.handleMonitor));
    this.masterTrack.getAutoMonitor ().addValueObserver (doObjectIndex (this, i, MasterTrackProxy.prototype.handleAutoMonitor));

    // Master Track Pan value & text
    var p = this.masterTrack.getPan ();
    p.addValueObserver (Config.maxParameterValue, doObject (this, MasterTrackProxy.prototype.handlePan));
    p.addValueDisplayObserver (8, '', doObject (this, MasterTrackProxy.prototype.handlePanStr));

    // Master Track volume value & text
    var v = this.masterTrack.getVolume ();
    v.addValueObserver (Config.maxParameterValue, doObject (this, MasterTrackProxy.prototype.handleVolume));
    v.addValueDisplayObserver (8, '', doObject (this, MasterTrackProxy.prototype.handleVolumeStr));
}

// listener has 1 parameter: [boolean] isSelected
MasterTrackProxy.prototype.addTrackSelectionListener = function (listener)
{
    this.listeners.push (listener);
};

//--------------------------------------
// Properties
//--------------------------------------

MasterTrackProxy.prototype.isSelected = function () { return this.selected; };
MasterTrackProxy.prototype.getName = function () { return this.name; };
MasterTrackProxy.prototype.getVU = function () { return this.vu; };
MasterTrackProxy.prototype.isMute = function () { return this.mute; };
MasterTrackProxy.prototype.isSolo = function () { return this.solo; };
MasterTrackProxy.prototype.getPan = function () { return this.pan; };
MasterTrackProxy.prototype.getPanString = function () { return this.panStr; };
MasterTrackProxy.prototype.getVolume = function () { return this.volume; };
MasterTrackProxy.prototype.getVolumeString = function () { return this.volumeStr; };

MasterTrackProxy.prototype.changeVolume = function (value, fractionValue)
{
    this.volume = changeValue (value, this.volume, fractionValue, Config.maxParameterValue);
    this.masterTrack.getVolume ().set (this.volume, Config.maxParameterValue);
};

MasterTrackProxy.prototype.setVolume = function (value)
{
    this.volume = value;
    this.masterTrack.getVolume ().set (this.volume, Config.maxParameterValue);
};

MasterTrackProxy.prototype.setVolumeIndication = function (indicate)
{
    this.masterTrack.getVolume ().setIndication (indicate);
};

MasterTrackProxy.prototype.resetVolume = function ()
{
    this.masterTrack.getVolume ().reset ();
};

MasterTrackProxy.prototype.changePan = function (value, fractionValue)
{
    this.pan = changeValue (value, this.pan, fractionValue, Config.maxParameterValue);
    this.masterTrack.getPan ().set (this.pan, Config.maxParameterValue);
};

MasterTrackProxy.prototype.setPan = function (value)
{
    this.pan = value;
    this.masterTrack.getPan ().set (this.pan, Config.maxParameterValue);
};

MasterTrackProxy.prototype.setPanIndication = function (indicate)
{
    this.masterTrack.getPan ().setIndication (indicate);
};

MasterTrackProxy.prototype.resetPan = function ()
{
    this.masterTrack.getPan ().reset ();
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
    this.recarm = value;
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
