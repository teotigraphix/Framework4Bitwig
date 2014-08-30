// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ApplicationProxy ()
{
    this.application = host.createApplication ();
}

ApplicationProxy.prototype.setPerspective = function (perspective)
{
    this.application.setPerspective (perspective);
};

ApplicationProxy.prototype.toggleNoteEditor = function ()
{
    this.application.toggleNoteEditor ();
};

ApplicationProxy.prototype.toggleAutomationEditor = function ()
{
    this.application.toggleAutomationEditor ();
};

ApplicationProxy.prototype.toggleDevices = function ()
{
    this.application.toggleDevices ();
};

ApplicationProxy.prototype.toggleMixer = function ()
{
    this.application.toggleMixer ();
};

ApplicationProxy.prototype.toggleFullScreen = function ()
{
    this.application.toggleFullScreen ();
};

ApplicationProxy.prototype.toggleBrowserVisibility = function()
{
    this.application.toggleBrowserVisibility ();
};

ApplicationProxy.prototype.duplicate = function ()
{
    this.application.duplicate ();
};

ApplicationProxy.prototype.doubleClip = function ()
{
    // See Push manual, if we duplicate the Push functionality 
    // this function must be somewhere else, e.g. in TrackBankProxy
    displayNotification ("Duplicate: Function not supported (yet).");
};

ApplicationProxy.prototype.deleteSelection = function ()
{
    // Weird workaround as 'delete' is a reserved word in JS
    var deleteFunction = this.application['delete'];
    deleteFunction.call (this.application);
};

ApplicationProxy.prototype.redo = function ()
{
    this.application.redo ();
};

ApplicationProxy.prototype.undo = function ()
{
    this.application.undo ();
};

ApplicationProxy.prototype.quantize = function ()
{
    displayNotification ("Quantize: Function not supported (yet).");
};

ApplicationProxy.prototype.addEffect = function ()
{
    displayNotification ("Add Effect: Function not supported (yet).");
};

ApplicationProxy.prototype.addTrack = function ()
{
    displayNotification ("Add Track: Function not supported (yet).");
};

ApplicationProxy.prototype.arrowKeyLeft = function ()
{
    this.application.arrowKeyLeft ();
};

ApplicationProxy.prototype.arrowKeyUp = function ()
{
    this.application.arrowKeyUp ();
};

ApplicationProxy.prototype.arrowKeyRight = function ()
{
    this.application.arrowKeyRight ();
};

ApplicationProxy.prototype.arrowKeyDown = function ()
{
    this.application.arrowKeyDown ();
};
