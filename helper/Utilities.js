// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function toggleValue (value)
{
    return !value;
}

function changeValue (control, value, fractionValue, maxParameterValue)
{
    var isInc = control <= 61;
    var speed = (isInc ? control : 127 - control) * fractionValue;
    return isInc ? Math.min (value + speed, maxParameterValue) : Math.max (value - speed, 0);
}

function doObject (object, f)
{
    return function ()
    {
        f.apply (object, arguments);
    };
}

function doIndex (index, f)
{
    return function ()
    {
        var args = [index];
        for (var i = 0; i < arguments.length; i++)
            args[i + 1] = arguments[i];
        f.apply (null, args);
    };
}

function doObjectIndex (object, index, f)
{
    return function ()
    {
        var args = [index];
        for (var i = 0; i < arguments.length; i++)
            args[i + 1] = arguments[i];
        f.apply (object, args);
    };
}

function doDoubleIndex (index1, index2, f)
{
    return function ()
    {
        var args = [index1, index2];
        for (var i = 0; i < arguments.length; i++)
            args[i + 2] = arguments[i];
        f.apply (null, args);
    };
}

function doObjectDoubleIndex (object, index1, index2, f)
{
    return function ()
    {
        var args = [index1, index2];
        for (var i = 0; i < arguments.length; i++)
            args[i + 2] = arguments[i];
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

var REMOVABLE_CHARS = [' ', 'e', 'a', 'u', 'i'];
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
