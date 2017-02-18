// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function EffectTrackBankProxy (cursorTrack, numTracks, numScenes, audioInstrumentTrackBank)
{
    AbstractTrackBankProxy.call (this, numTracks, numScenes, 0);
    
    this.cursorTrack = cursorTrack;
    
    this.audioInstrumentTrackBank = audioInstrumentTrackBank;

    this.trackBank = host.createEffectTrackBank (numTracks, numScenes);
    this.trackBank.followCursorTrack (cursorTrack);
    
    this.init ();
}
EffectTrackBankProxy.prototype = new AbstractTrackBankProxy ();

EffectTrackBankProxy.prototype.changeSend = function (index, sendIndex, value, fractionValue) {};
EffectTrackBankProxy.prototype.setSend = function (index, sendIndex, value) {};
EffectTrackBankProxy.prototype.setSendIndication = function (index, sendIndex, indicate) {};

EffectTrackBankProxy.prototype.scrollToChannel = function (channel)
{
    channel = channel - this.audioInstrumentTrackBank.getTrackCount ();
    if (channel >= 0 && channel < this.getTrackCount ())
        this.trackBank.scrollToChannel (Math.floor (channel / this.numTracks) * this.numTracks);
};
