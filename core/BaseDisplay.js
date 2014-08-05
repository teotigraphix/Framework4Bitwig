// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseDisplay ()
{
    this.output = null;
    this.currentMessage = [];
    this.message = [];

    this.cells = [];
}

BaseDisplay.prototype.init = function (output)
{
    this.output = output;
};