// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ApplicationProxy ()
{
    this.application = host.createApplication ();
    
    this.perspective = 'ARRANGE';

    // TODO implement 1.1 observers
    // addDisplayProfileObserver (callable:function, maxChars:int):void
    // addPanelLayoutObserver (callable:function, maxChars:int):void

    this.application.addSelectedModeObserver (doObject (this, ApplicationProxy.prototype.handlePerspective), 10, "");
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

//------------------------------------------------------------------------------
// 1.1
//------------------------------------------------------------------------------

//--------------------------------------
// Actions
//--------------------------------------

/**
 * Returns the action for the given action identifier.
 * @see Application.getAction()
 * @param id the action identifier string, must not be `null`
 * @returns {Action}
 */
ApplicationProxy.prototype.getAction  = function (id)
{
    return this.application.getAction (id);
};

/**
 * Returns a list of action categories that is used by Bitwig Studio to group actions
 * into categories.
 * @see Application.getActionCategories()
 * @returns {ActionCategory[]}
 */
ApplicationProxy.prototype.getActionCategories  = function ()
{
    return this.application.getActionCategories ();
};

/**
 * Returns the action category associated with the given identifier.
 * @see Application.getActionCategory()
 * @param id the category identifier string, must not be `null`
 * @returns {ActionCategory}
 */
ApplicationProxy.prototype.getActionCategory   = function (id)
{
    return this.application.getActionCategory  (id);
};

/**
 * Returns a list of actions that the application supports.
 * @see Application.getActions()
 * @returns {Action[]}
 */
ApplicationProxy.prototype.getActions  = function ()
{
    return this.application.getActions ();
};

//--------------------------------------
// Creation
//--------------------------------------

/**
 * Creates a new audio track at the given position.
 * @param position {int}
 * @param selection {TrackSelection}
 */
ApplicationProxy.prototype.createAudioTrack = function (position, selection)
{
    this.application.createAudioTrack (position, selection);
};

/**
 * Creates a new effect track at the given position.
 * @param position {int}
 * @param selection {TrackSelection}
 */
ApplicationProxy.prototype.createEffectTrack = function (position, selection)
{
    this.application.createEffectTrack (position, selection);
};

/**
 * Creates a new instrument track at the given position.
 * @param position {int}
 * @param selection {TrackSelection}
 */
ApplicationProxy.prototype.createInstrumentTrack = function (position, selection)
{
    this.application.createInstrumentTrack  (position, selection);
};

//--------------------------------------
// Panels
//--------------------------------------

/**
 * Switches to the next panel layout of the active display profile in Bitwig Studio.
 */
ApplicationProxy.prototype.nextPanelLayout = function ()
{
    this.application.nextPanelLayout ();
};

/**
 * Switches to the previous panel layout of the active display profile in Bitwig Studio.
 */
ApplicationProxy.prototype.previousPanelLayout = function ()
{
    this.application.previousPanelLayout ();
};

/**
 * Switches the Bitwig Studio user interface to the panel layout with the given name.
 *
 * @param panelLayout {string} the name of the new panel layout
 */
ApplicationProxy.prototype.setPanelLayout = function (panelLayout)
{
    this.application.setPanelLayout (panelLayout);
};

/**
 * Toggles the visibility of the inspector panel.
 */
ApplicationProxy.prototype.toggleInspector = function ()
{
    this.application.toggleInspector ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

ApplicationProxy.prototype.handlePerspective = function (perspective)
{
    this.perspective = perspective;
};
