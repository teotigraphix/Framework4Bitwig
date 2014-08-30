// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Experimental class, Bitwig API seems unfinished and crashy

function ArrangerProxy ()
{
    this.arranger = host.createArranger (0 /* screenIndex ??? */);
    
    this.isCueMarkeVisible = false;
    this.followsPlayback = false;
    this.hasLargeTrackHeight = false;

    this.arranger.addCueMarkerVisibilityObserver (doObject (this, ArrangerProxy.prototype.handleCueMarkerVisibility));
    this.arranger.addPlaybackFollowObserver (doObject (this, ArrangerProxy.prototype.handlePlaybackFollow));
    this.arranger.addTrackRowHeightObserver (doObject (this, ArrangerProxy.prototype.handleTrackRowHeight));
}

//--------------------------------------
// Bitwig Arranger API
//--------------------------------------

ArrangerProxy.prototype.toggleCueMarkerVisibility = function ()
{
    this.arranger.toggleCueMarkerVisibility ();
};

ArrangerProxy.prototype.togglePlaybackFollow = function ()
{
    this.arranger.togglePlaybackFollow ();
};

ArrangerProxy.prototype.toggleTrackRowHeight = function ()
{
    this.arranger.toggleTrackRowHeight ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

ArrangerProxy.prototype.handleCueMarkerVisibility = function (on)
{
    this.isCueMarkeVisible = on;
};

ArrangerProxy.prototype.handlePlaybackFollow = function (on)
{
    this.followsPlayback = on;
};
    
ArrangerProxy.prototype.handleTrackRowHeight = function (on)
{
    this.hasLargeTrackHeight = on;
};
