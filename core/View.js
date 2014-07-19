// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function View ()
{
    this.surface = null;
    this.model = null;
}

View.prototype.attachTo = function (surface)
{
    println("View.attatchTo()");
    this.surface = surface;
    this.model = this.surface.model;
};

View.prototype.usesButton = function (buttonID)
{
    return true;
};

View.prototype.onActivate = function () {};

View.prototype.updateDevice = function () {};
View.prototype.drawGrid = function () {};
View.prototype.onGridNote = function (note, velocity) {};
