// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractNoteSequencerView.NUM_DISPLAY_ROWS   = 8;
AbstractNoteSequencerView.NUM_SEQUENCER_ROWS = 7;
AbstractNoteSequencerView.NUM_DISPLAY_COLS   = 8;
AbstractNoteSequencerView.START_KEY          = 36;

function AbstractNoteSequencerView (model)
{
    if (!model) // Called on first prototype creation
        return;
    AbstractSequencerView.call (this, model, 128, AbstractNoteSequencerView.NUM_DISPLAY_COLS);

    this.loopPadPressed = -1;
    this.offsetY = AbstractNoteSequencerView.START_KEY;

    this.clip.scrollTo (0, AbstractNoteSequencerView.START_KEY);
}
AbstractNoteSequencerView.prototype = new AbstractSequencerView ();

AbstractNoteSequencerView.prototype.onActivate = function ()
{
    this.updateScale ();
    AbstractSequencerView.prototype.onActivate.call (this);
};

AbstractNoteSequencerView.prototype.updateNoteMapping = function ()
{
    AbstractSequencerView.prototype.updateNoteMapping.call (this);
    this.updateScale ();
};

AbstractNoteSequencerView.prototype.updateScale = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () ? this.scales.getSequencerMatrix (8, this.offsetY) : this.scales.getEmptyMatrix ();
};

AbstractNoteSequencerView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes ())
        return;
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);

    if (y < AbstractNoteSequencerView.NUM_SEQUENCER_ROWS)
    {
        if (velocity != 0)
            this.clip.toggleStep (x, this.noteMap[y], Config.accentActive ? Config.fixedAccentValue : velocity);
        return;
    }
        
    // Clip length/loop area
    var pad = x;
    if (velocity > 0)   // Button pressed
    {
        if (this.loopPadPressed == -1)  // Not yet a button pressed, store it
            this.loopPadPressed = pad;
    }
    else if (this.loopPadPressed != -1)
    {
        var start = this.loopPadPressed < pad ? this.loopPadPressed : pad;
        var end   = (this.loopPadPressed < pad ? pad : this.loopPadPressed) + 1;
        var quartersPerPad = this.model.getQuartersPerMeasure () / 2;
        
        // Set a new loop between the 2 selected pads
        var newStart = start * quartersPerPad;
        this.clip.setLoopStart (newStart);
        this.clip.setLoopLength ((end - start) * quartersPerPad);
        this.clip.setPlayRange (newStart, end * quartersPerPad);

        this.loopPadPressed = -1;
    }
};

AbstractNoteSequencerView.prototype.updateOctave = function (value)
{
    this.offsetY = value;
    this.updateScale ();
    displayNotification (this.scales.getSequencerRangeText (this.noteMap[0], this.noteMap[AbstractNoteSequencerView.NUM_SEQUENCER_ROWS - 1]));
};

AbstractNoteSequencerView.prototype.drawGrid = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();

    var isKeyboardEnabled = this.model.canSelectedTrackHoldNotes ();
    var step = this.clip.getCurrentStep ();
    var hiStep = this.isInXRange (step) ? step % AbstractNoteSequencerView.NUM_DISPLAY_COLS : -1;
    for (var x = 0; x < AbstractNoteSequencerView.NUM_DISPLAY_COLS; x++)
    {
        for (var y = 0; y < AbstractNoteSequencerView.NUM_SEQUENCER_ROWS; y++)
        {
            // 0: not set, 1: note continues playing, 2: start of note
            var isSet = this.clip.getStep (x, this.noteMap[y]);
            var color = this.getStepColor (isKeyboardEnabled, isSet, x == hiStep, y, selectedTrack);
            this.surface.pads.lightEx (x, AbstractNoteSequencerView.NUM_DISPLAY_ROWS - 1 - y, color, null, false);
        }
    }

	if (AbstractNoteSequencerView.NUM_DISPLAY_ROWS - AbstractNoteSequencerView.NUM_SEQUENCER_ROWS  <= 0)
		return;

    // Clip length/loop area
    var quartersPerPad = this.model.getQuartersPerMeasure () / 2;
    var stepsPerMeasure = Math.round (quartersPerPad / this.resolutions[this.selectedIndex]);
    var currentMeasure = Math.floor (step / stepsPerMeasure);
    var maxQuarters = quartersPerPad * 8;
    var start = this.clip.getLoopStart ();
    var loopStartPad = Math.floor (Math.max (0, start) / quartersPerPad);
    var loopEndPad   = Math.ceil (Math.min (maxQuarters, start + this.clip.getLoopLength ()) / quartersPerPad);
    for (var pad = 0; pad < 8; pad++)
    {
        if (isKeyboardEnabled)
            this.surface.pads.lightEx (pad, 0, pad >= loopStartPad && pad < loopEndPad ? (pad == currentMeasure ? AbstractSequencerView.COLOR_ACTIVE_MEASURE : AbstractSequencerView.COLOR_MEASURE) : AbstractSequencerView.COLOR_NO_CONTENT, null, false);
        else
            this.surface.pads.lightEx (pad, 0, AbstractSequencerView.COLOR_NO_CONTENT, null, false);
    }
};

AbstractNoteSequencerView.prototype.getStepColor = function (isKeyboardEnabled, isSet, hilite, note, selectedTrack)
{
    if (!isKeyboardEnabled)
        return AbstractSequencerView.COLOR_NO_CONTENT;
        
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
            return hilite ? AbstractSequencerView.COLOR_STEP_HILITE_NO_CONTENT : this.getColor (note, selectedTrack)
    }
};

AbstractNoteSequencerView.prototype.scrollUp = function (event)
{
    var offset = this.getScrollOffset ();
    if (this.offsetY + offset < this.clip.getRowSize ())
        this.updateOctave (this.offsetY + offset);
};

AbstractNoteSequencerView.prototype.scrollDown = function (event)
{
    this.updateOctave (Math.max (0, this.offsetY - this.getScrollOffset ()));
};

AbstractNoteSequencerView.prototype.onOctaveDown = function (event)
{
    if (event.isDown ())
        this.scrollDown (event);
};

AbstractNoteSequencerView.prototype.onOctaveUp = function (event)
{
    if (event.isDown ())
        this.scrollUp (event);
};
