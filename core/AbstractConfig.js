// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Option IDs
Config.SCALES_SCALE          = 0;
Config.SCALES_BASE           = 1;
Config.SCALES_IN_KEY         = 2;
Config.SCALES_LAYOUT         = 3;
Config.ENABLE_VU_METERS      = 4;
Config.BEHAVIOUR_ON_STOP     = 5;
Config.DISPLAY_CROSSFADER    = 6;
Config.FLIP_SESSION          = 7;
Config.SELECT_CLIP_ON_LAUNCH = 8;
Config.CONVERT_AFTERTOUCH    = 9;
Config.ACTIVATE_FIXED_ACCENT = 10;
Config.FIXED_ACCENT_VALUE    = 11;
Config.QUANTIZE_AMOUNT       = 12;

// Parameters for certain options
Config.BEHAVIOUR_ON_STOP_MOVE_PLAY_CURSOR = 0;
Config.BEHAVIOUR_ON_STOP_RETURN_TO_ZERO   = 1;
Config.BEHAVIOUR_ON_STOP_PAUSE            = 2;

Config.AFTERTOUCH_CONVERSION_VALUES = [ "Off", "Poly Aftertouch", "Channel Aftertouch" ];
for (var i = 0; i < 128; i++)
    Config.AFTERTOUCH_CONVERSION_VALUES.push ("CC " + i);


// Option values
Config.scale              = 'Major';
Config.scaleBase          = 'C';
Config.scaleInKey         = true;
Config.scaleLayout        = '4th ^';
Config.enableVUMeters     = false;
Config.behaviourOnStop    = Config.BEHAVIOUR_ON_STOP_MOVE_PLAY_CURSOR;
Config.displayCrossfader  = true;
Config.flipSession        = false;
Config.selectClipOnLaunch = true;
Config.convertAftertouch  = 0;
Config.accentActive       = false;                       // Accent button active
Config.fixedAccentValue   = 127;                         // Fixed velocity value for accent
Config.quantizeAmount     = 1;


function Config () {}

//------------------------------
// Option initialisation
//------------------------------

Config.activateScaleSetting = function (prefs)
{
    var scaleNames = Scales.getNames ();
    Config.scaleSetting = prefs.getEnumSetting ("Scale", "Scales", scaleNames, scaleNames[0]);
    Config.scaleSetting.addValueObserver (function (value)
    {
        Config.scale = value;
        Config.notifyListeners (Config.SCALES_SCALE);
    });
};

Config.activateScaleBaseSetting = function (prefs)
{
    Config.scaleBaseSetting = prefs.getEnumSetting ("Base", "Scales", Scales.BASES, Scales.BASES[0]);
    Config.scaleBaseSetting.addValueObserver (function (value)
    {
        Config.scaleBase = value;
        Config.notifyListeners (Config.SCALES_BASE);
    });
};

Config.activateScaleInScaleSetting = function (prefs)
{
    Config.scaleInScaleSetting = prefs.getEnumSetting ("In Key", "Scales", [ "In Key", "Chromatic" ], "In Key");
    Config.scaleInScaleSetting.addValueObserver (function (value)
    {
        Config.scaleInKey = value == "In Key";
        Config.notifyListeners (Config.SCALES_IN_KEY);
    });
};

Config.activateScaleLayoutSetting = function (prefs)
{
    Config.scaleLayoutSetting = prefs.getEnumSetting ("Layout", "Scales", Scales.LAYOUT_NAMES, Scales.LAYOUT_NAMES[0]);
    Config.scaleLayoutSetting.addValueObserver (function (value)
    {
        Config.scaleLayout = value;
        Config.notifyListeners (Config.SCALES_LAYOUT);
    });
};

Config.activateEnableVUMetersSetting = function (prefs)
{
    Config.enableVUMetersSetting = prefs.getEnumSetting ("VU Meters", "Workflow", [ "Off", "On" ], "Off");
    Config.enableVUMetersSetting.addValueObserver (function (value)
    {
        Config.enableVUMeters = value == "On";
        Config.notifyListeners (Config.ENABLE_VU_METERS);
    });
};

Config.activateBehaviourOnStopSetting = function (prefs)
{
    Config.behaviourOnStopSetting = prefs.getEnumSetting ("Behaviour on Stop", "Workflow", [ "Move play cursor", "Return to Zero", "Pause" ], "Move play cursor");
    Config.behaviourOnStopSetting.addValueObserver (function (value)
    {
        switch (value)
        {
            case "Move play cursor":
                Config.behaviourOnStop = Config.BEHAVIOUR_ON_STOP_MOVE_PLAY_CURSOR;
                break;
                
            case "Return to Zero":
                Config.behaviourOnStop = Config.BEHAVIOUR_ON_STOP_RETURN_TO_ZERO;
                break;
                
            case "Pause":
                Config.behaviourOnStop = Config.BEHAVIOUR_ON_STOP_PAUSE;
                break;
        }
        Config.notifyListeners (Config.BEHAVIOUR_ON_STOP);
    });
};

