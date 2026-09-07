import { create } from "zustand";

export interface RecordingProgressTick {
  /** Media time ffmpeg has actually written. Stops advancing when the input stalls. */
  capturedSeconds: number;
  /** Wall clock since capture began, as measured by the proxy. */
  elapsedSeconds: number;
  /** Total scheduled duration. */
  durationSeconds: number;
  /**
   * Date.now() when this landed - our clock, deliberately, not the proxy's. The two machines
   * need not agree, and all we ever ask is "how long since the last tick, by my reckoning".
   */
  receivedAt: number;
}

interface RecordingProgressState {
  progress: Record<string, RecordingProgressTick>;
  setProgress: (id: string, tick: RecordingProgressTick) => void;
  clearProgress: (id: string) => void;
}

/**
 * Live capture positions, keyed by recording id.
 *
 * Not persisted, unlike the other stores here: a tick restored from localStorage on the next
 * load would be a lie about a capture that stopped hours ago.
 *
 * Deliberately NOT part of the react-query cache. Ticks arrive about once a second, and anything
 * that invalidated ["recordings"] on each one would issue a full GET /recordings every second.
 * A zustand selector also re-renders only the card that actually ticked.
 */
const useRecordingProgressStore = create<RecordingProgressState>()((set) => ({
  progress: {},
  setProgress: (id, tick) =>
    set((state) => ({ progress: { ...state.progress, [id]: tick } })),
  clearProgress: (id) =>
    set((state) => {
      if (!(id in state.progress)) {
        return state;
      }
      const { [id]: _removed, ...rest } = state.progress;
      return { progress: rest };
    }),
}));

export default useRecordingProgressStore;
