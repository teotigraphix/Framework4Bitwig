// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractTrackBankProxy.COLORS =
[
    [ 0.3294117748737335 , 0.3294117748737335 , 0.3294117748737335 , 1],    // Dark Gray
    [ 0.47843137383461   , 0.47843137383461   , 0.47843137383461   , 2],    // Gray
    [ 0.7882353067398071 , 0.7882353067398071 , 0.7882353067398071 , 3],    // Light Gray
    [ 0.5254902243614197 , 0.5372549295425415 , 0.6745098233222961 , 40],   // Silver
    [ 0.6392157077789307 , 0.4745098054409027 , 0.26274511218070984, 11],   // Dark Brown
    [ 0.7764706015586853 , 0.6235294342041016 , 0.43921568989753723, 12],   // Brown
    [ 0.34117648005485535, 0.3803921639919281 , 0.7764706015586853 , 42],   // Dark Blue
    [ 0.5176470875740051 , 0.5411764979362488 , 0.8784313797950745 , 44],   // Light Blue
    [ 0.5843137502670288 , 0.2862745225429535 , 0.7960784435272217 , 58],   // Purple
    [ 0.8509804010391235 , 0.21960784494876862, 0.4431372582912445 , 57],   // Pink
    [ 0.8509804010391235 , 0.18039216101169586, 0.1411764770746231 , 6],    // Red
    [ 1                  , 0.34117648005485535, 0.0235294122248888 , 60],   // Orange
    [ 0.8509804010391235 , 0.615686297416687  , 0.062745101749897  , 62],   // Light Orange
    [ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , 19],   // Green
    [ 0                  , 0.615686297416687  , 0.27843138575553894, 26],   // Cold Green
    [ 0                  , 0.6509804129600525 , 0.5803921818733215 , 30],   // Bluish Green
    [ 0                  , 0.6000000238418579 , 0.8509804010391235 , 37],   // Light Blue
    [ 0.7372549176216125 , 0.4627451002597809 , 0.9411764740943909 , 48],   // Light Purple
    [ 0.8823529481887817 , 0.4000000059604645 , 0.5686274766921997 , 56],   // Light Pink
    [ 0.9254902005195618 , 0.3803921639919281 , 0.34117648005485535, 4],    // Skin
    [ 1                  , 0.5137255191802979 , 0.24313725531101227, 10],   // Redish Brown
    [ 0.8941176533699036 , 0.7176470756530762 , 0.30588236451148987, 61],   // Light Brown
    [ 0.6274510025978088 , 0.7529411911964417 , 0.2980392277240753 , 18],   // Light Green
    [ 0.24313725531101227, 0.7333333492279053 , 0.3843137323856354 , 25],   // Bluish Green
    [ 0.26274511218070984, 0.8235294222831726 , 0.7254902124404907 , 32],   // Light Blue
    [ 0.2666666805744171 , 0.7843137383460999 , 1                  , 41]    // Blue
];

TrackState =
{
    NONE: 0,
    MUTE: 1,
    SOLO: 2
};

function AbstractTrackBankProxy (numTracks, numScenes, numSends)
{
    if (!numTracks)
        return;

    this.numTracks = numTracks;
    this.numScenes = numScenes;
    this.numSends = numSends;

    this.numDevices = 8;

    this.textLength = GlobalConfig.TRACK_BANK_TEXT_LENGTH;

    this.canScrollTracksUpFlag   = false;
    this.canScrollTracksDownFlag = false;
    this.canScrollScenesUpFlag   = false;
    this.canScrollScenesDownFlag = false;
    
    this.scenePosition = -1;

    this.trackState = TrackState.MUTE;
    
    // 0: 1 Beat
    // 1: 2 Beat
    // 2: 1 Bar
    // 3: 2 Bars
    // 4: 4 Bars
    // 5: 8 Bars
    // 6: 16 Bars
    // 7: 32 Bars
    this.newClipLength = 2;
    this.recCount = numTracks * numScenes;
    this.listeners = [];
    this.noteListeners = [];
    this.prefferedViews = [];
    this.primaryDevice = null;
    
    this.trackCount = 0;

    this.tracks = this.createTracks (this.numTracks);
    
    this.cursorTrack = host.createArrangerCursorTrack (0, 0);
}

