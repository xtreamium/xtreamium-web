/**
 * User preferences for desktop (Web Notification API) alerts. These live in the browser
 * only - the proxy has no idea which machine is watching, so there is nothing to sync.
 */
export interface NotificationSettings {
  /** Master switch. Nothing is shown while this is off, whatever the individual toggles say. */
  enabled: boolean;
  /** Fire when the proxy moves a recording into "recording". */
  notifyOnStart: boolean;
  /** Fire when a recording lands on "complete" or "partial". */
  notifyOnFinish: boolean;
  /** Fire when a recording ends up "failed". */
  notifyOnFailure: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  notifyOnStart: true,
  notifyOnFinish: true,
  notifyOnFailure: true,
};
