// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PreferencesProxy ()
{
    this.preferences = host.getPreferences ();
    this.settings = host.getNotificationSettings ();
}