AbstractTrackBankProxy.prototype.init = function ()
{
    this.primaryDevice = new CursorDeviceProxy (this.cursorTrack.createCursorDevice ("Primary", this.numSends), this.numSends);

    for (var i = 0; i < this.numTracks; i++)
    {
        var t = this.trackBank.getChannel (i);

        // DeviceChain attributes
        t.exists ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleExists));
        t.addIsSelectedObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleBankTrackSelection));
        t.addNameObserver (this.textLength, '', doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleName));

        // Channel attributes
        t.isActivated ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleActivated));
        var v = t.getVolume ();
        v.addValueObserver (Config.parameterRange, doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleVolume));
        v.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleVolumeStr));
        var p = t.getPan ();
        p.addValueObserver (Config.parameterRange, doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handlePan));
        p.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handlePanStr));
        t.getMute ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleMute));
        t.getSolo ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleSolo));
        t.addVuMeterObserver (Config.parameterRange, -1, true, doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleVUMeters));
        t.addColorObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleColor));
        t.addNoteObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleNotes));
        
        // Track attributes
        t.addTrackTypeObserver (this.textLength, '', doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleType));
        t.addPositionObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handlePosition));
        t.addIsGroupObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleIsGroup));
        t.getArm ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleRecArm));
        t.getMonitor ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleMonitor));
        t.getAutoMonitor ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleAutoMonitor));
        t.getCrossFadeMode ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleCrossfadeMode));
        t.getCanHoldNoteData ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleCanHoldNotes));
        t.getCanHoldAudioData ().addValueObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleCanHoldAudioData));

        // Slot content changes
        var cs = t.getClipLauncherSlots ();
        cs.addNameObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleSlotName));
        cs.addIsSelectedObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleSlotSelection));
        cs.addHasContentObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleSlotHasContent));
        cs.addPlaybackStateObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handlePlaybackState));
        cs.addColorObserver (doObjectIndex (this, i, AbstractTrackBankProxy.prototype.handleSlotColor));
    }

    this.trackBank.addCanScrollChannelsUpObserver (doObject (this, AbstractTrackBankProxy.prototype.handleCanScrollTracksUp));
    this.trackBank.addCanScrollChannelsDownObserver (doObject (this, AbstractTrackBankProxy.prototype.handleCanScrollTracksDown));
    this.trackBank.addCanScrollScenesUpObserver (doObject (this, AbstractTrackBankProxy.prototype.handleCanScrollScenesUp));
    this.trackBank.addCanScrollScenesDownObserver (doObject (this, AbstractTrackBankProxy.prototype.handleCanScrollScenesDown));
    this.trackBank.addSceneScrollPositionObserver (doObject (this, AbstractTrackBankProxy.prototype.handleSceneScrollPosition), -1);
    
    this.trackBank.addChannelCountObserver (doObject (this, AbstractTrackBankProxy.prototype.handleChannelCount));
};

AbstractTrackBankProxy.prototype.getTrackCount = function ()
{
    return this.trackCount;
};

AbstractTrackBankProxy.prototype.isMuteState = function ()
{
    return this.trackState == TrackState.MUTE;
};

AbstractTrackBankProxy.prototype.isSoloState = function ()
{
    return this.trackState == TrackState.SOLO;
};

AbstractTrackBankProxy.prototype.setTrackState = function (state)
{
    this.trackState = state;
};

AbstractTrackBankProxy.prototype.isClipRecording = function () { return this.recCount != 0; };

AbstractTrackBankProxy.prototype.getNewClipLength = function () { return this.newClipLength; };
AbstractTrackBankProxy.prototype.setNewClipLength = function (value) { this.newClipLength = value; };

