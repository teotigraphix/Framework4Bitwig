
function BaseView ()
{
    this.surface = null;
}

BaseView.prototype.attachTo = function (surface)
{
    println("BaseView.attachTo() " + surface);
    this.surface = surface;
    this.model = this.surface.model;
};

BaseView.prototype.usesButton = function (buttonID)
{
    return true;
};

BaseView.prototype.onActivate = function () {};

BaseView.prototype.updateDevice = function () {};
BaseView.prototype.drawGrid = function () {};
BaseView.prototype.onGrid = function (note, velocity) {};

BaseView.prototype.onValueKnob = function (index, value)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnob (index, value);
};

BaseView.prototype.onTopRow = function (event, index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onTopRow (event, index);
};

/*

 BaseView.prototype.updateDevice = function ()
 {
 var m = this.push.getActiveMode ();
 if (m != null)
 {
 m.updateDisplay ();
 m.updateFirstRow ();
 m.updateSecondRow ();
 }
 this.updateButtons ();
 this.updateArrows ();
 };

 */