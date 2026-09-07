import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ConnectionState } from "@/contexts/proxy-hub-context";
import { useProxyHub, useProxyHubEvent } from "@/hooks/use-proxy-hub";
import { logger } from "@/lib/logger";
import useRecordingProgressStore from "@/services/state/recording-progress.state";

/** Coalesces a burst of changes into one refetch. */
const INVALIDATE_DEBOUNCE_MS = 250;

/**
 * Keeps the recordings cache in step with the proxy.
 *
 * Push is the fast path, polling is the reconciler: an event says only that *something* changed,
 * and the query cache stays the only thing that knows what it changed to. That keeps one source
 * of truth, so the notification diff cannot double-fire, and it means a malformed or unexpected
 * payload still ends with the client correct.
 *
 * Deliberately separate from the notifications hook: that one is gated on notification
 * permission, and wanting a fresh list has nothing to do with wanting to be notified.
 */
export const useRecordingsSync = () => {
  const queryClient = useQueryClient();
  const { connectionState } = useProxyHub();
  const clearProgress = useRecordingProgressStore((s) => s.clearProgress);
  const debounceRef = useRef<number | null>(null);

  const invalidate = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      void queryClient.invalidateQueries({ queryKey: ["recordings"] });
    }, INVALIDATE_DEBOUNCE_MS);
  }, [queryClient]);

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    []
  );

  useProxyHubEvent("RecordingChanged", (payload) => {
    logger.debug("RecordingChanged", payload, "use-recordings-sync");

    // Read defensively and only to tidy up: a row that has left "recording" has no live capture
    // behind it any more. The invalidation below must happen whatever this payload looks like.
    const event = payload as { id?: string; status?: string } | undefined;
    if (event?.id && event.status !== "recording") {
      clearProgress(event.id);
    }

    invalidate();
  });

  // Events raised while we were disconnected are simply gone - a proxy restart, a laptop waking
  // up, a network blip - so treat every connection as a reconciliation point. This is what
  // recovers the one transition that can never be pushed: the startup reconciliation of
  // recordings interrupted by a restart, which runs before any client can connect.
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      void queryClient.invalidateQueries({ queryKey: ["recordings"] });
    }
  }, [connectionState, queryClient]);
};
