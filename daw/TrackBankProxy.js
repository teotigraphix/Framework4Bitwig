// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

TrackBankProxy.COLORS =
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
    [ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , 18],   // Green
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

function TrackBankProxy ()
{
    this.trackBank = host.createMainTrackBank (8, 6, 8);
    
    this.canScrollTracksUpFlag   = false;
    this.canScrollTracksDownFlag = false;
    this.canScrollScenesUpFlag   = false;
    this.canScrollScenesDownFlag = false;

    this.trackState = TrackBankProxy.TrackState.MUTE;
    
    this.newClipLength = 2; // 1 Bar
    this.recCount = 64;
    this.listeners = [];

    this.tracks = this.createTracks (8);

    for (var i = 0; i < 8; i++)
    {
        var t = this.trackBank.getTrack (i);

        /* Test for note observer
        t.addNoteObserver (doObjectIndex (this, i, function (index, pressed, note, velocity)
        {
            // on/off bool, key [0..127], velocity [0...1]
            //println(note);
        }));*/

        // Track name
        t.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
        {
            this.tracks[index].name = name;
        }));
        // Track selection
        t.addIsSelectedObserver (doObjectIndex (this, i, function (index, isSelected)
        {
            this.tracks[index].selected = isSelected;
            for (var l = 0; l < this.listeners.length; l++)
                this.listeners[l].call (null, index, isSelected);
        }));
//        t.addVuMeterObserver (Config.maxParameterValue, -1, true, doObjectIndex (this, i, function (index, value)
//        {
//            this.tracks[index].vu = value;
//        }));

        // Track Mute
        t.getMute ().addValueObserver (doObjectIndex (this, i, function (index, isMuted)
        {
            this.tracks[index].mute = isMuted;
        }));
        // Track Solo
        t.getSolo ().addValueObserver (doObjectIndex (this, i, function (index, isSoloed)
        {
            this.tracks[index].solo = isSoloed;
        }));
        // Track Arm
        t.getArm ().addValueObserver (doObjectIndex (this, i, function (index, isArmed)
        {
            this.tracks[index].recarm = isArmed;
        }));

        // Track volume value & text
        var v = t.getVolume ();
        v.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, function (index, value)
        {
            this.tracks[index].volume = value;
        }));
        v.addValueDisplayObserver (8, '', doObjectIndex (this, i, function (index, text)
        {
            this.tracks[index].volumeStr = text;
        }));

        // Track Pan value & text
        var p = t.getPan ();
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, function (index, value)
        {
            this.tracks[index].pan = value;
        }));
        p.addValueDisplayObserver (8, '', doObjectIndex (this, i, function (index, text)
        {
            this.tracks[index].panStr = text;
        }));

        // Can hold note data?
        t.getCanHoldNoteData ().addValueObserver (doObjectIndex (this, i, function (index, canHoldNotes)
        {
            this.tracks[index].canHoldNotes = canHoldNotes;
        }));

        // Slot content changes
        var cs = t.getClipLauncherSlots ();
        cs.addIsSelectedObserver (doObjectIndex (this, i, function (index, slot, isSelected)
        {
            this.tracks[index].slots[slot].isSelected = isSelected;
        }));
        cs.addHasContentObserver (doObjectIndex (this, i, function (index, slot, hasContent)
        {
            this.tracks[index].slots[slot].hasContent = hasContent;
        }));
        cs.addColorObserver (doObjectIndex (this, i, function (index, slot, red, green, blue)
        {
            this.tracks[index].slots[slot].color = this.getColorIndex (red, green, blue);
        }));
        cs.addIsPlayingObserver (doObjectIndex (this, i, function (index, slot, isPlaying)
        {
            this.tracks[index].slots[slot].isPlaying = isPlaying;
        }));
        cs.addIsRecordingObserver (doObjectIndex (this, i, function (index, slot, isRecording)
        {
            this.recCount = this.recCount + (isRecording ? 1 : -1);
            this.tracks[index].slots[slot].isRecording = isRecording;
        }));
        cs.addIsQueuedObserver (doObjectIndex (this, i, function (index, slot, isQueued)
        {
            this.tracks[index].slots[slot].isQueued = isQueued;
        }));

        // 6 Sends values & texts
        for (var j = 0; j < 6; j++)
        {
            var s = t.getSend (j);
            s.addNameObserver (8, '', doObjectDoubleIndex (this, i, j, function (index1, index2, text)
            {
                this.tracks[index1].sends[index2].name = text;
            }));
            s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, function (index1, index2, value)
            {
                this.tracks[index1].sends[index2].volume = value;
            }));
            s.addValueDisplayObserver (8, '', doObjectDoubleIndex (this, i, j, function (index1, index2, text)
            {
                this.tracks[index1].sends[index2].volumeStr = text;
            }));
        }
    }

    this.trackBank.addCanScrollTracksUpObserver (doObject (this, function (canScroll)
    {
        this.canScrollTracksUpFlag = canScroll;
    }));
    this.trackBank.addCanScrollTracksDownObserver (doObject (this, function (canScroll)
    {
        this.canScrollTracksDownFlag = canScroll;
    }));
    this.trackBank.addCanScrollScenesUpObserver (doObject (this, function (canScroll)
    {
        this.canScrollScenesUpFlag = canScroll;
    }));
    this.trackBank.addCanScrollScenesDownObserver (doObject (this, function (canScroll)
    {
        this.canScrollScenesDownFlag = canScroll;
    }));
}

