// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function toggleValue (value)
{
    return !value;
}

function calcKnobSpeed (control, fractionValue)
{
    return (control <= 61 ? control :  control - 128) * fractionValue;
}

function changeIntValue (control, value, fractionValue, maxParameterValue, minParameterValue)
{
    if (typeof (minParameterValue) == 'undefined')
        minParameterValue = 0;
    var speed = calcKnobSpeed (control, fractionValue);
    return Math.max (Math.min (value + speed, maxParameterValue), minParameterValue);
}

function changeValue (control, value, fractionValue, maxParameterValue, minParameterValue)
{
    return changeIntValue (control, value, fractionValue, maxParameterValue, minParameterValue);
}

function doObject (object, f)
{
    return function ()
    {
        f.apply (object, arguments);
    };
}

function doObjectIndex (object, index, f)
{
    return function ()
    {
        var args = new Array (); 
        args.push (index);
        for (var i = 0; i < arguments.length; i++)
            args.push (arguments[i]);
        f.apply (object, args);
    };
}

function doObjectDoubleIndex (object, index1, index2, f)
{
    return function ()
    {
        var args = new Array (); 
        args.push (index1);
        args.push (index2);
        for (var i = 0; i < arguments.length; i++)
            args.push (arguments[i]);
        f.apply (object, args);
    };
}

function toHexStr (data)
{
    var sysex = "";
    for (i in data)
    {
        var v = data[i].toString (16).toUpperCase ();
        if (v.length < 2)
            v = '0' + v;
        sysex += v + ' ';
    }
    return sysex;
}

var REMOVABLE_CHARS = [' ', 'e', 'a', 'u', 'i', 'o'];
function optimizeName (name, length)
{
    if (!name)
        return '';
    
    for (var i = 0; i < REMOVABLE_CHARS.length; i++)
    {
        if (name.length <= length)
            return name;
        var pos = -1;
        while ((pos = name.indexOf (REMOVABLE_CHARS[i])) != -1)
        {
            name = name.substring (0, pos) + name.substring (pos + 1, name.length);
            if (name.length <= length)
                return name;
        }
    }
    return name;
}
