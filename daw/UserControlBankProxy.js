// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function UserControlBankProxy (ccStart)
{
    this.userControlBank = host.createUserControls (8);

    for (var i = 0; i < 8; i++)
        this.userControlBank.getControl (i).setLabel ("CC" + (i + ccStart));
}

/**
 * @param {int} index
 * @returns {AutomatableRangedValue}
 */
UserControlBankProxy.prototype.getControl = function (index)
{
    return this.userControlBank.getControl (index);
};
