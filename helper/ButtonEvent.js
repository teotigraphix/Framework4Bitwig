// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ButtonEvent.DOWN = 0;
ButtonEvent.UP   = 1;
ButtonEvent.LONG = 2;

function ButtonEvent (aState)
{
    this.state = aState;
}

ButtonEvent.prototype.getState = function ()
{
    return this.state;
};

ButtonEvent.prototype.isDown = function ()
{
    return this.state == ButtonEvent.DOWN;
};

ButtonEvent.prototype.isUp = function ()
{
    return this.state == ButtonEvent.UP;
};

ButtonEvent.prototype.isLong = function ()
{
    return this.state == ButtonEvent.LONG;
};
