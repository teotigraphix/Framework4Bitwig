// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TrackBankProxy ()
{
    this.trackBank = host.createMainTrackBank (8, 6, 8);
    this.trackSelectionBank = host.createMainTrackBank (AbstractTrackBankProxy.OBSERVED_TRACKS, 0, 0);
    
    this.init ();
    
    // 6 Sends values & texts
    for (var i = 0; i < 8; i++)
    {
        var t = this.trackBank.getTrack (i);
        for (var j = 0; j < 6; j++)
        {
            var s = t.getSend (j);
            s.addNameObserver (8, '', doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendName));
            s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendVolume));
            s.addValueDisplayObserver (8, '', doObjectDoubleIndex (this, i, j, TrackBankProxy.prototype.handleSendVolumeStr));
        }
    }
}
TrackBankProxy.prototype = new AbstractTrackBankProxy ();

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
