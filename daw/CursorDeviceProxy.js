// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorDeviceProxy (cursorDevice, numSends)
{
    this.cursorDevice = cursorDevice;

    this.numSends = numSends;
    this.numParams = 8;
    this.numDeviceLayers = 8;
    this.numDevicesInBank = 8;
    this.numDrumPadLayers = 16;

    this.canSelectPrevious = true;
    this.canSelectNext = true;
    this.hasNextParamPage = true;
    this.hasPreviousParamPage = true;
    this.canScrollLayersUpValue = true;
    this.canScrollLayersDownValue = true;

    this.textLength = GlobalConfig.CURSOR_DEVICE_TEXT_LENGTH;

    this.isWindowOpenValue = false;
    this.hasDrumPadsValue = false;
    this.isNestedValue = false;
    this.hasLayersValue = false;
    this.hasSlotsValue = false;
    
    this.isExpandedValue = false;
    this.isMacroSectionVisibleValue = false;
    this.isParameterPageSectionVisibleValue = false;

    this.selectedParameterPage = -1;
    this.parameterPageNames = null;

    this.fxparams = this.createFXParams (this.numParams);
    this.commonParams = this.createFXParams (this.numParams);
    this.envelopeParams = this.createFXParams (this.numParams);
    this.macroParams = this.createFXParams (this.numParams);
    this.modulationParams = this.createFXParams (this.numParams);

    this.selectedDevice =
    {
        name: 'None',
        enabled: false
    };
    
    this.directParameters = [];
    this.numDirectPageBank = 0;
    this.directParameterPageNames = [];
    this.currentDirectParameterPage = 0;
    this.directParameterObservationEnabled = false;
    this.deviceBanks = [];
    this.drumPadBanks = [];
    this.position = 0;
    this.siblingDevices = initArray ("", this.numDevicesInBank);

    this.isMacroMappings = initArray (false, this.numParams);

    this.cursorDevice.addIsEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handleIsEnabled));
    this.cursorDevice.addPositionObserver (doObject (this, CursorDeviceProxy.prototype.handlePosition));
    this.cursorDevice.addNameObserver (34, 'None', doObject (this, CursorDeviceProxy.prototype.handleName));
    this.cursorDevice.addCanSelectPreviousObserver (doObject (this, CursorDeviceProxy.prototype.handleCanSelectPrevious));
    this.cursorDevice.addCanSelectNextObserver (doObject (this, CursorDeviceProxy.prototype.handleCanSelectNext));
    this.cursorDevice.addPreviousParameterPageEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handlePreviousParameterPageEnabled));
    this.cursorDevice.addNextParameterPageEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handleNextParameterPageEnabled));
    this.cursorDevice.addSelectedPageObserver (-1, doObject (this, CursorDeviceProxy.prototype.handleSelectedPage));
    this.cursorDevice.addPageNamesObserver(doObject (this, CursorDeviceProxy.prototype.handlePageNames));
    this.cursorDevice.isExpanded ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsExpanded));
    this.cursorDevice.isMacroSectionVisible ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsMacroSectionVisible));
    this.cursorDevice.isParameterPageSectionVisible ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsParameterPageSectionVisible));
    
    var i = 0;

    for (i = 0; i < this.numParams; i++)
    {
        var p = this.getParameter (i);
        p.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleParameterName));
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValue));
        p.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValueDisplay));

        p = this.getCommonParameter (i);
        p.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleCommonParameterName));
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleCommonValue));
        p.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleCommonValueDisplay));

        p = this.getEnvelopeParameter (i);
        p.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleEnvelopeParameterName));
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleEnvelopeValue));
        p.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleEnvelopeValueDisplay));
        
        p = this.getMacro (i);
        p.addLabelObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleMacroParameterName));
        var amount = p.getAmount ();
        amount.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleMacroValue));
        amount.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleMacroValueDisplay));
        var mod = p.getModulationSource ();
        mod.addIsMappingObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleIsMapping));

        p = this.getModulationSource (i);
        p.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleModulationSourceName));
        p.addIsMappingObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleModulationSourceIsMapping));
    }
    
    this.cursorDevice.addDirectParameterIdObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterIds));
    this.cursorDevice.addDirectParameterNameObserver (this.textLength, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterNames));
    this.directParameterValueDisplayObserver = this.cursorDevice.addDirectParameterValueDisplayObserver (this.textLength, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValueDisplay));
    this.cursorDevice.addDirectParameterNormalizedValueObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValue));
    
    this.cursorDevice.isWindowOpen ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsWindowOpen));
    
    this.cursorDevice.isNested ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsNested));
    this.cursorDevice.hasDrumPads ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasDrumPads));
    this.cursorDevice.hasLayers ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasLayers));
    this.cursorDevice.hasSlots ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasSlots));

    // Monitor the sibling devices of the cursor device
    this.siblings = this.cursorDevice.createSiblingsDeviceBank (this.numDevicesInBank);
    for (i = 0; i < this.numDevicesInBank; i++)
    {
        var sibling = this.siblings.getDevice (i);
        sibling.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleSiblingName));
    }    

    var layer = null;
    var v = null;
    var p = null;
    
    // Monitor the layers of a container device (if any)
    this.cursorDeviceLayer = this.cursorDevice.createCursorLayer ();
    this.cursorDeviceLayer.addCanSelectPreviousObserver (doObject (this, CursorDeviceProxy.prototype.handleCanScrollLayerDown));
    this.cursorDeviceLayer.addCanSelectNextObserver (doObject (this, CursorDeviceProxy.prototype.handleCanScrollLayerUp));
    
    this.layerBank = this.cursorDevice.createLayerBank (this.numDeviceLayers);
    this.deviceLayers = this.createDeviceLayers (this.numDeviceLayers);
    for (i = 0; i < this.numDeviceLayers; i++)
    {
        layer = this.layerBank.getChannel (i);
        layer.exists ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerExists));
        layer.isActivated ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerActivated));
        layer.addIsSelectedObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerSelection));
        layer.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerName));
        v = layer.getVolume ();
        v.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerVolume));
        v.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerVolumeStr));
        p = layer.getPan ();
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerPan));
        p.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerPanStr));
        layer.addVuMeterObserver (Config.maxParameterValue, -1, true, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerVUMeters));
        layer.getMute ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerMute));
        layer.getSolo ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleLayerSolo));
        // Sends values & texts
        for (var j = 0; j < this.numSends; j++)
        {
            var s = layer.getSend (j);
            if (s == null)
                continue;
            s.addNameObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendName));
            s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendVolume));
            s.addValueDisplayObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendVolumeStr));
        }

        this.deviceBanks[i] = layer.createDeviceBank (this.numDevicesInBank);
    }
    
    // Monitor the drum pad layers of a container device (if any)
    this.drumPadBank = this.cursorDevice.createDrumPadBank (this.numDrumPadLayers);
    this.drumPadLayers = this.createDeviceLayers (this.numDrumPadLayers);
    for (i = 0; i < this.numDrumPadLayers; i++)
    {
        layer = this.drumPadBank.getChannel (i);
        layer.exists ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadExists));
        layer.isActivated ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadActivated));
        layer.addIsSelectedObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadSelection));
        layer.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadName));
        v = layer.getVolume ();
        v.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVolume));
        v.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVolumeStr));
        p = layer.getPan ();
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadPan));
        p.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadPanStr));
        layer.addVuMeterObserver (Config.maxParameterValue, -1, true, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVUMeters));
        layer.getMute ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadMute));
        layer.getSolo ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadSolo));
        layer.addColorObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadColor));
        // Sends values & texts
        for (var j = 0; j < this.numSends; j++)
        {
            var s = layer.getSend (j);
            if (s == null)
                continue;
            s.addNameObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleDrumPadSendName));
            s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleDrumPadSendVolume));
            s.addValueDisplayObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleDrumPadSendVolumeStr));
        }

        this.drumPadBanks[i] = layer.createDeviceBank (this.numDevicesInBank);
    }
}

