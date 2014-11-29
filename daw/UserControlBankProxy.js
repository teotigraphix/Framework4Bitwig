// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function UserControlBankProxy (ccStart)
{
    this.textLength = GlobalConfig.CURSOR_DEVICE_TEXT_LENGTH;
    this.numParams = 8;
    
    this.userControlBank = host.createUserControls (8);
    this.userParams = this.createFXParams (this.numParams);
    
    for (var i = 0; i < 8; i++)
    {
        var c = this.userControlBank.getControl (i);
        c.setLabel ("CC" + (i + ccStart));
        c.addNameObserver (this.textLength, '', doObjectIndex (this, i, UserControlBankProxy.prototype.handleParameterName));
        c.addValueObserver (Config.maxParameterValue, doObjectIndex (this, i, UserControlBankProxy.prototype.handleValue));
        c.addValueDisplayObserver (this.textLength, '',  doObjectIndex (this, i, UserControlBankProxy.prototype.handleValueDisplay));
    }
}

/**
 * @param {int} index
 * @returns {AutomatableRangedValue}
 */
UserControlBankProxy.prototype.getControl = function (index)
{
    return this.userControlBank.getControl (index);
};

UserControlBankProxy.prototype.getUserParam = function (index)
{
    return this.userParams[index];
};

//--------------------------------------
// Callback Handlers
//--------------------------------------

UserControlBankProxy.prototype.handleParameterName = function (index, name)
{
    this.userParams[index].name = name;
};

UserControlBankProxy.prototype.handleValue = function (index, value)
{
    this.userParams[index].value = value;
};

UserControlBankProxy.prototype.handleValueDisplay = function (index, value)
{
    this.userParams[index].valueStr = value;
};

UserControlBankProxy.prototype.createFXParams = function (count)
{
    var fxparams = [];
    for (var i = 0; i < count; i++)
    {
        fxparams.push (
        {
            index: i,
            name: '',
            valueStr: '',
            value: 0
        });
    }
    return fxparams;
};
