// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractController ()
{
    this.surface = null;
}

AbstractController.prototype.shutdown = function ()
{
    this.surface.shutdown ();
};

AbstractController.prototype.flush = function ()
{
    this.surface.flush ();
};