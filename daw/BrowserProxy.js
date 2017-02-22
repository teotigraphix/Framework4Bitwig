// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BrowserProxy (cursorTrack, cursorDevice, numFilterColumnEntries, numResults)
{
    this.cursorTrack            = cursorTrack;
    this.cursorDevice           = cursorDevice;
    this.numFilterColumnEntries = numFilterColumnEntries;
    this.numResults             = numResults;
    this.textLength             = GlobalConfig.PRESET_TEXT_LENGTH;
    
    this.browser = host.createPopupBrowser ();
    this.browser.exists ().markInterested ();
    this.browser.selectedContentTypeIndex().markInterested ();
    this.browser.selectedContentTypeName ().markInterested ();
    this.browser.contentTypeNames ().markInterested ();
    
    this.selectedResult = null;
    
    this.filterColumns = [ this.browser.smartCollectionColumn (), this.browser.locationColumn (), this.browser.fileTypeColumn (), this.browser.categoryColumn (), this.browser.tagColumn (), this.browser.creatorColumn (), this.browser.deviceTypeColumn (), this.browser.deviceColumn () ];
    this.numFilterColumns = this.filterColumns.length;
    
    this.filterColumnItemBanks = [];
    this.cursorItems = [];
    this.filterColumnData = this.createFilterColumns (this.numFilterColumns);
    var i;
    var j;
    var item;
    for (i = 0; i < this.numFilterColumns; i++)
    {
        this.filterColumns[i].exists ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleColumnExists));
        this.filterColumns[i].name ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleColumnName));
        this.filterColumns[i].getWildcardItem ().name ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleColumnWildcard));   
        this.filterColumnItemBanks[i] = this.filterColumns[i].createItemBank (this.numFilterColumnEntries);
        
        for (j = 0; j < this.numFilterColumnEntries; j++)
        {
            item = this.filterColumnItemBanks[i].getItem (j);
            item.exists ().addValueObserver (doObjectDoubleIndex (this, i, j, BrowserProxy.prototype.handleItemExists));
            item.name ().addValueObserver (doObjectDoubleIndex (this, i, j, BrowserProxy.prototype.handleItemName));
            item.hitCount ().addValueObserver (doObjectDoubleIndex (this, i, j, BrowserProxy.prototype.handleHitCount));
            item.isSelected ().addValueObserver (doObjectDoubleIndex (this, i, j, BrowserProxy.prototype.handleItemIsSelected));
        }
        
        this.cursorItems[i] = this.filterColumns[i].createCursorItem ();
        this.cursorItems[i].exists ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleCursorItemExists));
        this.cursorItems[i].name ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleCursorItemName));
    }

    this.resultsColumn = this.browser.resultsColumn ();
    this.cursorResult = this.resultsColumn.createCursorItem ();
    this.cursorResult.addValueObserver (this.textLength, "", doObject (this, BrowserProxy.prototype.handleCursorResultValue));
    this.resultsItemBank = this.resultsColumn.createItemBank (this.numResults);
    this.resultData = this.createResultData (this.numResults);
    for (i = 0; i < this.numFilterColumnEntries; i++)
    {
        item = this.resultsItemBank.getItem (i);
        item.exists ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleResultExists));
        item.addValueObserver (this.textLength, "", doObjectIndex (this, i, BrowserProxy.prototype.handleResultName));
        item.isSelected ().addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleResultIsSelected));
    }
}

//--------------------------------------
// Public
//--------------------------------------

BrowserProxy.prototype.isPresetContentType = function ()
{
    return this.getSelectedContentTypeIndex () == 1;
};

BrowserProxy.prototype.getSelectedContentTypeIndex = function ()
{
    return this.browser.selectedContentTypeIndex ().get ();
};

BrowserProxy.prototype.previousContentType = function ()
{
    if (this.getSelectedContentTypeIndex () > 0)
        this.browser.selectedContentTypeIndex ().inc (-1);
};

BrowserProxy.prototype.nextContentType = function ()
{
    if (this.getSelectedContentTypeIndex () < this.getSelectedContentTypeNames ().length - 1)
        this.browser.selectedContentTypeIndex ().inc (1);
};

BrowserProxy.prototype.getSelectedContentType = function ()
{
    return this.browser.selectedContentTypeName ().get ();
};

BrowserProxy.prototype.getSelectedContentTypeNames = function ()
{
    return this.browser.contentTypeNames ().get ();
};

BrowserProxy.prototype.browseForPresets = function ()
{
    this.stopBrowsing (false);
    this.cursorDevice.cursorDevice.browseToReplaceDevice ();
};

BrowserProxy.prototype.browseToInsertBeforeDevice = function ()
{
    this.stopBrowsing (false);
    if (this.cursorDevice.hasSelectedDevice ())
        this.cursorDevice.cursorDevice.browseToInsertBeforeDevice ();
    else
        this.cursorTrack.browseToInsertAtStartOfChain ();
};

