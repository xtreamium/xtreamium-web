import { useRecordingNotifications } from "@/hooks/use-recording-notifications";
import { useRecordingProgressSync } from "@/hooks/use-recording-progress-sync";
import { useRecordingsSync } from "@/hooks/use-recordings-sync";

/**
 * Headless - it exists so the recording watchers are mounted once for the whole signed-in app
 * rather than only while the recordings page happens to be open.
 *
 * The three are deliberately separate: the cache sync and the progress feed run for everyone,
 * while only the notification watcher is gated on notification permission.
 */
export const RecordingNotificationsWatcher = () => {
  useRecordingsSync();
  useRecordingProgressSync();
  useRecordingNotifications();
  return null;
};

export default RecordingNotificationsWatcher;
