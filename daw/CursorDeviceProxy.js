// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CursorDeviceProxy ()
{
    this.canSelectPrevious = false;
    this.canSelectNext = false;
    this.hasNextParamPage = false;
    this.hasPreviousParamPage = false;
    
    this.textLength = 8;
    
    this.hasDrumPadsValue = false;
    this.hasLayersValue = false;
    this.hasSlotsValue = false;

    this.selectedParameterPage = -1;
    this.parameterPageNames = null;
    this.presetWidth = 16;
    this.fxparams = this.createFXParams (8);
    this.selectedDevice =
    {
        name: 'None',
        enabled: false
    };
    
    this.numDeviceLayers = 8;
    this.numDrumPadLayers = 16;
    this.directParameters = [];

    this.isMacroMappings = initArray (false, 8);
    this.cursorDevice = host.createEditorCursorDevice ();

    this.cursorDevice.addIsEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handleIsEnabled));
    this.cursorDevice.addNameObserver (34, 'None', doObject (this, CursorDeviceProxy.prototype.handleName));
    this.cursorDevice.addCanSelectPreviousObserver (doObject (this, CursorDeviceProxy.prototype.handleCanSelectPrevious));
    this.cursorDevice.addCanSelectNextObserver (doObject (this, CursorDeviceProxy.prototype.handleCanSelectNext));
    this.cursorDevice.addPreviousParameterPageEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handlePreviousParameterPageEnabled));
    this.cursorDevice.addNextParameterPageEnabledObserver (doObject (this, CursorDeviceProxy.prototype.handleNextParameterPageEnabled));
    this.cursorDevice.addSelectedPageObserver (-1, doObject (this, CursorDeviceProxy.prototype.handleSelectedPage));
    this.cursorDevice.addPageNamesObserver(doObject (this, CursorDeviceProxy.prototype.handlePageNames));

    for (var i = 0; i < 8; i++)
    {
        var p = this.getParameter (i);
        p.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleParameterName));
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValue));
        p.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValueDisplay));

        var m = this.getMacro (i).getModulationSource ();
        m.addIsMappingObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleIsMapping));
    }
    
    this.cursorDevice.addDirectParameterIdObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterIds));
    this.cursorDevice.addDirectParameterNameObserver (this.textLength, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterNames));
    this.cursorDevice.addDirectParameterValueDisplayObserver (this.textLength, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValueDisplay));
    this.cursorDevice.addDirectParameterNormalizedValueObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValue));
    
    this.cursorDevice.hasDrumPads ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasDrumPads));
    this.cursorDevice.hasLayers ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasLayers));
    this.cursorDevice.hasSlots ().addValueObserver (doObject (this, CursorDeviceProxy.prototype.handleHasSlots));
    
    // Monitor the layers of a container device (if any)
    this.layerBank = this.cursorDevice.createLayerBank (this.numDeviceLayers);
    this.deviceLayers = this.createDeviceLayers (this.numDeviceLayers);
    for (var i = 0; i < this.numDeviceLayers; i++)
    {
        var layer = this.layerBank.getChannel (i);
        layer.exists ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleExists));
        layer.addIsSelectedObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDeviceLayerSelection));
        layer.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDeviceLayerName));
        var v = layer.getVolume ();
        v.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleVolume));
        v.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleVolumeStr));
        var p = layer.getPan ();
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handlePan));
        p.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handlePanStr));
        layer.addVuMeterObserver (Config.maxParameterValue, -1, true, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleVUMeters));
        layer.getMute ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleMute));
        layer.getSolo ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleSolo));
    }
    
    // Monitor the drum pad layers of a container device (if any)
    this.drumPadBank = this.cursorDevice.createDrumPadBank (this.numDrumPadLayers);
    this.drumPadLayers = this.createDeviceLayers (this.numDrumPadLayers);
    for (var i = 0; i < this.numDrumPadLayers; i++)
    {
        var layer = this.drumPadBank.getChannel (i);
        layer.exists ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadExists));
        layer.addIsSelectedObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadSelection));
        layer.addNameObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadName));
        var v = layer.getVolume ();
        v.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVolume));
        v.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVolumeStr));
        var p = layer.getPan ();
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadPan));
        p.addValueDisplayObserver (this.textLength, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadPanStr));
        layer.addVuMeterObserver (Config.maxParameterValue, -1, true, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadVUMeters));
        layer.getMute ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadMute));
        layer.getSolo ().addValueObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleDrumPadSolo));
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

