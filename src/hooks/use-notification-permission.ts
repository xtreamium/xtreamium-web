import { useCallback, useEffect, useState } from "react";
import {
  getNotificationPermission,
  getNotificationSupport,
  requestNotificationPermission,
  type NotificationSupport,
} from "@/lib/notifications";

export interface UseNotificationPermission {
  support: NotificationSupport;
  permission: NotificationPermission;
  /** Permission granted and the browser can actually show a notification. */
  isGranted: boolean;
  /** The user refused. Re-asking will not re-prompt - they have to unblock us in site settings. */
  isBlocked: boolean;
  /** Never asked yet, so a prompt is still possible. */
  canPrompt: boolean;
  request: () => Promise<NotificationPermission>;
}

/**
 * Tracks notification permission as live state. The value can change outside the app -
 * the user resetting it in site settings, or another tab prompting - so it is re-read
 * on permission change and whenever the user comes back to the tab, rather than trusting
 * whatever was true at mount.
 */
export const useNotificationPermission = (): UseNotificationPermission => {
  const [support] = useState<NotificationSupport>(getNotificationSupport);
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission
  );

  useEffect(() => {
    if (support !== "supported") {
      return;
    }

    let status: PermissionStatus | null = null;
    let cancelled = false;
    const sync = () => setPermission(getNotificationPermission());

    navigator.permissions
      ?.query({ name: "notifications" })
      .then((result) => {
        if (cancelled) {
          return;
        }
        status = result;
        result.addEventListener("change", sync);
        sync();
      })
      .catch(() => {
        // Not every browser exposes notifications through the Permissions API;
        // the focus/visibility listeners below are enough on their own.
      });

    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      status?.removeEventListener("change", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [support]);

  const request = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    support,
    permission,
    isGranted: support === "supported" && permission === "granted",
    isBlocked: permission === "denied",
    canPrompt: support === "supported" && permission === "default",
    request,
  };
};
