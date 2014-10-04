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

    this.selectedParameterPage = -1;
    this.parameterPageNames = null;
    this.presetWidth = 16;
    this.fxparams = this.createFXParams (8);
    this.selectedDevice =
    {
        name: 'None',
        enabled: false
    };

    this.isMacroMappings = initArray(false, 8);
    this.cursorDevice = host.createEditorDeviceSelection (true);

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
        p.addNameObserver (8, '', doObjectIndex (this, i, CursorDeviceProxy.prototype.handleParameterName));
        p.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValue));
        p.addValueDisplayObserver (8, '',  doObjectIndex (this, i, CursorDeviceProxy.prototype.handleValueDisplay));

        var m = this.getMacro (i).getModulationSource ();
        m.addIsMappingObserver (doObjectIndex (this, i, CursorDeviceProxy.prototype.handleIsMapping));
    }
    
    this.cursorDevice.addDirectParameterIdObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterIds));
    this.cursorDevice.addDirectParameterNameObserver (8, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterNames));
    this.cursorDevice.addDirectParameterValueDisplayObserver (8, doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValueDisplay));
    this.cursorDevice.addDirectParameterNormalizedValueObserver (doObject (this, CursorDeviceProxy.prototype.handleDirectParameterValue));

    //----------------------------------
    // Presets
    //----------------------------------

    this.currentPreset = null;

    this.categoryProvider = new PresetProvider (PresetProvider.Kind.CATEGORY);
    this.creatorProvider = new PresetProvider (PresetProvider.Kind.CREATOR);
    //this.presetProvider = new PresetProvider (PresetProvider.Kind.PRESET);

    // - Category
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

    // - Creator
    this.cursorDevice.addPresetCreatorsObserver (doObject (this, function ()
    {
        this.creatorProvider.setItems(arguments);
    }));

    // This allows matching from selection made in DAW (full name)
    this.cursorDevice.addPresetCreatorObserver (100, '', doObject (this, function (name)
    {
        this.creatorProvider.setSelectedItemVerbose(name);
    }));

    // Character display
    this.cursorDevice.addPresetCreatorObserver (this.presetWidth, '', doObject (this, function (name)
    {
        this.creatorProvider.setSelectedItem(name);
    }));

    // - Preset
    this.cursorDevice.addPresetNameObserver (this.presetWidth, '', doObject (this, function (name)
    {
        this.currentPreset = name;
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

CursorDeviceProxy.prototype.getCurrentPreset = function ()
{
    return this.currentPreset;
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

CursorDeviceProxy.prototype.isMacroMapping = function (index)
{
    return this.isMacroMappings[index];
};

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

CursorDeviceProxy.prototype.handleDirectParameterIds = function (ids)
{
//    println ("ID: "+ typeof (ids) +":"+ ids);
//    for (var i = 0; i < ids.length; i++)
  //      println(ids[i]);
};

CursorDeviceProxy.prototype.handleDirectParameterNames = function (id, name)
{
    //println (id +":"+ name);
//    for (var i = 0; i < ids.length; i++)
  //      println(ids[i]);
};

CursorDeviceProxy.prototype.handleDirectParameterValueDisplay = function (id, value)
{
  //  println (id +":"+ value);
//    for (var i = 0; i < ids.length; i++)
  //      println(ids[i]);
};

CursorDeviceProxy.prototype.handleDirectParameterValue = function (id, value)
{
//    println (id +":"+ value);
//    for (var i = 0; i < ids.length; i++)
  //      println(ids[i]);
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
