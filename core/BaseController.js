
function BaseController()
{
    this.surface = null;
}

BaseController.prototype.init = function ()
{
};

BaseController.prototype.attach = function (surface, config)
{
    this.surface = surface;
    this.surface.configure (config);
};

BaseController.prototype.shutdown = function ()
{
    this.surface.shutdown ();
};

BaseController.prototype.flush = function ()
{
    this.surface.flush ();
};