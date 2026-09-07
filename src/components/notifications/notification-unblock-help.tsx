import type React from "react";

/**
 * Once notifications have been refused the browser will not prompt again, so asking a
 * second time silently resolves to "denied". The only way back is the site settings
 * behind the address bar, so spell that out rather than leaving a button that does nothing.
 */
export const NotificationUnblockHelp: React.FC = () => (
  <ol className="list-decimal space-y-1 pl-4 text-sm">
    <li>
      Click the icon at the left of the address bar (a padlock, a set of sliders,
      or a "Not secure" label).
    </li>
    <li>
      Find <span className="font-medium">Notifications</span> in the site
      settings that appear.
    </li>
    <li>
      Set it to <span className="font-medium">Allow</span>, or reset the
      permission so Xtreamium can ask again.
    </li>
    <li>Reload the page.</li>
  </ol>
);

export default NotificationUnblockHelp;
