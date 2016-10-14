// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractDrumView.DRUM_START_KEY = 36;
AbstractDrumView.GRID_COLUMNS = 8;


function AbstractDrumView (model, numSequencerLines, numPlayLines)
{
    if (!model) // Called on first prototype creation
        return;

    this.sequencerLines = numSequencerLines;
    this.playLines = numPlayLines;
    this.allLines = this.sequencerLines + this.playLines;
    this.sequencerSteps = this.sequencerLines * AbstractDrumView.GRID_COLUMNS;
    this.halfColumns = AbstractDrumView.GRID_COLUMNS / 2;
    
    AbstractSequencerView.call (this, model, 128, this.sequencerSteps);
    
    this.offsetY = AbstractDrumView.DRUM_START_KEY;
    
    this.canScrollUp = false;
    this.canScrollDown = false;
    
    this.selectedPad = 0;
    this.pressedKeys = initArray (0, 128);
    this.noteMap = this.scales.getEmptyMatrix ();

    this.loopPadPressed = -1;

    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        this.pressedKeys[note] = pressed ? velocity : 0;
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));
}
AbstractDrumView.prototype = new AbstractSequencerView ();

AbstractDrumView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes ())
        return;

    var index = note - 36;
    var x = index % AbstractDrumView.GRID_COLUMNS;
    var y = Math.floor (index / AbstractDrumView.GRID_COLUMNS);

    // Sequencer steps
    if (y >= this.playLines)
    {
        if (velocity != 0)
        {
            var col = AbstractDrumView.GRID_COLUMNS * (this.allLines - 1 - y) + x;
            this.clip.toggleStep (col, this.offsetY + this.selectedPad, Config.accentActive ? Config.fixedAccentValue : velocity);
        }
        return;
    }

    if (x < this.halfColumns)
    {
        // halfColumns x playLines Drum Pad Grid

        this.selectedPad = this.halfColumns * y + x;
        var playedPad = velocity == 0 ? -1 : this.selectedPad;

        // Mark selected note
        this.pressedKeys[this.offsetY + this.selectedPad] = velocity;
        this.playNote (this.offsetY + this.selectedPad, velocity);
        
        if (playedPad < 0)
            return;
        
        this.handleButtonCombinations (playedPad);
        return;
    }

    // Clip length/loop area
    var pad = (this.playLines - 1 - y) * this.halfColumns + x - this.halfColumns;
    if (velocity > 0)   // Button pressed
    {
        if (this.loopPadPressed == -1)  // Not yet a button pressed, store it
            this.loopPadPressed = pad;
    }
    else if (this.loopPadPressed != -1)
    {
        var start = this.loopPadPressed < pad ? this.loopPadPressed : pad;
        var end   = (this.loopPadPressed < pad ? pad : this.loopPadPressed) + 1;
        var quartersPerPad = this.model.getQuartersPerMeasure ();

        // Set a new loop between the 2 selected pads
        var newStart = start * quartersPerPad;
        this.clip.setLoopStart (newStart);
        this.clip.setLoopLength ((end - start) * quartersPerPad);
        this.clip.setPlayRange (newStart, end * quartersPerPad);

        this.loopPadPressed = -1;
    }
};

AbstractDrumView.prototype.drawGrid = function ()
{
    if (!this.model.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }

    // halfColumns x playLines Drum Pad Grid
    var primary = this.model.getTrackBank ().primaryDevice;
    var hasDrumPads = primary.hasDrumPads ();
    var isSoloed = false;
    if (hasDrumPads)
    {
        for (var i = 0; i < this.halfColumns * this.playLines; i++)
        {
            if (primary.getDrumPad (i).solo)
            {
                isSoloed = true;
                break;
            }
        }
    }
    var isRecording = this.model.hasRecordingState ();
    var y;
    var x;
    for (y = 0; y < this.playLines; y++)
    {
        for (x = 0; x < this.halfColumns; x++)
        {
            var index = this.halfColumns * y + x;
            this.surface.pads.lightEx (x, (this.allLines - 1) - y, this.getPadColor (index, primary, hasDrumPads, isSoloed, isRecording), null, false);
        }
    }
    
    // Clip length/loop area
    var step = this.clip.getCurrentStep ();
    var quartersPerPad = this.model.getQuartersPerMeasure ();
    var stepsPerMeasure = Math.round (quartersPerPad / this.resolutions[this.selectedIndex]);
    var currentMeasure = Math.floor (step / stepsPerMeasure);
    var maxQuarters = quartersPerPad * this.halfColumns * this.playLines;
    var start = this.clip.getLoopStart ();
    var loopStartPad = Math.floor (Math.max (0, start) / quartersPerPad);
    var loopEndPad   = Math.ceil (Math.min (maxQuarters, start + this.clip.getLoopLength ()) / quartersPerPad);
    for (var pad = 0; pad < this.halfColumns * this.playLines; pad++)
    {
        x = this.halfColumns + pad % this.halfColumns;
        y = this.sequencerLines + Math.floor (pad / this.halfColumns);
        this.surface.pads.lightEx (x, y, pad >= loopStartPad && pad < loopEndPad ? (pad == currentMeasure ? AbstractSequencerView.COLOR_ACTIVE_MEASURE : AbstractSequencerView.COLOR_MEASURE) : AbstractSequencerView.COLOR_NO_CONTENT, null, false);
    }

    // Paint the sequencer steps
    var hiStep = this.isInXRange (step) ? step % this.sequencerSteps : -1;
    for (var col = 0; col < this.sequencerSteps; col++)
    {
        var isSet = this.clip.getStep (col, this.offsetY + this.selectedPad);
        var hilite = col == hiStep;
        x = col % AbstractDrumView.GRID_COLUMNS;
        y = Math.floor (col / AbstractDrumView.GRID_COLUMNS);
        this.surface.pads.lightEx (x, y, this.getStepColor (isSet, hilite), null, false);
    }
};