TrackBankProxy.prototype.isMuteState = function ()
{
    return this.trackState == TrackBankProxy.TrackState.MUTE;
};

TrackBankProxy.prototype.isSoloState = function ()
{
    return this.trackState == TrackBankProxy.TrackState.SOLO;
};

TrackBankProxy.prototype.setTrackState = function (state)
{
    this.trackState = state;
};

TrackBankProxy.prototype.isClipRecording = function () { return this.recCount != 0; };

TrackBankProxy.prototype.getNewClipLength = function () { return this.newClipLength; };
TrackBankProxy.prototype.setNewClipLength = function (value) { this.newClipLength = value; };

TrackBankProxy.prototype.canScrollTracksUp   = function () { return this.canScrollTracksUpFlag; };
TrackBankProxy.prototype.canScrollTracksDown = function () { return this.canScrollTracksDownFlag; };
TrackBankProxy.prototype.canScrollScenesUp   = function () { return this.canScrollScenesUpFlag; };
TrackBankProxy.prototype.canScrollScenesDown = function () { return this.canScrollScenesDownFlag; };

// listener has 2 parameters: [int] index, [boolean] isSelected
TrackBankProxy.prototype.addTrackSelectionListener = function (listener)
{
    this.listeners.push (listener);
};

/**
 * Returns a Track value object.
 * @param index
 * @returns {*}
 */
TrackBankProxy.prototype.getTrack = function (index)
{
    return this.tracks[index];
};

/**
 * Returns the selected Track value object.
 * @returns {*}
 */
TrackBankProxy.prototype.getSelectedTrack = function ()
{
    for (var i = 0; i < 8; i++)
    {
        if (this.tracks[i].selected)
            return this.tracks[i];
    }
    return null;
};

TrackBankProxy.prototype.select = function (index)
{
    var t = this.trackBank.getTrack (index);
    if (t != null)
        t.select ();
};

