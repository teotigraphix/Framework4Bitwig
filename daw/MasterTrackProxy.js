// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MasterTrackProxy ()
{
    this.masterTrack = host.createMasterTrack (0);
    this.listeners = [];
    this.name = null;
    this.vu = null;
    this.mute = null;
    this.solo = null;
    this.pan = null;
    this.panStr = null;
    this.volume = null;
    this.volumeStr = null;
    this.selected = false;

    // Master Track name
    this.masterTrack.addNameObserver (8, '', doObject (this, function (name)
    {
        this.name = name;
    }));
    // Master Track selection
    this.masterTrack.addIsSelectedObserver (doObject (this, function (isSelected)
    {
        this.selected = isSelected;
        for (var l = 0; l < this.listeners.length; l++)
            this.listeners[l].call (null, isSelected);
    }));
//    this.masterTrack.addVuMeterObserver (Config.maxParameterValue, -1, true, doObject (this, function (value)
//    {
//        this.vu = value;
//    }));

    // Master Track Mute
    this.masterTrack.getMute ().addValueObserver (doObject (this, function (isMuted)
    {
        this.mute = isMuted;
    }));
    // Master Track Solo
    this.masterTrack.getSolo ().addValueObserver (doObject (this, function (isSoloed)
    {
        this.solo = isSoloed;
    }));
    // Master Track Arm
    this.masterTrack.getArm ().addValueObserver (doObject (this, function (isArmed)
    {
        this.recarm = isArmed;
    }));

    // Master Track Pan value & text
    var p = this.masterTrack.getPan ();
    p.addValueObserver (Config.maxParameterValue, doObject (this, function (value)
    {
        this.pan = value;
    }));
    p.addValueDisplayObserver (8, '', doObject (this, function (text)
    {
        this.panStr = text;
    }));

    // Master Track volume value & text
    var v = this.masterTrack.getVolume ();
    v.addValueObserver (Config.maxParameterValue, doObject (this, function (value)
    {
        this.volume = value;
    }));
    v.addValueDisplayObserver (8, '', doObject (this, function (text)
    {
        this.volumeStr = text;
    }));
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

//--------------------------------------
// Actions
//--------------------------------------

MasterTrackProxy.prototype.select = function ()
{
    this.masterTrack.select ();
};