Config.activateDisplayCrossfaderSetting = function (prefs)
{
    Config.displayCrossfaderSetting = prefs.getEnumSetting ("Display Crossfader on Track", "Workflow", [ "Off", "On" ], "On");
    Config.displayCrossfaderSetting.addValueObserver (function (value)
    {
        Config.displayCrossfader = value == "On";
        Config.notifyListeners (Config.DISPLAY_CROSSFADER);
    });
};

Config.activateFlipSessionSetting = function (prefs)
{
    Config.flipSessionSetting = prefs.getEnumSetting ("Flip Session", "Workflow", [ "Off", "On" ], "Off");
    Config.flipSessionSetting.addValueObserver (function (value)
    {
        Config.flipSession = value == "On";
        Config.notifyListeners (Config.FLIP_SESSION);
    });
};

Config.activateSelectClipOnLaunchSetting = function (prefs)
{
    Config.selectClipOnLaunchSetting = prefs.getEnumSetting ("Select clip on launch", "Workflow", [ "Off", "On" ], "On");
    Config.selectClipOnLaunchSetting.addValueObserver (function (value)
    {
        Config.selectClipOnLaunch = value == "On";
        Config.notifyListeners (Config.SELECT_CLIP_ON_LAUNCH);
    });
};

Config.activateConvertAftertouchSetting = function (prefs)
{
    Config.convertAftertouchSetting = prefs.getEnumSetting ("Convert Poly Aftertouch to", "Pads", Config.AFTERTOUCH_CONVERSION_VALUES, Config.AFTERTOUCH_CONVERSION_VALUES[1]);
    Config.convertAftertouchSetting.addValueObserver (function (value)
    {
        for (var i = 0; i < Config.AFTERTOUCH_CONVERSION_VALUES.length; i++)
        {
            if (Config.AFTERTOUCH_CONVERSION_VALUES[i] == value)
            {
                Config.convertAftertouch = i - 3;
                break;
            }
        }
        Config.notifyListeners (Config.CONVERT_AFTERTOUCH);
    });
};

Config.activateAccentActiveSetting = function (prefs)
{
    Config.accentActiveSetting = prefs.getEnumSetting ("Activate Fixed Accent", "Play and Sequence", [ "Off", "On" ], "Off");
    Config.accentActiveSetting.addValueObserver (function (value)
    {
        Config.accentActive = value == "On";
        Config.notifyListeners (Config.ACTIVATE_FIXED_ACCENT);
    });
};

Config.activateAccentValueSetting = function (prefs)
{
    Config.accentValueSetting = prefs.getNumberSetting ("Fixed Accent Value", "Play and Sequence", 1, 127, 1, "", 127);
    Config.accentValueSetting.addRawValueObserver (function (value)
    {
        Config.fixedAccentValue = value;
        Config.notifyListeners (Config.FIXED_ACCENT_VALUE);
    });
};

Config.activateQuantizeAmountSetting = function (prefs)
{
    Config.quantizeAmountSetting = prefs.getNumberSetting ('Quantize Amount', 'Play and Sequence', 1, 100, 1, '%', 100);
    Config.quantizeAmountSetting.addRawValueObserver (function (value)
    {
        Config.quantizeAmount = Math.floor (value);
        Config.notifyListeners (Config.QUANTIZE_AMOUNT);
    });
};

//------------------------------
// Option setters
//------------------------------

Config.setScale = function (scale)
{
    Config.scaleSetting.set (scale);
};

Config.setScaleBase = function (scaleBase)
{
    Config.scaleBaseSetting.set (scaleBase);
};

Config.setScaleInScale = function (inScale)
{
    Config.scaleInScaleSetting.set (inScale ? "In Key" : "Chromatic");
};

Config.setScaleLayout = function (scaleLayout)
{
    Config.scaleLayoutSetting.set (scaleLayout);
};

Config.setVUMetersEnabled = function (enabled)
{
    Config.enableVUMetersSetting.set (enabled ? "On" : "Off");
};

Config.setDisplayCrossfader = function (enabled)
{
    Config.displayCrossfaderSetting.set (enabled ? "On" : "Off");
};

Config.setFlipSession = function (enabled)
{
    Config.flipSessionSetting.set (enabled ? "On" : "Off");
};

Config.setAccentEnabled = function (enabled)
{
    Config.accentActiveSetting.set (enabled ? "On" : "Off");
};

Config.setAccentValue = function (value)
{
    Config.accentValueSetting.setRaw (value);
};

Config.changeQuantizeAmount = function (control)
{
    Config.quantizeAmountSetting.setRaw (changeIntValue (control, Config.quantizeAmount, 1, 101));
};

Config.setQuantizeAmount = function (value)
{
    Config.quantizeAmountSetting.setRaw (value);
};

//------------------------------
// Property listeners
//------------------------------

Config.listeners = [];

Config.initListeners = function (last)
{
    for (var i = 0; i <= last; i++)
        Config.listeners[i] = [];
};

Config.cleanupListeners = function ()
{
    if (Config.listeners)
    {
        for (var i = 0; i < Config.listeners.length; i++)
            Config.listeners[i] = [];
    }
};

Config.addPropertyListener = function (property, listener)
{
    Config.listeners[property].push (listener);
};

Config.notifyListeners = function (property)
{
    var ls = Config.listeners[property];
    for (var i = 0; i < ls.length; i++)
        ls[i].call (null);
};