AbstractTrackBankProxy.prototype.canScrollTracksUp   = function () { return this.canScrollTracksUpFlag; };
AbstractTrackBankProxy.prototype.canScrollTracksDown = function () { return this.canScrollTracksDownFlag; };
AbstractTrackBankProxy.prototype.canScrollScenesUp   = function () { return this.canScrollScenesUpFlag; };
AbstractTrackBankProxy.prototype.canScrollScenesDown = function () { return this.canScrollScenesDownFlag; };

// listener has 2 parameters: [int] index, [boolean] isSelected
AbstractTrackBankProxy.prototype.addTrackSelectionListener = function (listener)
{
    this.listeners.push (listener);
};

/**
 * Returns a Track value object.
 * @param index
 * @returns {*}
 */
AbstractTrackBankProxy.prototype.getTrack = function (index)
{
    return this.tracks[index];
};

/**
 * Returns the selected Track value object.
 * @returns {*}
 */
AbstractTrackBankProxy.prototype.getSelectedTrack = function ()
{
    for (var i = 0; i < this.numTracks; i++)
    {
        if (this.tracks[i].selected)
            return this.tracks[i];
    }
    return null;
};

AbstractTrackBankProxy.prototype.getSelectedTrackColorEntry = function ()
{
    var selectedTrack = this.getSelectedTrack ();
    return selectedTrack == null ? 0 : AbstractTrackBankProxy.getColorEntry (selectedTrack.color);
};

AbstractTrackBankProxy.prototype.select = function (index)
{
    var t = this.trackBank.getChannel (index);
    if (t != null)
        t.selectInEditor ();
};

AbstractTrackBankProxy.prototype.duplicate = function (index)
{
    var t = this.trackBank.getChannel (index);
    if (t != null)
        t.duplicate ();
};

AbstractTrackBankProxy.prototype.makeVisible = function (index)
{
    var t = this.trackBank.getChannel (index);
    if (t == null)
        return;
    t.makeVisibleInArranger ();
    t.makeVisibleInMixer ();
};

AbstractTrackBankProxy.prototype.changeVolume = function (index, value, fractionValue)
{
    this.trackBank.getChannel (index).getVolume ().inc (calcKnobSpeed (value, fractionValue), Config.parameterRange);
};

AbstractTrackBankProxy.prototype.setVolume = function (index, value)
{
    var t = this.getTrack (index);
    t.volume = value;
    this.trackBank.getChannel (t.index).getVolume ().set (t.volume, Config.parameterRange);
};

AbstractTrackBankProxy.prototype.resetVolume = function (index)
{
    this.trackBank.getChannel (index).getVolume ().reset ();
};

AbstractTrackBankProxy.prototype.touchVolume = function (index, isBeingTouched)
{
    this.trackBank.getChannel (index).getVolume ().touch (isBeingTouched);
};

AbstractTrackBankProxy.prototype.setVolumeIndication = function (index, indicate)
{
    this.trackBank.getChannel (index).getVolume ().setIndication (indicate);
};

AbstractTrackBankProxy.prototype.changePan = function (index, value, fractionValue)
{
    this.trackBank.getChannel (index).getPan ().inc (calcKnobSpeed (value, fractionValue), Config.parameterRange);
};

AbstractTrackBankProxy.prototype.setPan = function (index, value)
{
    var t = this.getTrack (index);
    t.pan = value;
    this.trackBank.getChannel (t.index).getPan ().set (t.pan, Config.parameterRange);
};

AbstractTrackBankProxy.prototype.resetPan = function (index)
{
    this.trackBank.getChannel (index).getPan ().reset ();
};

AbstractTrackBankProxy.prototype.touchPan = function (index, isBeingTouched)
{
    this.trackBank.getChannel (index).getPan ().touch (isBeingTouched);
};

AbstractTrackBankProxy.prototype.setPanIndication = function (index, indicate)
{
    this.trackBank.getChannel (index).getPan ().setIndication (indicate);
};

AbstractTrackBankProxy.prototype.setIsActivated = function (index, value)
{
    this.trackBank.getChannel (index).isActivated ().set (value);
};

AbstractTrackBankProxy.prototype.toggleIsActivated = function (index)
{
    this.trackBank.getChannel (index).isActivated ().toggle ();
};

