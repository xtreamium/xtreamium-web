import { useProxyHubEvent } from "@/hooks/use-proxy-hub";
import useRecordingProgressStore, {
  type RecordingProgressTick,
} from "@/services/state/recording-progress.state";

type RecordingProgressPayload = Partial<
  Omit<RecordingProgressTick, "receivedAt">
> & { id?: string };

/**
 * Feeds pushed capture positions into the progress store.
 *
 * Note what this does NOT do: touch the react-query cache. Ticks arrive roughly once a second,
 * so invalidating ["recordings"] here would mean a full GET /recordings every second. The
 * lifecycle events in use-recordings-sync are what keep the list fresh.
 */
export const useRecordingProgressSync = () => {
  const setProgress = useRecordingProgressStore((s) => s.setProgress);

  useProxyHubEvent("RecordingProgress", (payload) => {
    const tick = payload as RecordingProgressPayload | undefined;
    if (!tick?.id) {
      return;
    }

    setProgress(tick.id, {
      capturedSeconds: tick.capturedSeconds ?? 0,
      elapsedSeconds: tick.elapsedSeconds ?? 0,
      durationSeconds: tick.durationSeconds ?? 0,
      receivedAt: Date.now(),
    });
  });
};
