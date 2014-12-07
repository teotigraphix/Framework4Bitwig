// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorDeviceProxy (cursorDevice, numSends)
{
    this.cursorDevice = cursorDevice;

    this.numSends = numSends;
    this.numParams = 8;
    this.numDeviceLayers = 8;
    this.numDevicesInBank = 8;
    this.numDrumPadLayers = 16;
    this.presetWidth = 16;

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
    this.deviceBanks = [];

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
    this.cursorDevice.addDirectParameterValueDisplayObserver (this.textLength, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValueDisplay));
    this.cursorDevice.addDirectParameterNormalizedValueObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValue));
    
    this.cursorDevice.isWindowOpen ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsWindowOpen));
    
    this.cursorDevice.isNested ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleIsNested));
    this.cursorDevice.hasDrumPads ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasDrumPads));
    this.cursorDevice.hasLayers ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasLayers));
    this.cursorDevice.hasSlots ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasSlots));

    var layer = null;
    var v = null;
    var p = null;
    
    // Monitor the layers of a container device (if any)
    this.layerBank = this.cursorDevice.createLayerBank (this.numDeviceLayers);
    this.layerBank.addCanScrollChannelsUpObserver (doObject (this, CursorDeviceProxy.prototype.handleCanScrollLayerUp));
    this.layerBank.addCanScrollChannelsDownObserver (doObject (this, CursorDeviceProxy.prototype.handleCanScrollLayerDown));
    
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
            // TODO FIX Required - Always returns null
            if (s != null)
            {
                println ("Layer Sends are fixed!");
            
                s.addNameObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendName));
                s.addValueObserver (Config.maxParameterValue, doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendVolume));
                s.addValueDisplayObserver (this.textLength, '', doObjectDoubleIndex (this, i, j, CursorDeviceProxy.prototype.handleLayerSendVolumeStr));
            }
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
    }

    //----------------------------------
    // Presets
    //----------------------------------

    this.categoryProvider = new PresetProvider (PresetProvider.Kind.CATEGORY);
    this.creatorProvider = new PresetProvider (PresetProvider.Kind.CREATOR);
    this.presetProvider = new PresetProvider (PresetProvider.Kind.PRESET);

    // All categories
    this.cursorDevice.addPresetCategoriesObserver (doObject (this, function ()
    {
        this.categoryProvider.setItems (arguments);
    }));

    // This allows matching from selection made in DAW (full name)
    this.cursorDevice.addPresetCategoryObserver (100, '', doObject (this, function (name)
    {
        this.categoryProvider.setSelectedItemVerbose (name);
    }));

    // Character display
    this.cursorDevice.addPresetCategoryObserver (this.presetWidth, '', doObject (this, function (name)
    {
        this.categoryProvider.setSelectedItem (name);
    }));

    // All creators
    this.cursorDevice.addPresetCreatorsObserver (doObject (this, function ()
    {
        this.creatorProvider.setItems (arguments);
    }));

    // This allows matching from selection made in DAW (full name)
    this.cursorDevice.addPresetCreatorObserver (100, '', doObject (this, function (name)
    {
        this.creatorProvider.setSelectedItemVerbose (name);
    }));

    // Character display
    this.cursorDevice.addPresetCreatorObserver (this.presetWidth, '', doObject (this, function (name)
    {
        this.creatorProvider.setSelectedItem (name);
    }));

    // All presets
    this.cursorDevice.addPresetNamesObserver (doObject (this, function ()
    {
        this.presetProvider.setItems (arguments);
    }));
    
    this.cursorDevice.addPresetNameObserver (100, '', doObject (this, function (name)
    {
        this.presetProvider.setSelectedItemVerbose (name);
    }));
    
    this.cursorDevice.addPresetNameObserver (this.presetWidth, '', doObject (this, function (name)
    {
        this.presetProvider.setSelectedItem (name);
    }));
}

//--------------------------------------
// Bitwig Device API
//--------------------------------------

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

CursorDeviceProxy.prototype.setParameterPage = function (index)
{
    return this.cursorDevice.setParameterPage (index);
};

CursorDeviceProxy.prototype.setPresetCategory = function (index)
{
    return this.cursorDevice.setPresetCategory (index);
};

CursorDeviceProxy.prototype.setPresetCreator = function (index)
{
    return this.cursorDevice.setPresetCreator (index);
};

CursorDeviceProxy.prototype.switchToNextPreset = function ()
{
    return this.cursorDevice.switchToNextPreset ();
};

CursorDeviceProxy.prototype.switchToNextPresetCategory = function ()
{
    return this.cursorDevice.switchToNextPresetCategory ();
};

CursorDeviceProxy.prototype.switchToNextPresetCreator = function ()
{
    return this.cursorDevice.switchToNextPresetCreator ();
};

CursorDeviceProxy.prototype.switchToPreviousPreset = function ()
{
    return this.cursorDevice.switchToPreviousPreset ();
};

CursorDeviceProxy.prototype.switchToPreviousPresetCategory = function ()
{
    return this.cursorDevice.switchToPreviousPresetCategory ();
};

CursorDeviceProxy.prototype.switchToPreviousPresetCreator = function ()
{
    return this.cursorDevice.switchToPreviousPresetCreator ();
};

CursorDeviceProxy.prototype.toggleEnabledState = function ()
{
    return this.cursorDevice.toggleEnabledState ();
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
    return this.cursorDevice.selectNext ();
};

CursorDeviceProxy.prototype.selectPrevious = function ()
{
    return this.cursorDevice.selectPrevious ();
};