AbstractTrackBankProxy.prototype.setMute = function (index, value)
{
    this.trackBank.getChannel (index).getMute ().set (value);
};

AbstractTrackBankProxy.prototype.setSolo = function (index, value)
{
    this.trackBank.getChannel (index).getSolo ().set (value);
};

AbstractTrackBankProxy.prototype.setArm = function (index, value)
{
    this.trackBank.getChannel (index).getArm ().set (value);
};

AbstractTrackBankProxy.prototype.toggleMute = function (index)
{
    this.setMute (index, !this.getTrack (index).mute);
};

AbstractTrackBankProxy.prototype.toggleSolo = function (index)
{
    this.setSolo (index, !this.getTrack (index).solo);
};

AbstractTrackBankProxy.prototype.toggleArm = function (index)
{
    this.setArm (index, !this.getTrack (index).recarm);
};

AbstractTrackBankProxy.prototype.setMonitor = function (index, value)
{
    this.trackBank.getTrack (index).getMonitor ().set (value);
};

AbstractTrackBankProxy.prototype.toggleMonitor = function (index)
{
    this.trackBank.getTrack (index).getMonitor ().toggle ();
};

AbstractTrackBankProxy.prototype.setAutoMonitor = function (index, value)
{
    this.trackBank.getTrack (index).getAutoMonitor ().set (value);
};

AbstractTrackBankProxy.prototype.toggleAutoMonitor = function (index)
{
    this.trackBank.getTrack (index).getAutoMonitor ().toggle ();
};

AbstractTrackBankProxy.prototype.getCrossfadeMode = function (index)
{
    return this.tracks[index].crossfadeMode;
};

AbstractTrackBankProxy.prototype.getCrossfadeModeAsNumber = function (index)
{
    switch (this.getCrossfadeMode (index))
    {
        case 'A':
            return 0;
        case 'AB':
            return 1;
        case 'B':
            return 2;
    }
    return -1;
};

AbstractTrackBankProxy.prototype.setCrossfadeMode = function (index, mode)
{
    this.trackBank.getChannel (index).getCrossFadeMode ().set (mode);
};

AbstractTrackBankProxy.prototype.setCrossfadeModeAsNumber = function (index, modeValue)
{
    this.setCrossfadeMode (index, modeValue == 0 ? 'A' : (modeValue == 1 ? 'AB' : 'B'));
};

AbstractTrackBankProxy.prototype.toggleCrossfadeMode = function (index)
{
    switch (this.getCrossfadeMode (index))
    {
        case 'A':
            this.setCrossfadeMode (index, 'B');
            break;
        case 'B':
            this.setCrossfadeMode (index, 'AB');
            break;
        case 'AB':
            this.setCrossfadeMode (index, 'A');
            break;
    }
};

AbstractTrackBankProxy.prototype.stop = function (index)
{
    this.trackBank.getChannel (index).stop ();
};

AbstractTrackBankProxy.prototype.launchScene = function (scene)
{
    this.trackBank.launchScene (scene);
};

AbstractTrackBankProxy.prototype.returnToArrangement = function (index)
{
    this.trackBank.getChannel (index).returnToArrangement ();
};

AbstractTrackBankProxy.prototype.scrollTracksUp = function ()
{
    this.trackBank.scrollChannelsUp ();
};

AbstractTrackBankProxy.prototype.scrollTracksDown = function ()
{
    this.trackBank.scrollChannelsDown ();
};

AbstractTrackBankProxy.prototype.scrollTracksPageUp = function ()
{
    this.trackBank.scrollChannelsPageUp ();
};

AbstractTrackBankProxy.prototype.scrollTracksPageDown = function ()
{
    this.trackBank.scrollChannelsPageDown ();
};

AbstractTrackBankProxy.prototype.scrollScenesUp = function ()
{
    this.trackBank.scrollScenesUp ();
};

AbstractTrackBankProxy.prototype.scrollScenesDown = function ()
{
    this.trackBank.scrollScenesDown ();
};

AbstractTrackBankProxy.prototype.scrollScenesPageUp = function ()
{
    this.trackBank.scrollScenesPageUp ();
};

