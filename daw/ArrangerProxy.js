// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ArrangerProxy ()
{
    this.arranger = host.createArranger ();
    
    this.cueMarkersVisible = false;
    this.followsPlayback = false;
    this.largeTrackHeight = false;
    this.clipLauncherVisible = false;
    this.timelineVisible = false;
    this.ioSectionVisible = false;
    this.effectTracksVisible = false;

    this.arranger.areCueMarkersVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleCueMarkerVisibility));
    this.arranger.isPlaybackFollowEnabled ().addValueObserver (doObject (this, ArrangerProxy.prototype.handlePlaybackFollow));
    this.arranger.hasDoubleRowTrackHeight ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleTrackRowHeight));
    this.arranger.isClipLauncherVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleClipLauncherVisible));
    this.arranger.isTimelineVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleTimelineVisible));
    this.arranger.isIoSectionVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleIoSectionVisible));
    this.arranger.areEffectTracksVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleEffectTracksVisible));
}

/**
 * Gets an object that allows to show/hide the cue markers in the arranger panel.
 * @returns {BooleanValue}
 */
ArrangerProxy.prototype.areCueMarkersVisible = function ()
{
    return this.cueMarkersVisible;
};

/**
 * Show/hide the cue markers in the arranger panel.
 */
ArrangerProxy.prototype.toggleCueMarkerVisibility = function ()
{
    this.arranger.areCueMarkersVisible ().toggle ();
};

/**
 * Gets an object that allows to enable/disable arranger playback follow.
 * @returns {BooleanValue}
 */
ArrangerProxy.prototype.isPlaybackFollowEnabled = function ()
{
    return this.followsPlayback;
};

/**
 * Enable/disable arranger playback follow.
 */
ArrangerProxy.prototype.togglePlaybackFollow = function ()
{
    this.arranger.isPlaybackFollowEnabled ().toggle ();
};

/**
 * Gets an object that allows to control the arranger track height.
 * @returns {BooleanValue}
 */
ArrangerProxy.prototype.hasDoubleRowTrackHeight = function ()
{
    return this.largeTrackHeight;
};

/**
 * Toggles the double/single row height of the Arranger tracks.
 */
ArrangerProxy.prototype.toggleTrackRowHeight = function ()
{
    this.arranger.hasDoubleRowTrackHeight ().toggle ();
};

ArrangerProxy.prototype.isClipLauncherVisible = function ()
{
    return this.clipLauncherVisible;
};

ArrangerProxy.prototype.isTimelineVisible = function ()
{
    return this.timelineVisible;
};

ArrangerProxy.prototype.isIoSectionVisible = function ()
{
    return this.ioSectionVisible;
};

ArrangerProxy.prototype.areEffectTracksVisible = function ()
{
    return this.effectTracksVisible;
};

ArrangerProxy.prototype.toggleClipLauncher = function ()
{
    this.arranger.isClipLauncherVisible ().toggle ();
};

ArrangerProxy.prototype.toggleTimeLine = function ()
{
    this.arranger.isTimelineVisible ().toggle ();
};

ArrangerProxy.prototype.toggleIoSection = function ()
{
    this.arranger.isIoSectionVisible ().toggle ();
};

ArrangerProxy.prototype.toggleEffectTracks = function ()
{
    this.arranger.areEffectTracksVisible ().toggle ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

ArrangerProxy.prototype.handleCueMarkerVisibility = function (on)
{
    this.cueMarkersVisible = on;
};

ArrangerProxy.prototype.handlePlaybackFollow = function (on)
{
    this.followsPlayback = on;
};
    
ArrangerProxy.prototype.handleTrackRowHeight = function (on)
{
    this.largeTrackHeight = on;
};

ArrangerProxy.prototype.handleClipLauncherVisible = function (on)
{
    this.clipLauncherVisible = on;
};
    
ArrangerProxy.prototype.handleTimelineVisible = function (on)
{
    this.timelineVisible = on;
};
    
ArrangerProxy.prototype.handleIoSectionVisible = function (on)
{
    this.ioSectionVisible = on;
};
    
ArrangerProxy.prototype.handleEffectTracksVisible = function (on)
{
    this.effectTracksVisible = on;
};