CursorDeviceProxy.prototype.selectSibling = function (index)
{
    // TODO API extension required - Very bad workaround
    for (var i = 0; i < 8; i++)
        this.cursorDevice.selectPrevious ();
    for (var i = 0; i < index; i++)
        this.cursorDevice.selectNext ();
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

CursorDeviceProxy.prototype.hasDrumPads = function ()
{
    return this.hasDrumPadsValue;
};

CursorDeviceProxy.prototype.hasSlots = function ()
{
    return this.hasSlotsValue;
};

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

CursorDeviceProxy.prototype.enterLayer = function (index)
{
    this.layerBank.getChannel (index).selectInMixer ();
};

CursorDeviceProxy.prototype.selectParent = function ()
{
    this.cursorDevice.selectParent ();
};

CursorDeviceProxy.prototype.selectFirstDeviceInLayer = function (index)
{
    this.cursorDevice.selectDevice (this.deviceBanks[index].getDevice (0));
};

CursorDeviceProxy.prototype.canScrollLayersUp = function ()
{
    return this.canScrollLayersUpValue;
};

CursorDeviceProxy.prototype.canScrollLayersDown = function ()
{
    return this.canScrollLayersDownValue;
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

CursorDeviceProxy.prototype.changeLayerPan = function (index, value, fractionValue)
{
    var t = this.getLayer (index);
    t.pan = changeValue (value, t.pan, fractionValue, Config.maxParameterValue);
    this.layerBank.getChannel (index).getPan ().set (t.pan, Config.maxParameterValue);
};

CursorDeviceProxy.prototype.toggleLayerMute = function (index)
{
    this.layerBank.getChannel (index).getMute ().set (!this.getLayer (index).mute);
};

CursorDeviceProxy.prototype.toggleLayerSolo = function (index)
{
    this.layerBank.getChannel (index).getSolo ().set (!this.getLayer (index).solo);
};

CursorDeviceProxy.prototype.getDrumPad = function (index)
{
    return this.drumPadLayers[index];
};

CursorDeviceProxy.prototype.scrollDrumPadsPageUp = function ()
{
    this.drumPadBank.scrollChannelsPageUp ();
};

CursorDeviceProxy.prototype.scrollDrumPadsPageDown = function ()
{
    this.drumPadBank.scrollChannelsPageDown ();
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

CursorDeviceProxy.prototype.setSelectedParameterPage = function (page)
{
    this.cursorDevice.setParameterPage (page);
};

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

CursorDeviceProxy.prototype.isMacroMapping = function (index)
{
    return this.isMacroMappings[index];
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
    // TODO FIX Required - Always sends 0 and -1
    if (pos > 0)
        println ("Device position is fixed! " + pos);
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

CursorDeviceProxy.prototype.handleSendName = function (index1, index2, text)
{
    this.deviceLayers[index].sends[index2].name = text;
};

CursorDeviceProxy.prototype.handleSendVolume = function (index1, index2, value)
{
    this.deviceLayers[index].sends[index2].volume = value;
};

CursorDeviceProxy.prototype.handleSendVolumeStr = function (index1, index2, text)
{
    this.deviceLayers[index].sends[index2].volumeStr = text;
};

CursorDeviceProxy.prototype.handleCanScrollLayerUp = function (canScroll)
{
    // TODO FIX Required - Always called with false
    if (canScroll)
        println ("CanScrollLayerUp is fixed!");
    this.canScrollLayersUpValue = canScroll;
};

CursorDeviceProxy.prototype.handleCanScrollLayerDown = function (canScroll)
{
    // TODO FIX Required - Always called with false
    if (canScroll)
        println ("CanScrollLayerDown is fixed!");
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
        layers.push (l);
    }
    return layers;
};

//--------------------------------------
// PresetProvider Class
//--------------------------------------

function PresetProvider (kind)
{
    this.kind = kind;
    this.items = [];
    this.selectedItem = null;
    this.selectedItemVerbose = null;
    this.selectedIndex = -1;
}

PresetProvider.Kind =
{
    CATEGORY: 0,
    CREATOR:  1,
    PRESET:   2
};

PresetProvider.prototype.getSelectedIndex = function ()
{
    return this.selectedIndex;
};

PresetProvider.prototype.getSelectedItem = function ()
{
    return this.selectedItem;
};

PresetProvider.prototype.setSelectedItem = function (item)
{
    this.selectedItem = item;
};

PresetProvider.prototype.setSelectedItemVerbose = function (selectedItemVerbose)
{
    this.selectedItemVerbose = selectedItemVerbose;
    this.itemsChanged ();
};

PresetProvider.prototype.getPagedView = function (pageSize)
{
    var page = Math.floor (this.selectedIndex / pageSize);
    var start = page * pageSize;
    var result = [];
    for (var i = start; i < start + pageSize; i++)
        result.push (this.items[i]);
    return result;
};

PresetProvider.prototype.getView = function (length)
{
    var result = [];
    for (var i = this.selectedIndex; i < this.selectedIndex + length; i++)
        result.push (this.items[i]);
    return result;
};

PresetProvider.prototype.setItems = function (items)
{
    this.items = items;
    this.itemsChanged ();
};

PresetProvider.prototype.itemsChanged = function ()
{
    this.selectedIndex = 0;

    if (this.items == null)
        return;

    var len = this.items.length;
    for (var i = 0; i < len; i++)
    {
        if (this.items[i] == this.selectedItemVerbose)
        {
            this.selectedIndex = i;
            break;
        }
    }
};
