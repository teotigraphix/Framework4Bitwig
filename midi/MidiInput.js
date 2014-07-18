// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MidiInput ()
{
}

MidiInput.prototype.init = function ()
{
    this.port = host.getMidiInPort (0);
};

MidiInput.prototype.setMidiCallback = function (f)
{
    this.port.setMidiCallback (f);
};

MidiInput.prototype.createNoteInput = function ()
{
    return null;
};