//--------------------------------------
// Bitwig CursorDevice API
//--------------------------------------

CursorDeviceProxy.prototype.selectNext = function ()
{
    return this.cursorDevice.selectNext ();
};

CursorDeviceProxy.prototype.selectPrevious = function ()
{
    return this.cursorDevice.selectPrevious ();
};

//--------------------------------------
// Public API
//--------------------------------------

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

CursorDeviceProxy.prototype.hasDrumPads = function ()
{
    return this.hasDrumPadsValue;
};

CursorDeviceProxy.prototype.hasLayers = function ()
{
    return this.hasLayersValue;
};

CursorDeviceProxy.prototype.hasSlots = function ()
{
    return this.hasSlotsValue;
};

CursorDeviceProxy.prototype.getSelectedDeviceLayer = function ()
{
    for (var i = 0; i < this.deviceLayers.length; i++)
    {
        if (this.deviceLayers[i].selected)
            return this.deviceLayers[i];
    }
    return null;
}

CursorDeviceProxy.prototype.getDeviceLayer = function (index)
{
    return this.deviceLayers[index];
};

CursorDeviceProxy.prototype.selectDeviceLayer = function (index)
{
println("Selecting " + index);
    this.layerBank.getChannel (index).selectInEditor ();
    this.cursorDevice.selectFirstInLayer (index);
};

CursorDeviceProxy.prototype.canSelectPreviousFX = function ()
{
    return this.canSelectPrevious;
};

CursorDeviceProxy.prototype.canSelectNextFX = function ()
{
    return this.canSelectNext;
};

CursorDeviceProxy.prototype.hasPreviousParameterPage = function ()
{
    return this.hasPreviousParamPage;
};

CursorDeviceProxy.prototype.hasNextParameterPage = function ()
{
    return this.hasNextParamPage;
};

