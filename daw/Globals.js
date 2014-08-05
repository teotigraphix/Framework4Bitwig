// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function scheduleTask (f, params, delay)
{
    host.scheduleTask (f, params, delay);
}

function displayNotification (message)
{
    host.showPopupNotification (message);
}