TrackBankProxy.prototype.changeVolume = function (index, value, fractionValue)
{
    var t = this.getTrack (index);
    t.volume = changeValue (value, t.volume, fractionValue, Config.maxParameterValue);
    this.trackBank.getTrack (t.index).getVolume ().set (t.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.setVolume = function (index, value)
{
    var t = this.getTrack (index);
    t.volume = value;
    this.trackBank.getTrack (t.index).getVolume ().set (t.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.setVolumeIndication = function (index, indicate)
{
    this.trackBank.getTrack (index).getVolume ().setIndication (indicate);
};

TrackBankProxy.prototype.changePan = function (index, value, fractionValue)
{
    var t = this.getTrack (index);
    t.pan = changeValue (value, t.pan, fractionValue, Config.maxParameterValue);
    this.trackBank.getTrack (t.index).getPan ().set (t.pan, Config.maxParameterValue);
};

TrackBankProxy.prototype.setPan = function (index, value, fractionValue)
{
    var t = this.getTrack (index);
    t.pan = value;
    this.trackBank.getTrack (t.index).getPan ().set (t.pan, Config.maxParameterValue);
};

TrackBankProxy.prototype.setPanIndication = function (index, indicate)
{
    this.trackBank.getTrack (index).getPan ().setIndication (indicate);
};

TrackBankProxy.prototype.setMute = function (index, value)
{
    this.getTrack (index).mute = value;
    this.trackBank.getTrack (index).getMute ().set (value);
};

TrackBankProxy.prototype.setSolo = function (index, value)
{
    this.getTrack (index).solo = value;
    this.trackBank.getTrack (index).getSolo ().set (value);
};

TrackBankProxy.prototype.setArm = function (index, value)
{
    this.getTrack (index).recarm = value;
    this.trackBank.getTrack (index).getArm ().set (value);
};

TrackBankProxy.prototype.toggleMute = function (index)
{
    this.setMute (index, !this.getTrack (index).mute);
};

TrackBankProxy.prototype.toggleSolo = function (index)
{
    this.setSolo (index, !this.getTrack (index).solo);
};

TrackBankProxy.prototype.toggleArm = function (index)
{
    this.setArm (index, !this.getTrack (index).recarm);
};

TrackBankProxy.prototype.changeSend = function (index, sendIndex, value, fractionValue)
{
    var t = this.getTrack (index);
    var send = t.sends[sendIndex];
    send.volume = changeValue (value, send.volume, fractionValue, Config.maxParameterValue);
    this.trackBank.getTrack (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.setSend = function (index, sendIndex, value)
{
    var t = this.getTrack (index);
    var send = t.sends[sendIndex];
    send.volume = value;
    this.trackBank.getTrack (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.setSendIndication = function (index, sendIndex, indicate)
{
    this.trackBank.getTrack (index).getSend (sendIndex).setIndication (indicate);
};

TrackBankProxy.prototype.stop = function (index)
{
    this.trackBank.getTrack (index).stop ();
};

TrackBankProxy.prototype.launchScene = function (scene)
{
    this.trackBank.launchScene (scene);
};

TrackBankProxy.prototype.returnToArrangement = function (index)
{
    this.trackBank.getTrack (index).returnToArrangement ();
};

TrackBankProxy.prototype.scrollTracksUp = function ()
{
    this.trackBank.scrollTracksUp ();
};

TrackBankProxy.prototype.scrollTracksDown = function ()
{
    this.trackBank.scrollTracksDown ();
};

TrackBankProxy.prototype.scrollTracksPageUp = function ()
{
    this.trackBank.scrollTracksPageUp ();
};

TrackBankProxy.prototype.scrollTracksPageDown = function ()
{
    this.trackBank.scrollTracksPageDown ();
};

TrackBankProxy.prototype.scrollScenesUp = function ()
{
    this.trackBank.scrollScenesUp ();
};

TrackBankProxy.prototype.scrollScenesDown = function ()
{
    this.trackBank.scrollScenesDown ();
};

TrackBankProxy.prototype.scrollScenesPageUp = function ()
{
    this.trackBank.scrollScenesPageUp ();
};

TrackBankProxy.prototype.scrollScenesPageDown = function ()
{
    this.trackBank.scrollScenesPageDown ();
};

TrackBankProxy.prototype.setIndication = function (enable)
{
    for (var index = 0; index < 8; index++)
        this.trackBank.getTrack (index).getClipLauncherSlots ().setIndication (enable);
};

/**
 * @param index
 * @returns {ClipLauncherSlots}
 */
TrackBankProxy.prototype.getClipLauncherSlots = function (index)
{
    return this.trackBank.getTrack (index).getClipLauncherSlots ();
};

/**
 * @returns {ClipLauncherScenesOrSlots}
 */
TrackBankProxy.prototype.getClipLauncherScenes = function ()
{
    return this.trackBank.getClipLauncherScenes ();
};

TrackBankProxy.prototype.getColorIndex = function (red, green, blue)
{
    for (var i = 0; i < TrackBankProxy.COLORS.length; i++)
    {
        var color = TrackBankProxy.COLORS[i];
        if (Math.abs (color[0] - red ) < 0.0001 &&
            Math.abs (color[1] - green) < 0.0001 &&
            Math.abs (color[2] - blue) < 0.0001)
            return color[3];
    }
    return null;
};

TrackBankProxy.prototype.createTracks = function (count)
{
    var tracks = [];
    for (var i = 0; i < count; i++)
    {
        tracks.push (
            {
                index: i,
                selected: false,
                name: '',
                volumeStr: '',
                volume: 0,
                vu: 0,
                mute: false,
                solo: false,
                recarm: false,
                panStr: '',
                pan: 0,
                sends: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }],
                slots: [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }, { index: 5 }, { index: 6 }, { index: 7 }]
            });
    }
    return tracks;
};

TrackBankProxy.TrackState =
{
    NONE: 0,
    MUTE: 1,
    SOLO: 2
};