CursorDeviceProxy.prototype.getSelectedParameterPageName = function ()
{
    return this.selectedParameterPage >= 0 ? this.parameterPageNames[this.selectedParameterPage] : "";
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

CursorDeviceProxy.prototype.handleName = function (name)
{
    this.selectedDevice.name = name;
};

CursorDeviceProxy.prototype.handleCanSelectPrevious = function (isEnabled)
{
    // TODO Never called
    println ("CanSelectPrevious: " + isEnabled);
    this.canSelectPrevious = isEnabled;
};

CursorDeviceProxy.prototype.handleCanSelectNext = function (isEnabled)
{
    // TODO Never called
    println ("CanSelectNext:" + isEnabled);
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

CursorDeviceProxy.prototype.handleParameterName = function (index, name)
{
    this.fxparams[index].name = name;
};

CursorDeviceProxy.prototype.handleDirectParameterIds = function ()
{
    this.directParameters.length = 0;
    for (var i = 0; i < arguments.length; i++)
        this.directParameters.push ({ id: arguments[i], name: '', valueStr: '', value: '' });
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
//TODO FIX REQUIRED
//  println("Display "+id+": "+value);
};

CursorDeviceProxy.prototype.handleDirectParameterValue = function (id, value)
{
    var dp = this.getDirectParameter (id);
    if (dp == null)
        host.errorln ("Direct parameter '" + id + "' not found.");
    else
        dp.value = value;
//TODO FIX REQUIRED
//    println("Value "+id+": "+value);
};

CursorDeviceProxy.prototype.handleValue = function (index, value)
{
    this.fxparams[index].value = value;
};

CursorDeviceProxy.prototype.handleValueDisplay = function (index, value)
{
    this.fxparams[index].valueStr = value;
};

CursorDeviceProxy.prototype.handleIsMapping = function (index, value)
{
    this.isMacroMappings[index] = value;
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

CursorDeviceProxy.prototype.handleExists = function (index, exists)
{
    this.deviceLayers[index].exists = exists;
//TODO println(index+" Exists:"+this.deviceLayers[index].exists);    
};

CursorDeviceProxy.prototype.handleDeviceLayerSelection = function (index, isSelected)
{
    this.deviceLayers[index].selected = isSelected;
//TODO println(index+" Selected:"+this.deviceLayers[index].selected);    
};

CursorDeviceProxy.prototype.handleDeviceLayerName = function (index, name)
{
    this.deviceLayers[index].name = name;
//TODO println(index+" Name:"+this.deviceLayers[index].name);
};

CursorDeviceProxy.prototype.handleVolume = function (index, value)
{
    this.deviceLayers[index].volume = value;
//TODO println(index+" Volume:"+this.deviceLayers[index].volume);
};

CursorDeviceProxy.prototype.handleVolumeStr = function (index, text)
{
    this.deviceLayers[index].volumeStr = text;
//TODO println(index+" VolumeStr:"+this.deviceLayers[index].volumeStr);
};

CursorDeviceProxy.prototype.handlePan = function (index, value)
{
    this.deviceLayers[index].pan = value;
//TODO println(index+" Pan:"+this.deviceLayers[index].pan);
};

CursorDeviceProxy.prototype.handlePanStr = function (index, text)
{
    this.deviceLayers[index].panStr = text;
//TODO println(index+" PanStr:"+this.deviceLayers[index].panStr);
};

CursorDeviceProxy.prototype.handleVUMeters = function (index, value)
{
    this.deviceLayers[index].vu = value;
//TODO println(index+" VU:"+this.deviceLayers[index].vu);
};

CursorDeviceProxy.prototype.handleMute = function (index, isMuted)
{
    this.deviceLayers[index].mute = isMuted;
//TODO println(index+" mute:"+this.deviceLayers[index].mute);
};

CursorDeviceProxy.prototype.handleSolo = function (index, isSoloed)
{
    this.deviceLayers[index].solo = isSoloed;
//TODO println(index+" solo:"+this.deviceLayers[index].solo);
};

CursorDeviceProxy.prototype.handleDrumPadExists = function (index, exists)
{
    this.drumPadLayers[index].exists = exists;
//TODO println(index+" Exists:"+this.drumPadLayers[index].exists);    
};

CursorDeviceProxy.prototype.handleDrumPadSelection = function (index, isSelected)
{
    this.drumPadLayers[index].selected = isSelected;
//TODO println(index+" Selected:"+this.drumPadLayers[index].selected);    
};

CursorDeviceProxy.prototype.handleDrumPadName = function (index, name)
{
    this.drumPadLayers[index].name = name;
//TODO println(index+" Name:"+this.drumPadLayers[index].name);
};

CursorDeviceProxy.prototype.handleDrumPadVolume = function (index, value)
{
    this.drumPadLayers[index].volume = value;
//TODO println(index+" Volume:"+this.drumPadLayers[index].volume);
};

CursorDeviceProxy.prototype.handleDrumPadVolumeStr = function (index, text)
{
    this.drumPadLayers[index].volumeStr = text;
//TODO println(index+" VolumeStr:"+this.drumPadLayers[index].volumeStr);
};

CursorDeviceProxy.prototype.handleDrumPadPan = function (index, value)
{
    this.drumPadLayers[index].pan = value;
//TODO println(index+" Pan:"+this.drumPadLayers[index].pan);
};

CursorDeviceProxy.prototype.handleDrumPadPanStr = function (index, text)
{
    this.drumPadLayers[index].panStr = text;
//TODO println(index+" PanStr:"+this.drumPadLayers[index].panStr);
};

CursorDeviceProxy.prototype.handleDrumPadVUMeters = function (index, value)
{
    this.drumPadLayers[index].vu = value;
//TODO println(index+" VU:"+this.drumPadLayers[index].vu);
};

CursorDeviceProxy.prototype.handleDrumPadMute = function (index, isMuted)
{
    this.drumPadLayers[index].mute = isMuted;
//TODO println(index+" mute:"+this.drumPadLayers[index].mute);
};

CursorDeviceProxy.prototype.handleDrumPadSolo = function (index, isSoloed)
{
    this.drumPadLayers[index].solo = isSoloed;
//TODO println(index+" solo:"+this.drumPadLayers[index].solo);
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
            selected: false,
            name: '',
            volumeStr: '',
            volume: 0,
            panStr: '',
            pan: 0,
            vu: 0,
            mute: false,
            solo: false
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

// Not used
PresetProvider.prototype.getSelectedIndex = function ()
{
    return this.selectedIndex;
};

// Not used
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
