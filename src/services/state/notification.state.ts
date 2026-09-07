import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  defaultNotificationSettings,
  type NotificationSettings,
} from "@/models/notification-settings";

interface NotificationState extends NotificationSettings {
  setNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void;
}

/**
 * Kept flat rather than nested under a `settings` object so that persist's shallow merge
 * fills in any preference added in a later version instead of leaving it undefined.
 */
const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      ...defaultNotificationSettings,
      setNotificationSetting: (key, value) =>
        set(() => ({ [key]: value }) as Partial<NotificationState>),
    }),
    {
      name: "notification-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNotificationStore;
