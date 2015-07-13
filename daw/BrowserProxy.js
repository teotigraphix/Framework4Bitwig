// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BrowserProxy (device)
{
    this.numFilterColumns = 6;        // TODO
    this.numFilterColumnEntries = 16; // TODO
    this.numResults = 16;             // TODO
    
    this.textLength = GlobalConfig.PRESET_TEXT_LENGTH;

    this.browser = device.cursorDevice.createDeviceBrowser (this.numFilterColumnEntries, this.numResults);

    this.presetBrowsingSession = new BrowserSessionProxy (this.browser.getPresetSession (), this.textLength, this.numFilterColumns, this.numFilterColumnEntries, this.numResults);
    this.deviceBrowsingSession = new BrowserSessionProxy (this.browser.getDeviceSession (), this.textLength, this.numFilterColumns, this.numFilterColumnEntries, this.numResults);
}

//--------------------------------------
// Public
//--------------------------------------

BrowserProxy.prototype.browseForPresets = function ()
{
    this.stopBrowsing (false);
    
    this.presetBrowsingSession.activate ();
    this.browser.startBrowsing ();
};

BrowserProxy.prototype.browseForDevices = function ()
{
    this.stopBrowsing (false);
    
    this.deviceBrowsingSession.activate ();
    this.browser.startBrowsing ();
};

BrowserProxy.prototype.stopBrowsing = function (commitSelection)
{
    if (commitSelection)
        this.browser.commitSelectedResult ();
    else
        this.browser.cancelBrowsing ();
};

BrowserProxy.prototype.getPresetSession = function ()
{
    return this.presetBrowsingSession;
};

BrowserProxy.prototype.getDeviceSession = function ()
{
    return this.deviceBrowsingSession;
};

//////////////////////
// Preset Session

BrowserProxy.prototype.getPresetFilterColumn = function (column)
{
    return this.presetBrowsingSession.getFilterColumn (column);
};

BrowserProxy.prototype.getPresetResultColumn = function ()
{
    return this.presetBrowsingSession.getResultColumn ();
};

BrowserProxy.prototype.selectPreviousPresetFilterItem = function (column)
{
	this.presetBrowsingSession.selectPreviousFilterItem (column);
};

BrowserProxy.prototype.selectNextPresetFilterItem = function (column)
{
	this.presetBrowsingSession.selectNextFilterItem (column);
};

BrowserProxy.prototype.selectPreviousPreset = function ()
{
	this.presetBrowsingSession.selectPreviousResult ();
};

BrowserProxy.prototype.selectNextPreset = function ()
{
	this.presetBrowsingSession.selectNextResult ();
};

//////////////////////
// Device Session

BrowserProxy.prototype.getDeviceFilterColumn = function (column)
{
    return this.deviceBrowsingSession.getFilterColumn (column);
};

BrowserProxy.prototype.getDeviceResultColumn = function ()
{
    return this.deviceBrowsingSession.getResultColumn ();
};

BrowserProxy.prototype.selectPreviousDeviceFilterItem = function (column)
{
	this.deviceBrowsingSession.selectPreviousFilterItem (column);
};

BrowserProxy.prototype.selectNextDeviceFilterItem = function (column)
{
	this.deviceBrowsingSession.selectNextFilterItem (column);
};

BrowserProxy.prototype.selectPreviousDevice = function ()
{
	this.deviceBrowsingSession.selectPreviousResult ();
};

BrowserProxy.prototype.selectNextDevice = function ()
{
	this.deviceBrowsingSession.selectNextResult ();
};
