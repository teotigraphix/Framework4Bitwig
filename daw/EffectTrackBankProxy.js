// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function EffectTrackBankProxy (numTracks, numScenes)
{
    AbstractTrackBankProxy.call (this, numTracks, numScenes, 0);

    this.trackBank = host.createEffectTrackBank (numTracks, numScenes);
    this.trackSelectionBank = host.createEffectTrackBank (AbstractTrackBankProxy.OBSERVED_TRACKS, 0);
    
    this.init ();
}
EffectTrackBankProxy.prototype = new AbstractTrackBankProxy ();

EffectTrackBankProxy.prototype.changeSend = function (index, sendIndex, value, fractionValue) {};
EffectTrackBankProxy.prototype.setSend = function (index, sendIndex, value) {};
EffectTrackBankProxy.prototype.setSendIndication = function (index, sendIndex, indicate) {};
