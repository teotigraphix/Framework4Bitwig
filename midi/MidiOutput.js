// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MidiOutput ()
{
    this.port = host.getMidiOutPort (0);
}

MidiOutput.prototype.sendCC = function (cc, value)
{
    this.port.sendMidi (0xB0, cc, value);
};

MidiOutput.prototype.sendNote = function (note, velocity)
{
    this.port.sendMidi (0x90, note, velocity);
};

MidiOutput.prototype.sendNoteEx = function (channel, note, velocity)
{
    this.port.sendMidi (0x90 + channel, note, velocity);
};

MidiOutput.prototype.sendSysex = function (data)
{
    this.port.sendSysex (data);
};