//--------------------------------------
// Bitwig Device API
//--------------------------------------

CursorDeviceProxy.prototype.getSiblingDeviceName = function (index)
{
    return this.siblingDevices[index];
};

CursorDeviceProxy.prototype.getPositionInChain = function ()
{
    return this.position;
};

CursorDeviceProxy.prototype.getPositionInBank = function ()
{
    return this.position % this.numDevicesInBank;
};

CursorDeviceProxy.prototype.getCommonParameter = function (index)
{
    return this.cursorDevice.getCommonParameter (index);
};

CursorDeviceProxy.prototype.getEnvelopeParameter = function (index)
{
    return this.cursorDevice.getEnvelopeParameter (index);
};

CursorDeviceProxy.prototype.getMacro = function (index)
{
    return this.cursorDevice.getMacro (index);
};

CursorDeviceProxy.prototype.getModulationSource = function (index)
{
    return this.cursorDevice.getModulationSource (index);
};

CursorDeviceProxy.prototype.getParameter = function (indexInPage)
{
    return this.cursorDevice.getParameter (indexInPage);
};

CursorDeviceProxy.prototype.setParameter = function (index, value)
{
    this.getParameter (index).set (value, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetParameter = function (index)
{
    this.getParameter (index).reset ();
};

CursorDeviceProxy.prototype.nextParameterPage = function ()
{
    return this.cursorDevice.nextParameterPage ();
};

CursorDeviceProxy.prototype.previousParameterPage = function ()
{
    return this.cursorDevice.previousParameterPage ();
};

CursorDeviceProxy.prototype.hasPreviousParameterPage = function ()
{
    return this.hasPreviousParamPage;
};

CursorDeviceProxy.prototype.hasNextParameterPage = function ()
{
    return this.hasNextParamPage;
};

CursorDeviceProxy.prototype.getParameterPageNames = function ()
{
    return this.parameterPageNames;
};

CursorDeviceProxy.prototype.getSelectedParameterPageName = function ()
{
    return this.selectedParameterPage >= 0 ? this.parameterPageNames[this.selectedParameterPage] : "";
};

CursorDeviceProxy.prototype.getSelectedParameterPage = function ()
{
    return this.selectedParameterPage;
};

CursorDeviceProxy.prototype.setSelectedParameterPage = function (index)
{
    this.cursorDevice.setParameterPage (index);
};

CursorDeviceProxy.prototype.toggleEnabledState = function ()
{
    this.cursorDevice.toggleEnabledState ();
};

CursorDeviceProxy.prototype.canSelectPreviousFX = function ()
{
    return this.canSelectPrevious;
};

CursorDeviceProxy.prototype.canSelectNextFX = function ()
{
    return this.canSelectNext;
};

CursorDeviceProxy.prototype.selectNext = function ()
{
    var moveBank = this.getPositionInBank () == 7;
    this.cursorDevice.selectNext ();
    if (moveBank)
        this.selectNextBank ();
};

CursorDeviceProxy.prototype.selectPrevious = function ()
{
    var moveBank = this.getPositionInBank () == 0;
    this.cursorDevice.selectPrevious ();
    if (moveBank)
        this.selectPreviousBank ();
};

CursorDeviceProxy.prototype.selectSibling = function (index)
{
    this.cursorDevice.selectDevice (this.siblings.getDevice (index));
};

CursorDeviceProxy.prototype.selectNextBank = function ()
{
    this.siblings.scrollPageDown ();
};

CursorDeviceProxy.prototype.selectPreviousBank = function ()
{
    this.siblings.scrollPageUp ();
};

CursorDeviceProxy.prototype.hasSelectedDevice = function ()
{
    return this.selectedDevice.name != 'None';
};

CursorDeviceProxy.prototype.getSelectedDevice = function ()
{
    return this.selectedDevice;
};

CursorDeviceProxy.prototype.getFXParam = function (index)
{
    return this.fxparams[index];
};

CursorDeviceProxy.prototype.getCommonParam = function (index)
{
    return this.commonParams[index];
};

CursorDeviceProxy.prototype.getEnvelopeParam = function (index)
{
    return this.envelopeParams[index];
};

CursorDeviceProxy.prototype.getMacroParam = function (index)
{
    return this.macroParams[index];
};

CursorDeviceProxy.prototype.getModulationParam = function (index)
{
    return this.modulationParams[index];
};

CursorDeviceProxy.prototype.isWindowOpen = function ()
{
    return this.isWindowOpenValue;
};

CursorDeviceProxy.prototype.toggleWindowOpen = function ()
{
    this.cursorDevice.isWindowOpen ().toggle ();
};

CursorDeviceProxy.prototype.isExpanded = function ()
{
    return this.isExpandedValue;
};

CursorDeviceProxy.prototype.toggleExpanded = function ()
{
    this.cursorDevice.isExpanded ().toggle ();
};

CursorDeviceProxy.prototype.isMacroSectionVisible = function ()
{
    return this.isMacroSectionVisibleValue;
};

CursorDeviceProxy.prototype.toggleMacroSectionVisible = function ()
{
    this.cursorDevice.isMacroSectionVisible ().toggle ();
};

CursorDeviceProxy.prototype.isParameterPageSectionVisible = function ()
{
    return this.isParameterPageSectionVisibleValue;
};

CursorDeviceProxy.prototype.toggleParameterPageSectionVisible = function ()
{
    this.cursorDevice.isParameterPageSectionVisible ().toggle ();
};

CursorDeviceProxy.prototype.isNested = function ()
{
    return this.isNestedValue;
};

CursorDeviceProxy.prototype.hasSlots = function ()
{
    return this.hasSlotsValue;
};

CursorDeviceProxy.prototype.isMacroMapping = function (index)
{
    return this.isMacroMappings[index];
};

//--------------------------------------
// Layer & Drum Pad Abstraction
//--------------------------------------

CursorDeviceProxy.prototype.getLayerOrDrumPad = function (index)
{
    return this.hasDrumPads () ? this.getDrumPad (index) : this.getLayer (index);
};

CursorDeviceProxy.prototype.getSelectedLayerOrDrumPad = function ()
{
    return this.hasDrumPads () ? this.getSelectedDrumPad () : this.getSelectedLayer ();
};

CursorDeviceProxy.prototype.selectLayerOrDrumPad = function (index)
{
    if (this.hasDrumPads ())
        this.selectDrumPad (index);
    else
        this.selectLayer (index);
};

CursorDeviceProxy.prototype.previousLayerOrDrumPad = function ()
{
    if (this.hasDrumPads ())
        this.previousDrumPad ();
    else
        this.previousLayer ();
};

CursorDeviceProxy.prototype.previousLayerOrDrumPadBank = function ()
{
    if (this.hasDrumPads ())
        this.previousDrumPadBank ();
    else
        this.previousLayerBank ();
};

CursorDeviceProxy.prototype.nextLayerOrDrumPad = function ()
{
    if (this.hasDrumPads ())
        this.nextDrumPad ();
    else
        this.nextLayer ();
};

CursorDeviceProxy.prototype.nextLayerOrDrumPadBank = function ()
{
    if (this.hasDrumPads ())
        this.nextDrumPadBank ();
    else
        this.nextLayerBank ();
};

CursorDeviceProxy.prototype.enterLayerOrDrumPad = function (index)
{
    if (this.hasDrumPads ())
        this.enterDrumPad (index);
    else
        this.enterLayer (index);
};

CursorDeviceProxy.prototype.selectFirstDeviceInLayerOrDrumPad = function (index)
{
    if (this.hasDrumPads ())
        this.selectFirstDeviceInDrumPad (index);
    else
        this.selectFirstDeviceInLayer (index);
};

CursorDeviceProxy.prototype.canScrollLayersOrDrumPadsUp = function ()
{
    return this.hasDrumPads () ? this.canScrollDrumPadsUp () : this.canScrollLayersUp ();
};

CursorDeviceProxy.prototype.canScrollLayersOrDrumPadsDown = function ()
{
    return this.hasDrumPads () ? this.canScrollDrumPadsDown () : this.canScrollLayersDown ();
};

CursorDeviceProxy.prototype.scrollLayersOrDrumPadsPageUp = function ()
{
    this.hasDrumPads () ? this.scrollDrumPadsPageUp () : this.scrollLayersPageUp ();
};

CursorDeviceProxy.prototype.scrollLayersOrDrumPadsPageDown = function ()
{
    this.hasDrumPads () ? this.scrollDrumPadsPageDown () : this.scrollLayersPageDown ();
};

CursorDeviceProxy.prototype.changeLayerOrDrumPadVolume = function (index, value, fractionValue)
{
    if (this.hasDrumPads ())
        this.changeDrumPadVolume (index, value, fractionValue);
    else
        this.changeLayerVolume (index, value, fractionValue);
};

CursorDeviceProxy.prototype.setLayerOrDrumPadVolume = function (index, value)
{
    if (this.hasDrumPads ())
        this.setDrumPadVolume (index, value);
    else
        this.setLayerVolume (index, value);
};

CursorDeviceProxy.prototype.resetLayerOrDrumPadVolume = function (index)
{
    if (this.hasDrumPads ())
        this.resetDrumPadVolume (index);
    else
        this.resetLayerVolume (index);
};

CursorDeviceProxy.prototype.changeLayerOrDrumPadPan = function (index, value, fractionValue)
{
    if (this.hasDrumPads ())
        this.changeDrumPadPan (index, value, fractionValue);
    else
        this.changeLayerPan (index, value, fractionValue);
};

CursorDeviceProxy.prototype.setLayerOrDrumPadPan = function (index, value)
{
    if (this.hasDrumPads ())
        this.setDrumPadPan (index, value);
    else
        this.setLayerPan (index, value);
};

CursorDeviceProxy.prototype.resetLayerOrDrumPadPan = function (index)
{
    if (this.hasDrumPads ())
        this.resetDrumPadPan (index);
    else
        this.resetLayerPan (index);
};

CursorDeviceProxy.prototype.changeLayerOrDrumPadSend = function (index, send, value, fractionValue)
{
    if (this.hasDrumPads ())
        this.changeDrumPadSend (index, send, value, fractionValue);
    else
        this.changeLayerSend (index, send, value, fractionValue);
};

CursorDeviceProxy.prototype.setLayerOrDrumPadSend = function (index, send, value)
{
    if (this.hasDrumPads ())
        this.setDrumPadSend (index, send, value);
    else
        this.setLayerSend (index, send, value);
};

CursorDeviceProxy.prototype.resetLayerOrDrumPadSend = function (index, send)
{
    if (this.hasDrumPads ())
        this.resetDrumPadSend (index, send);
    else
        this.resetLayerSend (index, send);
};

CursorDeviceProxy.prototype.toggleLayerOrDrumPadMute = function (index)
{
    if (this.hasDrumPads ())
        this.toggleDrumPadMute (index);
    else
        this.toggleLayerMute (index);
};

CursorDeviceProxy.prototype.setLayerOrDrumPadMute = function (index, value)
{
    if (this.hasDrumPads ())
        this.setDrumPadMute (index, value);
    else
        this.setLayerMute (index, value);
};

CursorDeviceProxy.prototype.toggleLayerOrDrumPadSolo = function (index)
{
    if (this.hasDrumPads ())
        this.toggleDrumPadSolo (index);
    else
        this.toggleLayerSolo (index);
};

CursorDeviceProxy.prototype.setLayerOrDrumPadSolo = function (index, value)
{
    if (this.hasDrumPads ())
        this.setDrumPadSolo (index, value);
    else
        this.setLayerSolo (index, value);
};

//--------------------------------------
// Layers
//--------------------------------------

CursorDeviceProxy.prototype.hasLayers = function ()
{
    return this.hasLayersValue;
};

CursorDeviceProxy.prototype.getLayer = function (index)
{
    return this.deviceLayers[index];
};

CursorDeviceProxy.prototype.getSelectedLayer = function ()
{
    for (var i = 0; i < this.deviceLayers.length; i++)
    {
        if (this.deviceLayers[i].selected)
            return this.deviceLayers[i];
    }
    return null;
};

CursorDeviceProxy.prototype.selectLayer = function (index)
{
    this.layerBank.getChannel (index).selectInEditor ();
};

CursorDeviceProxy.prototype.previousLayer = function ()
{
    var sel = this.getSelectedLayer ();
    var index = sel == null ? 0 : sel.index - 1;
    if (index == -1)
        this.previousLayerBank ();
    else
        this.selectLayer (index);
};

CursorDeviceProxy.prototype.previousLayerBank = function ()
{
    if (!this.canScrollLayersUp ())
        return;
    this.scrollLayersPageUp ();
    scheduleTask (doObject (this, this.selectLayer), [ this.numDeviceLayers - 1 ], 75);
};

CursorDeviceProxy.prototype.nextLayer = function ()
{
    var sel = this.getSelectedLayer ();
    var index = sel == null ? 0 : sel.index + 1;
    if (index == this.numDeviceLayers)
        this.nextLayerBank ();
    else
        this.selectLayer (index);
};

CursorDeviceProxy.prototype.nextLayerBank = function ()
{
    if (!this.canScrollLayersDown ())
        return;
    this.scrollLayersPageDown ();
    scheduleTask (doObject (this, this.selectLayer), [ 0 ], 75);
};

CursorDeviceProxy.prototype.enterLayer = function (index)
{
    this.layerBank.getChannel (index).selectInMixer ();
};

CursorDeviceProxy.prototype.selectParent = function ()
{
    this.cursorDevice.selectParent ();
};

CursorDeviceProxy.prototype.selectChannel = function ()
{
    this.cursorDevice.getChannel ().selectInEditor ();
};

CursorDeviceProxy.prototype.selectFirstDeviceInLayer = function (index)
{
    this.cursorDevice.selectDevice (this.deviceBanks[index].getDevice (0));
};

CursorDeviceProxy.prototype.canScrollLayersUp = function ()
{
    // TODO Bugfix required - up and down are flipped
    return this.canScrollLayersDownValue;
};

CursorDeviceProxy.prototype.canScrollLayersDown = function ()
{
    // TODO Bugfix required - up and down are flipped
    return this.canScrollLayersUpValue;
};

CursorDeviceProxy.prototype.scrollLayersPageUp = function ()
{
    this.layerBank.scrollChannelsPageUp ();
};

CursorDeviceProxy.prototype.scrollLayersPageDown = function ()
{
    this.layerBank.scrollChannelsPageDown ();
};

CursorDeviceProxy.prototype.changeLayerVolume = function (index, value, fractionValue)
{
    var t = this.getLayer (index);
    t.volume = changeValue (value, t.volume, fractionValue, Config.maxParameterValue);
    this.layerBank.getChannel (index).getVolume ().set (t.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setLayerVolume = function (index, value)
{
    var t = this.getLayer (index);
    t.volume = value;
    this.layerBank.getChannel (index).getVolume ().set (t.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetLayerVolume = function (index)
{
    this.layerBank.getChannel (index).getVolume ().reset ();
};

CursorDeviceProxy.prototype.changeLayerPan = function (index, value, fractionValue)
{
    var t = this.getLayer (index);
    t.pan = changeValue (value, t.pan, fractionValue, Config.maxParameterValue);
    this.layerBank.getChannel (index).getPan ().set (t.pan, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setLayerPan = function (index, value)
{
    var t = this.getLayer (index);
    t.pan = value;
    this.layerBank.getChannel (index).getPan ().set (t.pan, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetLayerPan = function (index)
{
    this.layerBank.getChannel (index).getPan ().reset ();
};

CursorDeviceProxy.prototype.changeLayerSend = function (index, sendIndex, value, fractionValue)
{
    var s = this.getLayer (index).sends[sendIndex];
    s.volume = changeValue (value, s.volume, fractionValue, Config.maxParameterValue);
    var send = this.layerBank.getChannel (index).getSend (sendIndex);
    send.set (s.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setLayerSend = function (index, sendIndex, value)
{
    var t = this.getLayer (index);
    var send = t.sends[sendIndex];
    send.volume = value;
    this.layerBank.getChannel (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetLayerSend = function (index, sendIndex)
{
    this.layerBank.getChannel (index).getSend (sendIndex).reset ();
};

CursorDeviceProxy.prototype.toggleLayerMute = function (index)
{
    this.layerBank.getChannel (index).getMute ().set (!this.getLayer (index).mute);
};

CursorDeviceProxy.prototype.setLayerMute = function (index, value)
{
    this.layerBank.getChannel (index).getMute ().set (value);
};

CursorDeviceProxy.prototype.toggleLayerSolo = function (index)
{
    this.layerBank.getChannel (index).getSolo ().set (!this.getLayer (index).solo);
};

CursorDeviceProxy.prototype.setLayerSolo = function (index, value)
{
    this.layerBank.getChannel (index).getSolo ().set (value);
};

//--------------------------------------
// Drum Pads
//--------------------------------------

CursorDeviceProxy.prototype.hasDrumPads = function ()
{
    return this.hasDrumPadsValue;
};

CursorDeviceProxy.prototype.getDrumPad = function (index)
{
    return this.drumPadLayers[index];
};

CursorDeviceProxy.prototype.getSelectedDrumPad = function ()
{
    for (var i = 0; i < this.drumPadLayers.length; i++)
    {
        if (this.drumPadLayers[i].selected)
            return this.drumPadLayers[i];
    }
    return null;
};

CursorDeviceProxy.prototype.selectDrumPad = function (index)
{
    var channel = this.drumPadBank.getChannel (index);
    if (channel != null)
        channel.selectInEditor ();
};

CursorDeviceProxy.prototype.previousDrumPad = function ()
{
    var sel = this.getSelectedDrumPad ();
    var index = sel == null ? 0 : sel.index - 1;
    while (index > 0 && !this.getDrumPad (index).exists)
        index--;
    if (index == -1)
        this.previousDrumPadBank ();
    else
        this.selectDrumPad (index);
};

CursorDeviceProxy.prototype.previousDrumPadBank = function ()
{
    if (!this.canScrollDrumPadsUp ())
        return;
    this.scrollDrumPadsPageUp ();
    scheduleTask (doObject (this, this.selectDrumPad), [ this.numDrumPadLayers - 1 ], 75);
};

CursorDeviceProxy.prototype.nextDrumPad = function ()
{
    var sel = this.getSelectedDrumPad ();
    var index = sel == null ? 0 : sel.index + 1;
    while (index < this.numDrumPadLayers - 1 && !this.getDrumPad (index).exists)
        index++;
    if (index == this.numDrumPadLayers)
        this.nextDrumPadBank ();
    else
        this.selectDrumPad (index);
};

CursorDeviceProxy.prototype.nextDrumPadBank = function ()
{
    if (!this.canScrollDrumPadsDown ())
        return;
    this.scrollDrumPadsPageDown ();
    scheduleTask (doObject (this, this.selectDrumPad), [ 0 ], 75);
};

CursorDeviceProxy.prototype.enterDrumPad = function (index)
{
    this.drumPadBank.getChannel (index).selectInMixer ();
};

CursorDeviceProxy.prototype.changeDrumPadVolume = function (index, value, fractionValue)
{
    var t = this.getDrumPad (index);
    t.volume = changeValue (value, t.volume, fractionValue, Config.maxParameterValue);
    this.drumPadBank.getChannel (index).getVolume ().set (t.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setDrumPadVolume = function (index, value)
{
    var t = this.getDrumPad (index);
    t.volume = value;
    this.drumPadBank.getChannel (index).getVolume ().set (t.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetDrumPadVolume = function (index)
{
    this.drumPadBank.getChannel (index).getVolume ().reset ();
};

CursorDeviceProxy.prototype.changeDrumPadPan = function (index, value, fractionValue)
{
    var t = this.getDrumPad (index);
    t.pan = changeValue (value, t.pan, fractionValue, Config.maxParameterValue);
    this.drumPadBank.getChannel (index).getPan ().set (t.pan, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setDrumPadPan = function (index, value)
{
    var t = this.getDrumPad (index);
    t.pan = value;
    this.drumPadBank.getChannel (index).getPan ().set (t.pan, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetDrumPadPan = function (index)
{
    this.drumPadBank.getChannel (index).getPan ().reset ();
};

CursorDeviceProxy.prototype.changeDrumPadSend = function (index, sendIndex, value, fractionValue)
{
    var s = this.getDrumPad (index).sends[sendIndex];
    s.volume = changeValue (value, s.volume, fractionValue, Config.maxParameterValue);
    var send = this.drumPadBank.getChannel (index).getSend (sendIndex);
    send.set (s.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.setDrumPadSend = function (index, sendIndex, value)
{
    var t = this.getDrumPad (index);
    var send = t.sends[sendIndex];
    send.volume = value;
    this.drumPadBank.getChannel (t.index).getSend (sendIndex).set (send.volume, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.resetDrumPadSend = function (index, sendIndex)
{
    this.drumPadBank.getChannel (index).getSend (sendIndex).reset ();
};

CursorDeviceProxy.prototype.toggleDrumPadMute = function (index)
{
    this.drumPadBank.getChannel (index).getMute ().set (!this.getDrumPad (index).mute);
};

CursorDeviceProxy.prototype.setDrumPadMute = function (index, value)
{
    this.drumPadBank.getChannel (index).getMute ().set (value);
};

CursorDeviceProxy.prototype.toggleDrumPadSolo = function (index)
{
    this.drumPadBank.getChannel (index).getSolo ().set (!this.getDrumPad (index).solo);
};

CursorDeviceProxy.prototype.setDrumPadSolo = function (index, value)
{
    this.drumPadBank.getChannel (index).getSolo ().set (value);
};

CursorDeviceProxy.prototype.selectFirstDeviceInDrumPad = function (index)
{
    this.cursorDevice.selectDevice (this.drumPadBanks[index].getDevice (0));
};

CursorDeviceProxy.prototype.canScrollDrumPadsUp = function ()
{
    // TODO API extension required
    return true;
};

CursorDeviceProxy.prototype.canScrollDrumPadsDown = function ()
{
    // TODO API extension required
    return true;
};

CursorDeviceProxy.prototype.scrollDrumPadsPageUp = function ()
{
    this.drumPadBank.scrollChannelsPageUp ();
};

CursorDeviceProxy.prototype.scrollDrumPadsPageDown = function ()
{
    this.drumPadBank.scrollChannelsPageDown ();
};

//--------------------------------------
// Direct Parameters
//--------------------------------------

CursorDeviceProxy.prototype.getDirectParameters = function ()
{
    return this.directParameters;
};

CursorDeviceProxy.prototype.getDirectParameter = function (id)
{
    for (var i = 0; i < this.directParameters.length; i++)
    {
        if (this.directParameters[i].id == id)
            return this.directParameters[i];
    }
    return null;
};

CursorDeviceProxy.prototype.changeDirectParameter = function (index, value, fractionValue)
{
    var newvalue = changeValue (value, this.directParameters[index].value, fractionValue / 127, 1);
    this.cursorDevice.setDirectParameterValueNormalized (this.directParameters[index].id, newvalue, 1);
};

CursorDeviceProxy.prototype.hasPreviousDirectParameterPage = function ()
{
    return this.directParameters.length > 0 && this.currentDirectParameterPage > 0;
};

CursorDeviceProxy.prototype.hasNextDirectParameterPage = function ()
{
    return this.directParameters.length > 0 && this.currentDirectParameterPage < this.getDirectParameterPagesLength () - 1;
};

CursorDeviceProxy.prototype.previousDirectParameterPage = function ()
{
    this.setSelectedDirectParameterPage (this.currentDirectParameterPage - 1);
};

CursorDeviceProxy.prototype.nextDirectParameterPage = function ()
{
    this.setSelectedDirectParameterPage (this.currentDirectParameterPage + 1);
};

CursorDeviceProxy.prototype.previousDirectParameterPageBank = function ()
{
    this.setSelectedDirectParameterPage (this.currentDirectParameterPage - 8);
};

CursorDeviceProxy.prototype.nextDirectParameterPageBank = function ()
{
    this.setSelectedDirectParameterPage (this.currentDirectParameterPage + 8);
};

CursorDeviceProxy.prototype.getSelectedDirectParameterPageName = function (page)
{
    return this.directParameterPageNames[page];
};

CursorDeviceProxy.prototype.getSelectedDirectParameterPage = function ()
{
    return this.currentDirectParameterPage;
};

CursorDeviceProxy.prototype.setSelectedDirectParameterPage = function (index)
{
    this.currentDirectParameterPage = Math.max (0, Math.min (index, this.getDirectParameterPagesLength () - 1));
    this.enableDirectParameterObservation (this.directParameterObservationEnabled);
};

CursorDeviceProxy.prototype.enableDirectParameterObservation = function (enable)
{
    this.directParameterObservationEnabled = enable;

    // Disable / clear old observers
    this.directParameterValueDisplayObserver.setObservedParameterIds (null);

    if (!enable)
        return;
    
    var paramIds = [];
    for (var i = 0; i < 8; i++)
    {
        var index = this.currentDirectParameterPage * 8 + i;
        if (index >= this.directParameters.length)
            break;
        paramIds.push (this.directParameters[index].id);
    }
    this.directParameterValueDisplayObserver.setObservedParameterIds (paramIds);
};

// Get the number of pages with direct parameters
CursorDeviceProxy.prototype.getDirectParameterPagesLength = function ()
{
    return this.numDirectPageBank;
};

CursorDeviceProxy.prototype.changeDirectPageParameter = function (index, value, fractionValue)
{
    var pos = this.currentDirectParameterPage * 8 + index;
    if (pos < this.directParameters.length)
        this.changeDirectParameter (pos, value, fractionValue);
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

CursorDeviceProxy.prototype.handleIsEnabled = function (isEnabled)
{
    this.selectedDevice.enabled = isEnabled;
};

CursorDeviceProxy.prototype.handlePosition = function (pos)
{
    this.position = pos;
};

CursorDeviceProxy.prototype.handleName = function (name)
{
    this.selectedDevice.name = name;
};

CursorDeviceProxy.prototype.handleCanSelectPrevious = function (isEnabled)
{
    this.canSelectPrevious = isEnabled;
};

CursorDeviceProxy.prototype.handleCanSelectNext = function (isEnabled)
{
    this.canSelectNext = isEnabled;
};

CursorDeviceProxy.prototype.handlePreviousParameterPageEnabled = function (isEnabled)
{
    this.hasPreviousParamPage = isEnabled;
};

CursorDeviceProxy.prototype.handleNextParameterPageEnabled = function (isEnabled)
{
    this.hasNextParamPage = isEnabled;
};

CursorDeviceProxy.prototype.handleSelectedPage = function (page)
{
    this.selectedParameterPage = page;
};

CursorDeviceProxy.prototype.handlePageNames = function ()
{
    this.parameterPageNames = arguments;
};

CursorDeviceProxy.prototype.handleIsExpanded = function (expanded)
{
    this.isExpandedValue = expanded;
};

CursorDeviceProxy.prototype.handleIsMacroSectionVisible = function (isVisible)
{
    this.isMacroSectionVisibleValue = isVisible;
};

CursorDeviceProxy.prototype.handleIsParameterPageSectionVisible = function (isVisible)
{
    this.isParameterPageSectionVisibleValue = isVisible;
};

CursorDeviceProxy.prototype.handleDirectParameterIds = function (ids)
{
    this.directParameters.length = 0;
    for (var i = 0; i < ids.length; i++)
        this.directParameters.push ({ id: ids[i], name: '', valueStr: '', value: '' });

    this.numDirectPageBank = Math.floor (this.directParameters.length / 8) + (this.directParameters.length % 8 > 0 ? 1 : 0);
    this.directParameterPageNames.length = 0;
    for (var i = 0; i < this.numDirectPageBank; i++)
        this.directParameterPageNames.push ("Page " + (i + 1));

    // Reset page to check for new range of pages
    this.setSelectedDirectParameterPage (this.currentDirectParameterPage);
};

CursorDeviceProxy.prototype.handleDirectParameterNames = function (id, name)
{
    var dp = this.getDirectParameter (id);
    if (dp == null)
        host.errorln ("Direct parameter '" + id + "' not found.");
    else
        dp.name = name;
};

CursorDeviceProxy.prototype.handleDirectParameterValueDisplay = function (id, value)
{
    var dp = this.getDirectParameter (id);
    if (dp == null)
        host.errorln ("Direct parameter '" + id + "' not found.");
    else
        dp.valueStr = value;
};

CursorDeviceProxy.prototype.handleDirectParameterValue = function (id, value)
{
    var dp = this.getDirectParameter (id);
    if (dp == null)
        host.errorln ("Direct parameter '" + id + "' not found.");
    else
        dp.value = value;
};

CursorDeviceProxy.prototype.handleParameterName = function (index, name)
{
    this.fxparams[index].name = name;
};

CursorDeviceProxy.prototype.handleValue = function (index, value)
{
    this.fxparams[index].value = value;
};

CursorDeviceProxy.prototype.handleValueDisplay = function (index, value)
{
    this.fxparams[index].valueStr = value;
};

CursorDeviceProxy.prototype.handleCommonParameterName = function (index, name)
{
    this.commonParams[index].name = name;
};

CursorDeviceProxy.prototype.handleCommonValue = function (index, value)
{
    this.commonParams[index].value = value;
};

CursorDeviceProxy.prototype.handleCommonValueDisplay = function (index, value)
{
    this.commonParams[index].valueStr = value;
};

CursorDeviceProxy.prototype.handleEnvelopeParameterName = function (index, name)
{
    this.envelopeParams[index].name = name;
};

CursorDeviceProxy.prototype.handleEnvelopeValue = function (index, value)
{
    this.envelopeParams[index].value = value;
};

CursorDeviceProxy.prototype.handleEnvelopeValueDisplay = function (index, value)
{
    this.envelopeParams[index].valueStr = value;
};

CursorDeviceProxy.prototype.handleMacroParameterName = function (index, name)
{
    this.macroParams[index].name = name;
};

CursorDeviceProxy.prototype.handleMacroValue = function (index, value)
{
    this.macroParams[index].value = value;
};

CursorDeviceProxy.prototype.handleMacroValueDisplay = function (index, value)
{
    this.macroParams[index].valueStr = value;
};

CursorDeviceProxy.prototype.handleIsMapping = function (index, value)
{
    this.isMacroMappings[index] = value;
};

CursorDeviceProxy.prototype.handleModulationSourceName = function (index, name)
{
    this.modulationParams[index].name = name;
};

CursorDeviceProxy.prototype.handleModulationSourceIsMapping = function (index, isMapping)
{
    this.modulationParams[index].value = isMapping;
    this.modulationParams[index].valueStr = isMapping ? 'On' : 'Off';
};

CursorDeviceProxy.prototype.handleIsWindowOpen = function (value)
{
    this.isWindowOpenValue = value;
};

CursorDeviceProxy.prototype.handleIsNested = function (value)
{
    this.isNestedValue = value;
};

CursorDeviceProxy.prototype.handleHasDrumPads = function (value)
{
    this.hasDrumPadsValue = value;
};

CursorDeviceProxy.prototype.handleHasLayers = function (value)
{
    this.hasLayersValue = value;
};

CursorDeviceProxy.prototype.handleHasSlots = function (value)
{
    this.hasSlotsValue = value;
};

CursorDeviceProxy.prototype.handleSiblingName = function (index, name)
{
    this.siblingDevices[index] = name;
};

CursorDeviceProxy.prototype.handleLayerExists = function (index, exists)
{
    this.deviceLayers[index].exists = exists;
};

CursorDeviceProxy.prototype.handleLayerActivated = function (index, activated)
{
    this.deviceLayers[index].activated = activated;
};

CursorDeviceProxy.prototype.handleLayerSelection = function (index, isSelected)
{
    this.deviceLayers[index].selected = isSelected;
};

CursorDeviceProxy.prototype.handleLayerName = function (index, name)
{
    this.deviceLayers[index].name = name;
};

CursorDeviceProxy.prototype.handleLayerVolume = function (index, value)
{
    this.deviceLayers[index].volume = value;
};

CursorDeviceProxy.prototype.handleLayerVolumeStr = function (index, text)
{
    this.deviceLayers[index].volumeStr = text;
};

CursorDeviceProxy.prototype.handleLayerPan = function (index, value)
{
    this.deviceLayers[index].pan = value;
};

CursorDeviceProxy.prototype.handleLayerPanStr = function (index, text)
{
    this.deviceLayers[index].panStr = text;
};

CursorDeviceProxy.prototype.handleLayerVUMeters = function (index, value)
{
    this.deviceLayers[index].vu = value;
};

CursorDeviceProxy.prototype.handleLayerMute = function (index, isMuted)
{
    this.deviceLayers[index].mute = isMuted;
};

CursorDeviceProxy.prototype.handleLayerSolo = function (index, isSoloed)
{
    this.deviceLayers[index].solo = isSoloed;
};

CursorDeviceProxy.prototype.handleLayerSendName = function (index, index2, text)
{
    this.deviceLayers[index].sends[index2].name = text;
};

CursorDeviceProxy.prototype.handleLayerSendVolume = function (index, index2, value)
{
    this.deviceLayers[index].sends[index2].volume = value;
};

CursorDeviceProxy.prototype.handleLayerSendVolumeStr = function (index, index2, text)
{
    this.deviceLayers[index].sends[index2].volumeStr = text;
};

CursorDeviceProxy.prototype.handleCanScrollLayerUp = function (canScroll)
{
    this.canScrollLayersUpValue = canScroll;
};

CursorDeviceProxy.prototype.handleCanScrollLayerDown = function (canScroll)
{
    this.canScrollLayersDownValue = canScroll;
};

CursorDeviceProxy.prototype.handleDrumPadExists = function (index, exists)
{
    this.drumPadLayers[index].exists = exists;
};

CursorDeviceProxy.prototype.handleDrumPadActivated = function (index, activated)
{
    this.drumPadLayers[index].activated = activated;
};

CursorDeviceProxy.prototype.handleDrumPadSelection = function (index, isSelected)
{
    this.drumPadLayers[index].selected = isSelected;
};

CursorDeviceProxy.prototype.handleDrumPadName = function (index, name)
{
    this.drumPadLayers[index].name = name;
};

CursorDeviceProxy.prototype.handleDrumPadVolume = function (index, value)
{
    this.drumPadLayers[index].volume = value;
};

CursorDeviceProxy.prototype.handleDrumPadVolumeStr = function (index, text)
{
    this.drumPadLayers[index].volumeStr = text;
};

CursorDeviceProxy.prototype.handleDrumPadPan = function (index, value)
{
    this.drumPadLayers[index].pan = value;
};

CursorDeviceProxy.prototype.handleDrumPadPanStr = function (index, text)
{
    this.drumPadLayers[index].panStr = text;
};

CursorDeviceProxy.prototype.handleDrumPadVUMeters = function (index, value)
{
    this.drumPadLayers[index].vu = value;
};

CursorDeviceProxy.prototype.handleDrumPadMute = function (index, isMuted)
{
    this.drumPadLayers[index].mute = isMuted;
};

CursorDeviceProxy.prototype.handleDrumPadSolo = function (index, isSoloed)
{
    this.drumPadLayers[index].solo = isSoloed;
};

CursorDeviceProxy.prototype.handleDrumPadColor = function (index, red, green, blue)
{
    this.drumPadLayers[index].color = AbstractTrackBankProxy.getColorIndex (red, green, blue);
};

CursorDeviceProxy.prototype.handleDrumPadSendName = function (index, index2, text)
{
    this.drumPadLayers[index].sends[index2].name = text;
};

CursorDeviceProxy.prototype.handleDrumPadSendVolume = function (index, index2, value)
{
    this.drumPadLayers[index].sends[index2].volume = value;
};

CursorDeviceProxy.prototype.handleDrumPadSendVolumeStr = function (index, index2, text)
{
    this.drumPadLayers[index].sends[index2].volumeStr = text;
};

//--------------------------------------
// Private
//--------------------------------------

CursorDeviceProxy.prototype.createFXParams = function (count)
{
    var fxparams = [];
    for (var i = 0; i < count; i++)
    {
        fxparams.push (
        {
            index: i,
            name: '',
            valueStr: '',
            value: 0
        });
    }
    return fxparams;
};

CursorDeviceProxy.prototype.createDeviceLayers = function (count)
{
    var layers = [];
    for (var i = 0; i < count; i++)
    {
        var l =
        {
            index: i,
            exists: false,
            activated: true,
            selected: false,
            name: '',
            volumeStr: '',
            volume: 0,
            panStr: '',
            pan: 0,
            vu: 0,
            mute: false,
            solo: false,
            sends: []
        };
        for (var j = 0; j < this.numSends; j++)
            l.sends.push ({ index: j, volume: 0 });
        layers.push (l);
    }
    return layers;
};
