// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractDisplay.FORMAT_RAW   = 0;
AbstractDisplay.FORMAT_VALUE = 1;
AbstractDisplay.FORMAT_PAN   = 2;

AbstractDisplay.NOTIFICATION_TIME = 1000; // ms


function AbstractDisplay (output, noOfLines, noOfBlocks, noOfCells, noOfCharacters)
{
    if (typeof (output) == 'undefined')
        return;

    this.output = output;
    
    this.noOfLines      = noOfLines;
    this.noOfBlocks     = noOfBlocks;
    this.noOfCells      = noOfCells;
    this.noOfCharacters = noOfCharacters;
    
    this.emptyLine = "";
    for (var i = 0; i < this.noOfCharacters; i++)
        this.emptyLine += " ";
    this.notificationMessage = this.emptyLine;
    this.isNotificationActive = false;

    this.currentMessage = initArray (null, this.noOfLines);
    this.message = initArray (null, this.noOfLines);
    this.cells = initArray (null, this.noOfLines * this.noOfCells);
}

//////////////////////////////////////////////////
// Abstract methods - need to be implemented

AbstractDisplay.prototype.clearCell = function (row, cell) {};

AbstractDisplay.prototype.setBlock = function (row, block, value) {};
AbstractDisplay.prototype.setCell = function (row, cell, value, format) {};

AbstractDisplay.prototype.writeLine = function (row, text) {};


//////////////////////////////////////////////////
// Public methods

// Displays a notification message on the display for 3 seconds
AbstractDisplay.prototype.showNotification = function (message)
{
    var padding = this.emptyLine.substr (0, Math.round ((this.noOfCharacters - message.length) / 2));
    this.notificationMessage = (padding + message + padding).substr (0, this.noOfCharacters);
    this.isNotificationActive = true;
    this.flush ();
    scheduleTask (function (object)
    {
        object.isNotificationActive = false;
        object.forceFlush ();
    }, [this], AbstractDisplay.NOTIFICATION_TIME);
};

AbstractDisplay.prototype.clear = function ()
{
    for (var i = 0; i < this.noOfLines; i++)
        this.clearRow (i);
    return this;
};

AbstractDisplay.prototype.clearRow = function (row)
{
    for (var i = 0; i < 4; i++)
        this.clearBlock (row, i);
    return this;
};

AbstractDisplay.prototype.clearBlock = function (row, block)
{
    var cell = 2 * block;
    this.clearCell (row, cell);
    this.clearCell (row, cell + 1);
    return this;
};

AbstractDisplay.prototype.clearColumn = function (column)
{
    for (var i = 0; i < this.noOfLines; i++)
        this.clearBlock (i, column);
    return this;
};

AbstractDisplay.prototype.setRow = function (row, str)
{
    this.message[row] = str;
    return this;
};

AbstractDisplay.prototype.done = function (row)
{
    var index = row * this.noOfCells;
    this.message[row] = '';
    for (var i = 0; i < this.noOfCells; i++)
        this.message[row] += this.cells[index + i];
    return this;
};

AbstractDisplay.prototype.allDone = function ()
{
    for (var row = 0; row < this.noOfLines; row++)
        this.done (row);
    return this;
};

AbstractDisplay.prototype.forceFlush = function (row)
{
    for (var row = 0; row < this.noOfLines; row++)
        this.currentMessage[row] = '';
};

AbstractDisplay.prototype.flush = function (row)
{
    if (this.isNotificationActive)
    {
        this.writeLine (0, this.notificationMessage);
        for (var row = 1; row < this.noOfLines; row++)
            this.writeLine (row, this.emptyLine);
        return;
    }

    for (var row = 0; row < this.noOfLines; row++)
    {
        // Has anything changed?
        if (this.currentMessage[row] == this.message[row])
            continue;
        this.currentMessage[row] = this.message[row];
        if (this.currentMessage[row] != null)
            this.writeLine (row, this.currentMessage[row]);
    }
};

AbstractDisplay.prototype.reverseStr = function (str)
{
    var r = '';
    for (var i = 0; i < str.length; i++)
        r = str[i] + r;
    return r;
};
