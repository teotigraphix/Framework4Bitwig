// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ApplicationProxy ()
{
    this.application = host.createApplication ();
    
    this.panelLayout = 'ARRANGE';

    this.application.addPanelLayoutObserver (doObject (this, ApplicationProxy.prototype.handlePanelLayout), 10);
}

/**
 * Switches the Bitwig Studio user interface to the panel layout with the given name.
 *
 * @param panelLayout {string} the name of the new panel layout
 */
ApplicationProxy.prototype.setPanelLayout = function (panelLayout)
{
    this.application.setPanelLayout (panelLayout);
};

ApplicationProxy.prototype.getPanelLayout = function ()
{
    return this.panelLayout;
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

/**
 * Toggles the visibility of the inspector panel.
 */
ApplicationProxy.prototype.toggleInspector = function ()
{
    this.application.toggleInspector ();
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
    this.application.remove ();
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
    // TODO Clip must already be visible in editor and the editor must be focused
    // this.application.getAction ("focus_or_toggle_detail_editor").invoke ();
    this.application.getAction ("Select All").invoke ();
    this.application.getAction ("Quantize").invoke ();
};

ApplicationProxy.prototype.addEffect = function ()
{
    displayNotification ("Add Effect: Function not supported (yet).");
};

/**
 * Creates a new audio track.
 */
ApplicationProxy.prototype.addAudioTrack = function ()
{
    this.application.createAudioTrack (-1);
};

/**
 * Creates a new effect track.
 */
ApplicationProxy.prototype.addEffectTrack = function ()
{
    this.application.createEffectTrack (-1);
};

/**
 * Creates a new instrument track.
 */
ApplicationProxy.prototype.addInstrumentTrack = function ()
{
    this.application.createInstrumentTrack (-1);
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
// Callback Handlers
//--------------------------------------

ApplicationProxy.prototype.handlePanelLayout = function (panelLayout)
{
    this.panelLayout = panelLayout;
};
