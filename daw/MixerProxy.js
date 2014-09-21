// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function MixerProxy ()
{
    this.mixer = host.createMixer ();
    
    this.isClipLauncherSectionVisibile = false;
    this.isCrossFadeSectionVisibile = false;
    this.isDeviceSectionVisibile = false;
    this.isIoSectionVisibile = false;
    this.isMeterSectionVisibile = false;
    this.isSendsSectionVisibile = false;

    this.mixer.isClipLauncherSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleClipLauncherSectionVisibility));
    this.mixer.isCrossFadeSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleCrossFadeSectionVisibility));
    this.mixer.isDeviceSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleDeviceSectionVisibility));
    this.mixer.isIoSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleIoSectionVisibility));
    this.mixer.isMeterSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleMeterSectionVisibility));
    this.mixer.isSendSectionVisible ().addValueObserver (doObject (this, MixerProxy.prototype.handleSendsSectionVisibility));
}

/**
 * Gets an object that allows to show/hide the clip launcher section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isClipLauncherSectionVisible = function ()
{
    return this.isClipLauncherSectionVisibile;
};

MixerProxy.prototype.toggleClipLauncherSectionVisibility = function ()
{
    this.mixer.isClipLauncherSectionVisible ().toggle ();
};

/**
 * Gets an object that allows to show/hide the cross-fade section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isCrossFadeSectionVisible = function ()
{
    return this.isCrossFadeSectionVisibile;
};
/**
 * Toggles the visibility of the cross-fade section in the mixer panel.
 */
MixerProxy.prototype.toggleCrossFadeSectionVisibility = function ()
{
    this.mixer.isCrossFadeSectionVisible ().toggle ();
};

/**
 * Gets an object that allows to show/hide the devices section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isDeviceSectionVisible = function ()
{
    return this.isDeviceSectionVisibile;
};

MixerProxy.prototype.toggleDeviceSectionVisibility = function ()
{
    this.mixer.isDeviceSectionVisible ().toggle ();
};

/**
 * Gets an object that allows to show/hide the io section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isIoSectionVisible = function ()
{
    return this.isIoSectionVisibile;
};

MixerProxy.prototype.toggleIoSectionVisibility = function ()
{
    this.mixer.isIoSectionVisible ().toggle ();
};

/**
 * Gets an object that allows to show/hide the meter section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isMeterSectionVisible = function ()
{
    return this.isMeterSectionVisibile;
};

MixerProxy.prototype.toggleMeterSectionVisibility = function ()
{
    this.mixer.isMeterSectionVisible ().toggle ();
};

/**
 * Gets an object that allows to show/hide the sends section of the mixer panel.
 * @returns {BooleanValue}
 */
MixerProxy.prototype.isSendSectionVisible = function ()
{
    return this.isSendsSectionVisibile;
};

MixerProxy.prototype.toggleSendsSectionVisibility = function ()
{
    this.mixer.isSendSectionVisible ().toggle ();
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
    this.isCrossFadeSectionVisibile = on;
};

MixerProxy.prototype.handleDeviceSectionVisibility = function (on)
{
    this.isDeviceSectionVisibile = on;
};

MixerProxy.prototype.handleIoSectionVisibility = function (on)
{
    this.isIoSectionVisibile = on;
};

MixerProxy.prototype.handleMeterSectionVisibility = function (on)
{
    this.isMeterSectionVisibile = on;
};

MixerProxy.prototype.handleSendsSectionVisibility = function (on)
{
    this.isSendsSectionVisibile = on;
};
