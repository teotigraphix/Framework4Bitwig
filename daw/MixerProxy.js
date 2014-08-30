// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Experimental class, Bitwig API seems unfinished and crashy

function MixerProxy ()
{
    this.mixer = host.createMixer ('ARRANGE', 0 /* screenIndex ??? */);
    
    this.isClipLauncherSectionVisibile = false;
    this.isCrossFadeSectionVisibile = false;
    this.isDeviceSectionVisibile = false;
    this.isIoSectionVisibile = false;
    this.isMeterSectionVisibile = false;
    this.isSendsSectionVisibile = false;

    this.arranger.addClipLauncherSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleClipLauncherSectionVisibility));
    this.arranger.addCrossFadeSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleCrossFadeSectionVisibility));
    this.arranger.addDeviceSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleDeviceSectionVisibility));
    this.arranger.addIoSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleIoSectionVisibility));
    this.arranger.addMeterSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleMeterSectionVisibility));
    this.arranger.addSendsSectionVisibilityObserver (doObject (this, MixerProxy.prototype.handleSendsSectionVisibility));
}

//--------------------------------------
// Bitwig Arranger API
//--------------------------------------

MixerProxy.prototype.toggleClipLauncherSectionVisibility = function ()
{
    this.arranger.toggleClipLauncherSectionVisibility ();
};

MixerProxy.prototype.toggleCrossFadeSectionVisibility = function ()
{
    this.arranger.toggleCrossFadeSectionVisibility ();
};

MixerProxy.prototype.toggleDeviceSectionVisibility = function ()
{
    this.arranger.toggleDeviceSectionVisibility ();
};

MixerProxy.prototype.toggleIoSectionVisibility = function ()
{
    this.arranger.toggleIoSectionVisibility ();
};

MixerProxy.prototype.toggleMeterSectionVisibility = function ()
{
    this.arranger.toggleMeterSectionVisibility ();
};

MixerProxy.prototype.toggleSendsSectionVisibility = function ()
{
    this.arranger.toggleSendsSectionVisibility ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

MixerProxy.prototype.handleClipLauncherSectionVisibility = function (on)
{
    this.isClipLauncherSectionVisibile = on;
};

MixerProxy.prototype.handleCrossFadeSectionVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};

MixerProxy.prototype.handleDeviceSectionVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};

MixerProxy.prototype.handleIoSectionVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};

MixerProxy.prototype.handleMeterSectionVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};

MixerProxy.prototype.handleSendsSectionVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};
