// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function GrooveProxy ()
{
    this.groove = host.createGroove ();
    this.values = [];

    this.addValue (GrooveValue.Kind.SHUFFLE_RATE);
    this.addValue (GrooveValue.Kind.SHUFFLE_AMOUNT);
    this.addValue (GrooveValue.Kind.ACCENT_RATE);
    this.addValue (GrooveValue.Kind.ACCENT_AMOUNT);
    this.addValue (GrooveValue.Kind.ACCENT_PHASE);

    this.groove.getEnabled ().addValueObserver (2, doObject (this, GrooveProxy.prototype.handleEnabled));
}

//--------------------------------------
// Bitwig Groove API
//--------------------------------------

GrooveProxy.prototype.getAccentAmount = function ()
{
    return this.groove.getAccentAmount ();
};

GrooveProxy.prototype.getAccentPhase = function ()
{
    return this.groove.getAccentPhase ();
};

GrooveProxy.prototype.getAccentRate = function ()
{
    return this.groove.getAccentRate ();
};

GrooveProxy.prototype.getEnabled = function ()
{
    return this.groove.getEnabled ();
};

GrooveProxy.prototype.getShuffleAmount = function ()
{
    return this.groove.getShuffleAmount ();
};

GrooveProxy.prototype.getShuffleRate = function ()
{
    return this.groove.getShuffleRate ();
};

//--------------------------------------
// Public API
//--------------------------------------

GrooveProxy.prototype.isEnabled = function (kind)
{
    return this.enabled;
};

GrooveProxy.prototype.toggleEnabled = function ()
{
    this.enabled = !this.enabled;
    this.groove.getEnabled ().set (this.enabled ? 1 : 0, 2);
};

GrooveProxy.prototype.getValue = function (kind)
{
    return this.values[kind];
};

// This magic exists for controller modes that use lists for execution
GrooveProxy.prototype.getRangedValue = function (kind)
{
    switch (kind)
    {
        case GrooveValue.Kind.ACCENT_AMOUNT:
            return this.groove.getAccentAmount ();

        case GrooveValue.Kind.ACCENT_PHASE:
            return this.groove.getAccentPhase ();

        case GrooveValue.Kind.ACCENT_RATE:
            return this.groove.getAccentRate ();

        case GrooveValue.Kind.SHUFFLE_AMOUNT:
            return this.groove.getShuffleAmount ();

        case GrooveValue.Kind.SHUFFLE_RATE:
            return this.groove.getShuffleRate ();
    }
};

GrooveProxy.prototype.setIndication = function (enable)
{
    for (var g = 0; g < GrooveValue.Kind.values ().length; g++)
        this.getRangedValue (g).setIndication (enable);
};

//--------------------------------------
// Private API
//--------------------------------------

GrooveProxy.prototype.addValue = function (kind)
{
    this.values[kind] = new GrooveValue (kind);

    var v = this.getRangedValue (kind);

    v.addNameObserver (8, '', doObject (this, function (name)
    {
        this.values[kind].name = name;
    }));

    v.addValueObserver (Config.parameterRange, doObject (this, function (value)
    {
        this.values[kind].value = value;
    }));

    v.addValueDisplayObserver (8, '',  doObject (this, function (value)
    {
        this.values[kind].valueString = value;
    }));
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

GrooveProxy.prototype.handleEnabled = function (enabled)
{
    this.enabled = enabled != 0;
};

//--------------------------------------
// GrooveValue Class
//--------------------------------------

function GrooveValue (kind)
{
    this.kind = kind;
    this.name = null;
    this.value = null;
    this.valueString = '';
}

GrooveValue.Kind =
{
    SHUFFLE_RATE:   0,
    SHUFFLE_AMOUNT: 1,
    ACCENT_RATE:    2,
    ACCENT_AMOUNT:  3,
    ACCENT_PHASE:   4
};

GrooveValue.Kind._enums =
[
    GrooveValue.Kind.SHUFFLE_RATE,
    GrooveValue.Kind.SHUFFLE_AMOUNT,
    GrooveValue.Kind.ACCENT_RATE,
    GrooveValue.Kind.ACCENT_AMOUNT,
    GrooveValue.Kind.ACCENT_PHASE
];

GrooveValue.Kind.values = function ()
{
    return GrooveValue.Kind._enums;
};