AbstractTrackBankProxy.prototype.scrollScenesPageDown = function ()
{
    this.trackBank.scrollScenesPageDown ();
};

AbstractTrackBankProxy.prototype.setIndication = function (enable)
{
    for (var index = 0; index < this.numTracks; index++)
        this.getClipLauncherSlots (index).setIndication (enable);
};

/**
 * @param index
 * @returns {ClipLauncherSlots}
 */
AbstractTrackBankProxy.prototype.getClipLauncherSlots = function (index)
{
    return this.trackBank.getChannel (index).getClipLauncherSlots ();
};

/**
 * Returns an array with the selected slots. The array is empty if none is selected.
 */
AbstractTrackBankProxy.prototype.getSelectedSlots = function (trackIndex)
{
    var track = this.getTrack (trackIndex);
    var selection = [];
    for (var i = 0; i < track.slots.length; i++)
    {
        if (track.slots[i].selected)
            selection.push (track.slots[i]);
    }
    return selection;
};

/**
 * Returns the first selected slot or null if none is selected.
 */
AbstractTrackBankProxy.prototype.getSelectedSlot = function (trackIndex)
{
    var track = this.getTrack (trackIndex);
    for (var i = 0; i < track.slots.length; i++)
    {
        if (track.slots[i].selected)
            return track.slots[i];
    }
    return null;
};

/**
 * Returns the first empty slot in the current clip window. If none is empty null is returned.
 * If startFrom is set the search starts from the given index (and wraps around after the last one to 0).
 */
AbstractTrackBankProxy.prototype.getEmptySlot = function (trackIndex, startFrom)
{
    var start = startFrom ? startFrom : 0;
    var track = this.getTrack (trackIndex);
    for (var i = 0; i < track.slots.length; i++)
    {
        var index = (start + i) % track.slots.length;
        if (!track.slots[index].hasContent)
            return track.slots[index];
    }
    return null;
};

AbstractTrackBankProxy.prototype.createClip = function (trackIndex, slotIndex, quartersPerMeasure)
{
    var newCLipLength = this.getNewClipLength ();
    var beats = newCLipLength < 2 ? 
                    Math.pow (2, newCLipLength) :
                    Math.pow (2, (newCLipLength - 2)) * quartersPerMeasure;
    this.getClipLauncherSlots (trackIndex).createEmptyClip (slotIndex, beats);
};

AbstractTrackBankProxy.prototype.showClipInEditor = function (trackIndex, slotIndex)
{
    var cs = this.trackBank.getChannel (trackIndex).getClipLauncherSlots ();
    cs.select (slotIndex);
    cs.showInEditor (slotIndex);
};

AbstractTrackBankProxy.prototype.getScenePosition = function ()
{
    return this.scenePosition;
};

AbstractTrackBankProxy.prototype.scrollToScene = function (position)
{
    this.trackBank.scrollToScene (position);
    // TODO Bugfix required - Call it twice to work around a Bitwig bug
    this.trackBank.scrollToScene (position);
};

/**
 * @returns {ClipLauncherScenesOrSlots}
 */
AbstractTrackBankProxy.prototype.getClipLauncherScenes = function ()
{
    return this.trackBank.getClipLauncherScenes ();
};

AbstractTrackBankProxy.prototype.getTrackColorEntry = function (trackIndex)
{
    var t = this.getTrack (trackIndex);
    return AbstractTrackBankProxy.getColorEntry (t.color);
};

AbstractTrackBankProxy.getColorEntry = function (colorId)
{
    for (var i = 0; i < AbstractTrackBankProxy.COLORS.length; i++)
    {
        var color = AbstractTrackBankProxy.COLORS[i];
        if (color[3] == colorId)
            return color;
    }
    return null;
};

AbstractTrackBankProxy.getColorIndex = function (red, green, blue)
{
    for (var i = 0; i < AbstractTrackBankProxy.COLORS.length; i++)
    {
        var color = AbstractTrackBankProxy.COLORS[i];
        if (Math.abs (color[0] - red ) < 0.0001 &&
            Math.abs (color[1] - green) < 0.0001 &&
            Math.abs (color[2] - blue) < 0.0001)
            return color[3];
    }
    return null;
};