BrowserProxy.prototype.browseToInsertAfterDevice = function ()
{
    this.stopBrowsing (false);
    
    if (this.cursorDevice.hasSelectedDevice ())
        this.cursorDevice.cursorDevice.browseToInsertAfterDevice ();
    else
        this.cursorTrack.browseToInsertAtEndOfChain ();
};

BrowserProxy.prototype.stopBrowsing = function (commitSelection)
{
    if (commitSelection)
        this.browser.commit ();
    else
        this.browser.cancel ();
};

BrowserProxy.prototype.isActive = function ()
{
    return this.browser.exists ().get ();
};

BrowserProxy.prototype.resetFilterColumn = function (column)
{
    this.cursorItems[column].selectFirst ();
};

BrowserProxy.prototype.getFilterColumn = function (column)
{
    return this.filterColumnData[column];
};

BrowserProxy.prototype.getFilterColumnCount = function ()
{
    return this.filterColumnData.length;
};

BrowserProxy.prototype.getResultColumn = function ()
{
    return this.resultData;
};

BrowserProxy.prototype.selectPreviousFilterItem = function (column)
{
    this.cursorItems[column].selectPrevious ();
};

BrowserProxy.prototype.selectNextFilterItem = function (column)
{
    this.cursorItems[column].selectNext ();
};

BrowserProxy.prototype.previousFilterItemPage = function (column)
{
    this.filterColumnItemBanks[column].scrollPageUp ();
};

BrowserProxy.prototype.nextFilterItemPage = function (column)
{
    this.filterColumnItemBanks[column].scrollPageDown ();
};

BrowserProxy.prototype.getSelectedFilterItemIndex = function (column)
{
    for (var i = 0; i < this.numFilterColumnEntries; i++)
    {
        if (this.filterColumnData[column].items[i].isSelected)
            return i;
    }
    return -1;
};

BrowserProxy.prototype.selectPreviousResult = function ()
{
    this.cursorResult.selectPrevious ();
};

BrowserProxy.prototype.selectNextResult = function ()
{
    this.cursorResult.selectNext ();
};

BrowserProxy.prototype.getSelectedResult = function ()
{
    return this.selectedResult;
};

BrowserProxy.prototype.getSelectedResultIndex = function ()
{
    for (var i = 0; i < this.numResults; i++)
    {
        if (this.resultData[i].isSelected)
            return i;
    }
    return -1;
};

BrowserProxy.prototype.previousResultPage = function ()
{
    this.resultsItemBank.scrollPageUp ();
};

BrowserProxy.prototype.nextResultPage = function ()
{
    this.resultsItemBank.scrollPageDown ();
};

//--------------------------------------
// Private
//--------------------------------------

BrowserProxy.prototype.createFilterColumns = function (count)
{
    var columns = [];
    for (var i = 0; i < count; i++)
    {
        var col =
        {
            index: i,
            exists: false,
            name: '',
            items: [],
            cursorExists: false,
            cursorName: '',
            wildcard: ''
        };
        for (var j = 0; j < this.numFilterColumnEntries; j++)
            col.items.push ({ index: j, exists: false, name: '', isSelected: false, hits: 0 });
        columns.push (col);
    }
    return columns;
};

BrowserProxy.prototype.createResultData = function (count)
{
    var results = [];
    for (var i = 0; i < count; i++)
    {
        var result =
        {
            index: i,
            exists: false,
            name: ''
        };
        results.push (result);
    }
    return results;
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

BrowserProxy.prototype.handleIsActive = function (active)
{
    this.isActive = active;
};

BrowserProxy.prototype.handleColumnExists = function (index, exists)
{
    this.filterColumnData[index].exists = exists;
};

BrowserProxy.prototype.handleColumnName = function (index, name)
{
    this.filterColumnData[index].name = name;
};

BrowserProxy.prototype.handleColumnWildcard = function (index, wildcard)
{
    this.filterColumnData[index].wildcard = wildcard;
};

BrowserProxy.prototype.handleItemExists = function (index, item, exists)
{
    this.filterColumnData[index].items[item].exists = exists;
};

BrowserProxy.prototype.handleItemName = function (index, item, name)
{
    this.filterColumnData[index].items[item].name = name;
};

BrowserProxy.prototype.handleHitCount = function (index, item, hits)
{
    this.filterColumnData[index].items[item].hits = hits;
};

BrowserProxy.prototype.handleItemIsSelected = function (index, item, isSelected)
{
    this.filterColumnData[index].items[item].isSelected = isSelected;
};

BrowserProxy.prototype.handleResultExists = function (index, exists)
{
    this.resultData[index].exists = exists;
};

BrowserProxy.prototype.handleResultName = function (index, name)
{
    this.resultData[index].name = name;
};

BrowserProxy.prototype.handleResultIsSelected = function (index, isSelected)
{
    this.resultData[index].isSelected = isSelected;
};

BrowserProxy.prototype.handleCursorItemExists = function (index, exists)
{
    this.filterColumnData[index].cursorExists = exists;
};

BrowserProxy.prototype.handleCursorItemName = function (index, name)
{
    this.filterColumnData[index].cursorName = name;
};

BrowserProxy.prototype.handleCursorResultValue = function (value)
{
    this.selectedResult = value;
};
