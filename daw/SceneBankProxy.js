// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SceneBankProxy (numScenes)
{
    this.numScenes = numScenes;

    this.sceneBank = host.createSceneBank (numScenes);

    this.canScrollUp = false;
    this.canScrollDown = false;
    this.sceneCount = -1;
    this.scrollPosition = -1;

    this.sceneBank.addScrollPositionObserver (doObject (this, SceneBankProxy.prototype.handleScrollPosition), -1);
    this.sceneBank.addCanScrollUpObserver (doObject (this, SceneBankProxy.prototype.handleCanScrollUp));
    this.sceneBank.addCanScrollDownObserver (doObject (this, SceneBankProxy.prototype.handleCanScrollDown));
    this.sceneBank.addSceneCountObserver (doObject (this, SceneBankProxy.prototype.handleSceneCount));

    this.scenes = this.createScenes (this.numScenes);

    for (var i = 0; i < numScenes; i++)
    {
        var scene = this.sceneBank.getScene (i);
        scene.getName().addValueObserver (doObjectIndex (this, i, SceneBankProxy.prototype.handleSceneName));
        scene.exists ().addValueObserver (doObjectIndex (this, i, SceneBankProxy.prototype.handleSceneExists));
        scene.addIsSelectedInEditorObserver (doObjectIndex (this, i, SceneBankProxy.prototype.handleSceneSelected));
        scene.addPositionObserver (doObjectIndex (this, i, SceneBankProxy.prototype.handleScenePosition));
    }
}

//--------------------------------------
// Public API
//--------------------------------------

/**
 * Returns the underlying total scene count (not the number of scenes available in the bank window).
 *
 * @returns {number}
 */
SceneBankProxy.prototype.getSceneCount = function ()
{
    return this.sceneCount;
};

/**
 * Returns the current scene scroll position.
 *
 * @returns {number}
 */
SceneBankProxy.prototype.getScrollPosition = function ()
{
    return this.scrollPosition;
};

/**
 * Returns the scene object at the given index within the bank.
 * Properties - {exists, index, name, position, selected}
 *
 * @param index the scene index within scene bank.
 * @returns {*}
 */
SceneBankProxy.prototype.getScene = function (index)
{
    return this.scenes[index];
};

/**
 * Scrolls the scenes one page up.
 */
SceneBankProxy.prototype.scrollPageUp = function ()
{
    this.sceneBank.scrollPageUp ();
};

/**
 * Scrolls the scenes one page down.
 */
SceneBankProxy.prototype.scrollPageDown = function ()
{
    this.sceneBank.scrollPageDown ();
};

/**
 * Scrolls the scenes one scene up.
 */
SceneBankProxy.prototype.scrollUp = function ()
{
    this.sceneBank.scrollUp ();
};

/**
 * Scrolls the scenes one scene down.
 */
SceneBankProxy.prototype.scrollDown = function ()
{
    this.sceneBank.scrollDown ();
};

/**
 * Makes the scene with the given position visible in the track bank.
 *
 * @param position the position of the scene within the underlying full list of scenes
 */
SceneBankProxy.prototype.scrollTo = function (position)
{
    this.sceneBank.scrollTo (position);
};

/**
 * Launches the scene with the given bank index.
 *
 * @param indexInWindow he scene index within the bank, not the position of the scene
 * within the underlying full list of scenes.
 */
//SceneBankProxy.prototype.launchScene = function (indexInWindow)
//{
//    this.sceneBank.launchScene (indexInWindow)
//};

// Scene

/**
 * Returns whether the scene exists within the bank.
 *
 * @param index scene bank index.
 * @returns {boolean}
 */
SceneBankProxy.prototype.sceneExists = function (index)
{
    return this.scenes[index].exists;
};

/**
 * Returns the scene name, null if the scene doesn't exist.
 *
 * @param index scene bank index.
 * @returns {string}
 */
SceneBankProxy.prototype.getSceneName = function (index)
{
    //if (!this.scenes[index].exists)
    //    return null;
    return this.scenes[index].name;
};

/**
 * Launches the scene.
 *
 * @param index scene bank index.
 */
SceneBankProxy.prototype.launchScene = function (index)
{
    //if (this.scenes[index].exists)
        this.sceneBank.getScene (index).launch ();
};

/**
 * Selects the scene in Bitwig Studio.
 *
 * @param index scene bank index.
 */
SceneBankProxy.prototype.selectScene = function (index)
{
    //if (this.scenes[index].exists)
        this.sceneBank.getScene (index).selectInEditor ();
};

/**
 * Makes the scene visible in the Bitwig Studio user interface.
 *
 * @param index scene bank index.
 */
SceneBankProxy.prototype.showScene = function (index)
{
    //if (this.scenes[index].exists)
        this.sceneBank.getScene (index).showInEditor ();
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

SceneBankProxy.prototype.handleCanScrollUp = function (canScroll)
{
    this.canScrollUp = canScroll;
};

SceneBankProxy.prototype.handleCanScrollDown = function (canScroll)
{
    this.canScrollDown = canScroll;
};

SceneBankProxy.prototype.handleSceneCount = function (canScroll)
{
    this.sceneCount = canScroll;
};

SceneBankProxy.prototype.handleScrollPosition = function (position)
{
    this.scrollPosition = position;
};

// Scene

SceneBankProxy.prototype.handleSceneName = function (index, name)
{
    this.scenes[index].name = name;
    //println("name " + name);
};

SceneBankProxy.prototype.handleSceneExists = function (index, exists)
{
    this.scenes[index].exists = exists;
    // TODO println("exists " + exists);
};

SceneBankProxy.prototype.handleSceneSelected = function (index, selected)
{
    this.scenes[index].selected = selected;
    //println("selected " + selected);
};

SceneBankProxy.prototype.handleScenePosition = function (index, position)
{
    this.scenes[index].position = position;
    //println("position " + position);
};

//--------------------------------------
// Private API
//--------------------------------------

SceneBankProxy.prototype.createScenes = function (count)
{
    var scenes = [];
    for (var i = 0; i < count; i++)
    {
        var s =
        {
            index: i,
            position: -1,
            name: "",
            exists: false,
            selected: false
        };
        scenes.push (s);
    }
    return scenes;
};