// Stores the given view for the currently selected track
AbstractTrackBankProxy.prototype.setPreferredView = function (view)
{
    var sel = this.getSelectedTrack ();
    if (sel == null)
        return;
    var pos = this.getTrack (sel.index).position;
    if (pos != -1)
        this.prefferedViews[pos] = view;
};

// Get the stored view for the currently selected track or null
AbstractTrackBankProxy.prototype.getPreferredView = function (index)
{
    var pos = this.getTrack (index).position;
    return typeof (this.prefferedViews[pos]) == 'undefined' ? null : this.prefferedViews[pos];
};

AbstractTrackBankProxy.prototype.createTracks = function (count)
{
    var tracks = [];
    for (var i = 0; i < count; i++)
    {
        var t =
        {
            index: i,
            type: '',
            position: i,
            exists: false,
            activated: true,
            selected: false,
            isGroup: false,
            name: '',
            volumeStr: '',
            volume: 0,
            panStr: '',
            pan: 0,
            color: 0,
            vu: 0,
            mute: false,
            solo: false,
            recarm: false,
            monitor: false,
            autoMonitor: false,
            canHoldNotes: false,
            canHoldAudioData: false,
            sends: [],
            slots: [],
            crossfadeMode: 'AB'
        };
        for (var j = 0; j < this.numScenes; j++)
            t.slots.push ({ index: j });
        for (var j = 0; j < this.numSends; j++)
            t.sends.push ({ index: j });
        tracks.push (t);
    }
    return tracks;
};

AbstractTrackBankProxy.prototype.addNoteListener = function (listener)
{
    this.noteListeners.push (listener);
};