AbstractDrumView.prototype.getPadColor = function (index, primary, hasDrumPads, isSoloed, isRecording)
{
    // Playing note?
    if (this.pressedKeys[this.offsetY + index] > 0)
        return isRecording ? AbstractDrumView.COLOR_RECORD : AbstractDrumView.COLOR_PLAY;
    // Selected?
    if (this.selectedPad == index)
        return AbstractDrumView.COLOR_SELECTED;
    // Exists and active?
    var drumPad = primary.getDrumPad (index);
    if (!drumPad.exists || !drumPad.activated)
        return AbstractDrumView.COLOR_NO_CONTENT;
    // Muted or soloed?
    if (drumPad.mute || (isSoloed && !drumPad.solo))
        return AbstractDrumView.COLOR_MUTED;
    return this.getPadContentColor (drumPad);
};

AbstractDrumView.prototype.getPadContentColor = function (drumPad)
{
    return drumPad.color ? drumPad.color : AbstractDrumView.COLOR_HAS_CONTENT;
};

AbstractDrumView.prototype.getStepColor = function (isSet, hilite)
{
    switch (isSet)
    {
        // Note continues
        case 1:
            return hilite ? AbstractSequencerView.COLOR_STEP_HILITE_CONTENT : AbstractSequencerView.COLOR_CONTENT_CONT;
        // Note starts
        case 2:
            return hilite ? AbstractSequencerView.COLOR_STEP_HILITE_CONTENT : AbstractSequencerView.COLOR_CONTENT;
        // Empty
        default:
            return hilite ? AbstractSequencerView.COLOR_STEP_HILITE_NO_CONTENT : AbstractSequencerView.COLOR_NO_CONTENT
    }
};

AbstractDrumView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};

AbstractDrumView.prototype.updateArrowStates = function ()
{
    this.canScrollLeft = this.offsetX > 0;
    this.canScrollRight = true; // TODO API extension required - We do not know the number of steps
};

AbstractDrumView.prototype.updateNoteMapping = function ()
{
    var turnOn = this.model.canSelectedTrackHoldNotes () && !this.surface.isSelectPressed () && !this.surface.isDeletePressed () && !this.surface.isMutePressed () && !this.surface.isSoloPressed ();
    this.noteMap = turnOn ? this.scales.getDrumMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.scales.translateMatrixToGrid (this.noteMap));
};

AbstractDrumView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decDrumOctave ();
    this.offsetY = AbstractDrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
    this.updateNoteMapping ();
    displayNotification (this.scales.getDrumRangeText ());
    this.model.getTrackBank ().primaryDevice.scrollDrumPadsPageUp ();
};

AbstractDrumView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incDrumOctave ();
    this.offsetY = AbstractDrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
    this.updateNoteMapping ();
    displayNotification (this.scales.getDrumRangeText ());
    this.model.getTrackBank ().primaryDevice.scrollDrumPadsPageDown ();
};

AbstractDrumView.prototype.playNote = function (note, velocity)
{
    // Hook for playing notes with grids who do not use midi notes
};

AbstractDrumView.prototype.handleButtonCombinations = function (playedPad)
{
    if (this.surface.isDeletePressed ())
    {
        // Delete all of the notes on that 'pad'
        this.handleDeleteButton (playedPad);
        return;
    }

    if (this.surface.isMutePressed ())
    {
        // Mute that 'pad'
        this.handleMuteButton (playedPad);
        return;
    }

    if (this.surface.isSoloPressed ())
    {
        // Solo that 'pad'
        this.handleSoloButton (playedPad);
        return;
    }

    if (this.surface.isSelectPressed () || Config.autoSelectDrum == Config.AUTO_SELECT_DRUM_CHANNEL)
    {
        // Also select the matching device layer channel of the pad
        this.handleSelectButton (playedPad);
    }
};

AbstractDrumView.prototype.handleDeleteButton = function (playedPad)
{
    this.surface.setButtonConsumed (this.surface.deleteButtonId);
    this.clip.clearRow (this.offsetY + this.selectedPad);
};

AbstractDrumView.prototype.handleMuteButton = function (playedPad)
{
    this.surface.setButtonConsumed (this.surface.muteButtonId);
    this.model.getTrackBank ().primaryDevice.toggleLayerOrDrumPadMute (playedPad);
};

AbstractDrumView.prototype.handleSoloButton = function (playedPad)
{
    this.surface.setButtonConsumed (this.surface.soloButtonId);
    this.model.getTrackBank ().primaryDevice.toggleLayerOrDrumPadSolo (playedPad);
};

AbstractDrumView.prototype.handleSelectButton = function (playedPad)
{
    // Hook for select button combibation with pads
};

AbstractDrumView.prototype.onSelect = function (event)
{
    if (!event.isLong ())
        this.updateNoteMapping ();
};

AbstractDrumView.prototype.onDelete = function (event)
{
    if (!event.isLong ())
        this.updateNoteMapping ();
};
