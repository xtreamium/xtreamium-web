import { ConnectionState } from "@/contexts/proxy-hub-context";
import { useNow } from "@/hooks/use-now";
import { useProxyHub } from "@/hooks/use-proxy-hub";
import type { Recording } from "@/models/recording";
import useRecordingProgressStore from "@/services/state/recording-progress.state";

/** No tick for this long, while the clock runs on, means we have lost sight of the capture. */
const TICK_TIMEOUT_MS = 10000;

/** Captured media time this far behind the wall clock is a stalled input, not jitter. */
const STALL_DRIFT_SECONDS = 15;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface RecordingProgress {
  /** Where the clock says we are. Always present, always smooth. */
  wallPercent: number;
  /** Where the proxy says ffmpeg actually is, when it is telling us. */
  capturePercent: number | null;
  /** How far captured media time is behind the wall clock. */
  driftSeconds: number | null;
  hasCaptureData: boolean;
  isStalled: boolean;
  remainingMs: number;
}

/**
 * Combines the local clock with pushed capture position.
 *
 * The clock always drives the bar; capture position annotates it. That is what makes the
 * degraded case free rather than a separate code path - an old proxy or a dropped connection
 * simply means no annotation.
 */
export const useRecordingProgress = (recording: Recording): RecordingProgress => {
  const tick = useRecordingProgressStore((s) => s.progress[recording.id]);
  const { connectionState } = useProxyHub();
  const now = useNow(1000);

  const start = new Date(recording.startTime).getTime();
  const end = new Date(recording.endTime).getTime();
  const totalMs = Math.max(end - start, 1);
  const wallPercent = clamp(((now - start) / totalMs) * 100, 0, 100);

  // Capture data is only worth anything while the hub is up. A dropped connection looks exactly
  // like a stalled ffmpeg from here, and blaming the stream for our own network is worse than
  // saying nothing at all.
  const isLive = connectionState === ConnectionState.Connected;
  const hasCaptureData = isLive && !!tick;
  const isFresh = !!tick && now - tick.receivedAt < TICK_TIMEOUT_MS;

  const capturePercent = tick
    ? clamp((tick.capturedSeconds / Math.max(tick.durationSeconds, 1)) * 100, 0, 100)
    : null;
  const driftSeconds = tick
    ? Math.max(tick.elapsedSeconds - tick.capturedSeconds, 0)
    : null;

  // Two rules, because they catch different failures: going quiet is what actually happens when
  // an IPTV input dies and ffmpeg starts reconnecting, while drift catches it still emitting
  // but falling behind.
  const isStalled =
    hasCaptureData && (!isFresh || (driftSeconds ?? 0) > STALL_DRIFT_SECONDS);

  return {
    wallPercent,
    capturePercent,
    driftSeconds,
    hasCaptureData,
    isStalled,
    remainingMs: Math.max(end - now, 0),
  };
};
