// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TrackBankProxy (numTracks, numScenes, numSends)
{
    AbstractTrackBankProxy.call (this, numTracks, numScenes, numSends);

    this.trackBank = host.createMainTrackBank (numTracks, numSends, numScenes);
    this.trackSelectionBank = host.createMainTrackBank (AbstractTrackBankProxy.OBSERVED_TRACKS, 0, 0);
    
    this.init ();
    
    // Sends values & texts
    for (var i = 0; i < numTracks; i++)
    {
        var t = this.trackBank.getChannel (i);
        for (var j = 0; j < this.numSends; j++)
        {
            var s = t.getSend (j);
            s.addNameObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendName));
            s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendVolume));
            s.addValueDisplayObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendVolumeStr));
        }
    }
}
TrackBankProxy.prototype = new AbstractTrackBankProxy ();

TrackBankProxy.prototype.changeSend = function (index, sendIndex, value, fractionValue)
{
    var t = this.getTrack (index);
    var send = t.sends[sendIndex];
    send.volume = changeValue (value, send.volume, fractionValue, Config.maxParameterValue);
    this.trackBank.getChannel (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.setSend = function (index, sendIndex, value)
{
    var t = this.getTrack (index);
    var send = t.sends[sendIndex];
    send.volume = value;
    this.trackBank.getChannel (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

TrackBankProxy.prototype.resetSend = function (index, sendIndex)
{
    this.trackBank.getChannel (index).getSend (sendIndex).reset ();
};

TrackBankProxy.prototype.setSendIndication = function (index, sendIndex, indicate)
{
    this.trackBank.getChannel (index).getSend (sendIndex).setIndication (indicate);
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

TrackBankProxy.prototype.handleSendName = function (index1, index2, text)
{
    this.tracks[index1].sends[index2].name = text;
};

TrackBankProxy.prototype.handleSendVolume = function (index1, index2, value)
{
    this.tracks[index1].sends[index2].volume = value;
};

TrackBankProxy.prototype.handleSendVolumeStr = function (index1, index2, text)
{
    this.tracks[index1].sends[index2].volumeStr = text;
};
