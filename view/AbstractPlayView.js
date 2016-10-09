// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractPlayView (model)
{
    if (model == null)
        return;
    
    AbstractView.call (this, model);

    this.scales = model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    this.defaultVelocity = [];
    for (var i = 0; i < 128; i++)
        this.defaultVelocity.push (i);

    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes sent from the sequencer
        this.setPressedKeys (note, pressed, pressed ? velocity : 0);
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));

    this.scrollerInterval = Config.trackScrollInterval;
}
AbstractPlayView.prototype = new AbstractView ();

AbstractPlayView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);
    this.model.getCurrentTrackBank ().setIndication (false);
};

AbstractPlayView.prototype.drawGrid = function ()
{
    var isKeyboardEnabled = this.model.canSelectedTrackHoldNotes ();
    var isRecording = this.model.hasRecordingState ();

    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    for (var i = this.scales.startNote; i < this.scales.endNote; i++)
    {
        this.surface.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
            (isRecording ? AbstractPlayView.COLOR_RECORD : AbstractPlayView.COLOR_PLAY) :
            this.getColor (i, selectedTrack)) : AbstractPlayView.COLOR_OFF, null, false);
    }
};

AbstractPlayView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes () || this.noteMap[note] == -1)
        return;
    // Mark selected notes
    this.setPressedKeys (this.noteMap[note], velocity > 0, velocity);
};

AbstractPlayView.prototype.onPolyAftertouch = function (note, value)
{
    switch (Config.convertAftertouch)
    {
        case -3:
            // Filter poly aftertouch
            break;
        
        case -2:
            // Translate notes of Poly aftertouch to current note mapping
            var n = this.noteMap[this.surface.pads.translateToGrid (note)];
            if (n != -1)
                this.surface.sendMidiEvent (0xA0, n, value);
            break;
        
        case -1:
            // Convert to Channel Aftertouch
            this.surface.sendMidiEvent (0xD0, value, 0);
            break;
            
        default:
            // Midi CC
            this.surface.sendMidiEvent (0xB0, Config.convertAftertouch, value);
            break;
    }
};

AbstractPlayView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decOctave ();
    this.updateNoteMapping ();
    displayNotification (this.scales.getRangeText ());
};

AbstractPlayView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incOctave ();
    this.updateNoteMapping ();
    displayNotification (this.scales.getRangeText ());
};

AbstractPlayView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};

AbstractPlayView.prototype.setPressedKeys = function (note, pressed, velocity)
{
    // Loop over all pads since the note can be present multiple time!
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[i] == note)
            this.pressedKeys[i] = pressed ? velocity : 0;
    }
};

AbstractPlayView.prototype.getPressedKeys = function ()
{
    var keys = new Array (); 
    for (var i = 0; i < 128; i++)
    {
        if (this.pressedKeys[i] != 0)
            keys.push (i);
    }
    return keys;
};

AbstractPlayView.prototype.updateNoteMapping = function ()
{
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, AbstractPlayView.prototype.delayedUpdateNoteMapping), null, 100);
};

AbstractPlayView.prototype.delayedUpdateNoteMapping = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.scales.translateMatrixToGrid (this.noteMap));
};
