// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2017
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TimerTask (interval)
{
    this.interval = interval;
    this.args = [];
    this.isRunning = false;
}

TimerTask.prototype.start = function (scope, callback, args)
{
    this.scope = scope;
    this.callback = callback;
    this.args = args;

    this.isRunning = true;
    this._timer ();
};

TimerTask.prototype.stop = function ()
{
    this.args = [];
    this.isRunning = false;
};

TimerTask.prototype._timer = function ()
{
    if (!this.isRunning)
        return;

    this.callback.apply (this.scope, this.args);

    scheduleTask (doObject (this, this._timer), this.args, this.interval);
};