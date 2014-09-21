// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ArrangerProxy ()
{
    this.arranger = host.createArranger ();
    
    this.cueMarkersVisible = false;
    this.followsPlayback = false;
    this.largeTrackHeight = false;

    this.arranger.areCueMarkersVisible ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleCueMarkerVisibility));
    this.arranger.isPlaybackFollowEnabled ().addValueObserver (doObject (this, ArrangerProxy.prototype.handlePlaybackFollow));
    this.arranger.hasDoubleRowTrackHeight ().addValueObserver (doObject (this, ArrangerProxy.prototype.handleTrackRowHeight));
}

/**
 * Gets an object that allows to show/hide the cue markers in the arranger panel.
 * @returns {BooleanValue}
 */
ArrangerProxy.prototype.areCueMarkersVisible = function ()
{
    return this.cueMarkersVisible;
};

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

ArrangerProxy.prototype.togglePlaybackFollow = function ()
{
    this.arranger.isPlaybackFollowEnabled ().toggle ();
};

/**
 *Gets an object that allows to control the arranger track height.
 * @returns {BooleanValue}
 */
ArrangerProxy.prototype.hasDoubleRowTrackHeight = function ()
{
    return this.largeTrackHeight;
};

ArrangerProxy.prototype.toggleTrackRowHeight = function ()
{
    this.arranger.hasDoubleRowTrackHeight ().toggle ();
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
