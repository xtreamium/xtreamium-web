/**
 * Thin wrapper around the browser Notification API. Everything here is defensive:
 * the API is missing on some browsers, unusable outside a secure context, and throws
 * outright on platforms that insist on a service worker.
 */
import { logger } from "@/lib/logger";

const CONTEXT = "notifications";

export type NotificationSupport = "supported" | "unsupported" | "insecure-context";

export const getNotificationSupport = (): NotificationSupport => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  // Notifications are gated behind a secure context - served over plain http (anything
  // other than localhost) the constructor exists but permission can never be granted.
  if (!window.isSecureContext) {
    return "insecure-context";
  }
  return "supported";
};

export const isNotificationSupported = (): boolean =>
  getNotificationSupport() === "supported";

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
};

/**
 * Asks the browser for permission. Note that once the user has denied it, browsers
 * resolve this immediately as "denied" without showing a prompt - the block can only be
 * lifted from the browser's own site settings.
 */
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
      return "denied";
    }
    try {
      return await Notification.requestPermission();
    } catch (error) {
      logger.error(
        "Failed to request notification permission",
        { error },
        CONTEXT
      );
      return getNotificationPermission();
    }
  };

export interface DesktopNotificationOptions {
  title: string;
  body?: string;
  /** Replaces an earlier notification carrying the same tag rather than stacking a second one. */
  tag?: string;
  onClick?: () => void;
}

export const showDesktopNotification = ({
  title,
  body,
  tag,
  onClick,
}: DesktopNotificationOptions): Notification | null => {
  if (!isNotificationSupported() || getNotificationPermission() !== "granted") {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      tag,
      icon: "/app-icon.png",
      badge: "/favicon-32x32.png",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };

    return notification;
  } catch (error) {
    // Mobile browsers reject the constructor outright and demand a service worker
    // registration instead. Nothing useful to fall back to, so just record it.
    logger.error("Failed to show desktop notification", { error }, CONTEXT);
    return null;
  }
};
