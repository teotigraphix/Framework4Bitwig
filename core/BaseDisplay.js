
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