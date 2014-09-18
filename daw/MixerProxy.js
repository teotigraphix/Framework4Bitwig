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

    // TODO Implement 1.1 observers
    // addCrossFadeSectionVisibilityObserver (callback:function):void
}

//------------------------------------------------------------------------------
// Bitwig Mixer API 1.0
//------------------------------------------------------------------------------

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

//------------------------------------------------------------------------------
// Bitwig Mixer API 1.1
//------------------------------------------------------------------------------

/**
 * Gets an object that allows to show/hide the clip launcher section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isClipLauncherSectionVisible = function ()
{
    return this.arranger.isClipLauncherSectionVisible ();
};

/**
 * Gets an object that allows to show/hide the cross-fade section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isCrossFadeSectionVisible = function ()
{
    return this.arranger.isCrossFadeSectionVisible  ();
};

/**
 * Gets an object that allows to show/hide the devices section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isDeviceSectionVisible = function ()
{
    return this.arranger.isDeviceSectionVisible ();
};

/**
 * Gets an object that allows to show/hide the io section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isIoSectionVisible = function ()
{
    return this.arranger.isIoSectionVisible ();
};

/**
 * Gets an object that allows to show/hide the meter section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isMeterSectionVisible = function ()
{
    return this.arranger.isMeterSectionVisible ();
};

/**
 * Gets an object that allows to show/hide the sends section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isSendSectionVisible = function ()
{
    return this.arranger.isSendSectionVisible ();
};

/**
 * Toggles the visibility of the cross-fade section in the mixer panel.
 */
MixerProxy.prototype.toggleCrossFadeSectionVisibility = function ()
{
    this.arranger.toggleCrossFadeSectionVisibility ();
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