AbstractTrackBankProxy.prototype.notifyListeners = function (pressed, note, velocity)
{
    for (var i = 0; i < this.noteListeners.length; i++)
        this.noteListeners[i].call (null, pressed, note, velocity);
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

AbstractTrackBankProxy.prototype.scrollToChannel = function (channel)
{
    if (channel < this.trackCount)
    {
        var pos = Math.floor (channel / this.numTracks) * this.numTracks;
        this.trackBank.scrollToChannel (pos);
        // TODO Bugfix required - Call it twice to work around a Bitwig bug
        this.trackBank.scrollToChannel (pos);
    }
};

AbstractTrackBankProxy.prototype.handleBankTrackSelection = function (index, isSelected)
{
    this.tracks[index].selected = isSelected;
    for (var l = 0; l < this.listeners.length; l++)
        this.listeners[l].call (null, index, isSelected);
};

AbstractTrackBankProxy.prototype.handlePosition = function (index, position)
{
    this.tracks[index].position = position;
};

AbstractTrackBankProxy.prototype.handleIsGroup = function (index, isGroup)
{
    this.tracks[index].isGroup = isGroup;
};

AbstractTrackBankProxy.prototype.handleName = function (index, name)
{
    this.tracks[index].name = name;
};

AbstractTrackBankProxy.prototype.handleVUMeters = function (index, value)
{
    // Limit value to Config.parameterRange due to https://github.com/teotigraphix/Framework4Bitwig/issues/98
    if (value >= Config.parameterRange)
        println ("VU sent with outside range value: " + value);
    this.tracks[index].vu = Math.min (Config.parameterRange - 1, value);
};

AbstractTrackBankProxy.prototype.handleColor = function (index, red, green, blue)
{
    this.tracks[index].color = AbstractTrackBankProxy.getColorIndex (red, green, blue);
};

AbstractTrackBankProxy.prototype.handleNotes = function (index, pressed, note, velocity)
{
    // velocity [float: 0..1]
    var sel = this.getSelectedTrack ();
    if (sel != null && sel.index == index)
        this.notifyListeners (pressed, note, Math.round (velocity * 127.0));
};

AbstractTrackBankProxy.prototype.handleType = function (index, type)
{
    this.tracks[index].type = type;
};

AbstractTrackBankProxy.prototype.handleExists = function (index, exists)
{
    this.tracks[index].exists = exists;
};

AbstractTrackBankProxy.prototype.handleActivated = function (index, activated)
{
    this.tracks[index].activated = activated;
};

AbstractTrackBankProxy.prototype.handleMute = function (index, isMuted)
{
    this.tracks[index].mute = isMuted;
};

AbstractTrackBankProxy.prototype.handleSolo = function (index, isSoloed)
{
    this.tracks[index].solo = isSoloed;
};

AbstractTrackBankProxy.prototype.handleRecArm = function (index, isArmed)
{
    this.tracks[index].recarm = isArmed;
};

AbstractTrackBankProxy.prototype.handleMonitor = function (index, on)
{
    this.tracks[index].monitor = on;
};

AbstractTrackBankProxy.prototype.handleAutoMonitor = function (index, on)
{
    this.tracks[index].autoMonitor = on;
};

AbstractTrackBankProxy.prototype.handleCrossfadeMode = function (index, mode)
{
    this.tracks[index].crossfadeMode = mode;
};

AbstractTrackBankProxy.prototype.handleVolume = function (index, value)
{
    this.tracks[index].volume = value;
};

AbstractTrackBankProxy.prototype.handleVolumeStr = function (index, text)
{
    this.tracks[index].volumeStr = text;
};

AbstractTrackBankProxy.prototype.handlePan = function (index, value)
{
    this.tracks[index].pan = value;
};

AbstractTrackBankProxy.prototype.handlePanStr = function (index, text)
{
    this.tracks[index].panStr = text;
};

AbstractTrackBankProxy.prototype.handleCanHoldNotes = function (index, canHoldNotes)
{
    this.tracks[index].canHoldNotes = canHoldNotes;
};

AbstractTrackBankProxy.prototype.handleCanHoldAudioData = function (index, canHoldAudioData)
{
    this.tracks[index].canHoldAudioData = canHoldAudioData;
};

//--------------------------------------
// Slots Handlers
//--------------------------------------

AbstractTrackBankProxy.prototype.handleSlotName = function (index, slot, name)
{
    this.tracks[index].slots[slot].name = name;
};

AbstractTrackBankProxy.prototype.handleSlotSelection = function (index, slot, isSelected)
{
    this.tracks[index].slots[slot].selected = isSelected;
};

AbstractTrackBankProxy.prototype.handleSlotHasContent = function (index, slot, hasContent)
{
    this.tracks[index].slots[slot].hasContent = hasContent;
};

AbstractTrackBankProxy.prototype.handleSlotColor = function (index, slot, red, green, blue)
{
    this.tracks[index].slots[slot].color = AbstractTrackBankProxy.getColorIndex (red, green, blue);
};

AbstractTrackBankProxy.prototype.handlePlaybackState = function (index, slot, state, isQueued)
{
    var wasRecording = this.tracks[index].slots[slot].isRecording;

    this.tracks[index].slots[slot].isPlaying = state == 1;
    this.tracks[index].slots[slot].isRecording = state == 2;
    this.tracks[index].slots[slot].isQueued = isQueued;

    if (wasRecording === this.tracks[index].slots[slot].isRecording)
        return;
    if (wasRecording)
        this.recCount++;
    else
        this.recCount--;
};

AbstractTrackBankProxy.prototype.handleCanScrollTracksUp = function (canScroll)
{
    this.canScrollTracksUpFlag = canScroll;
};

AbstractTrackBankProxy.prototype.handleCanScrollTracksDown = function (canScroll)
{
    this.canScrollTracksDownFlag = canScroll;
};

AbstractTrackBankProxy.prototype.handleCanScrollScenesUp = function (canScroll)
{
    this.canScrollScenesUpFlag = canScroll;
};

AbstractTrackBankProxy.prototype.handleCanScrollScenesDown = function (canScroll)
{
    this.canScrollScenesDownFlag = canScroll;
};

AbstractTrackBankProxy.prototype.handleSceneScrollPosition = function (position)
{
    this.scenePosition = position;
};

AbstractTrackBankProxy.prototype.handleChannelCount = function (count)
{
    this.trackCount = count;
};
