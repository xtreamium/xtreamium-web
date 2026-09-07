import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { showDesktopNotification } from "@/lib/notifications";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { useRecordings } from "@/hooks/use-recordings";
import type { RecordingStatus } from "@/models/recording";
import useNotificationStore from "@/services/state/notification.state";
import { formatTime } from "@/utils/date-utils";

type FinishedStatus = Extract<
  RecordingStatus,
  "complete" | "partial" | "failed"
>;

const isFinishedStatus = (
  status: RecordingStatus
): status is FinishedStatus =>
  status === "complete" || status === "partial" || status === "failed";

const FINISHED_MESSAGES: Record<
  FinishedStatus,
  { title: string; body: (showTitle: string) => string }
> = {
  complete: {
    title: "Recording finished",
    body: (showTitle) => `${showTitle} is ready to watch.`,
  },
  partial: {
    title: "Recording finished early",
    body: (showTitle) => `${showTitle} was only partly recorded.`,
  },
  failed: {
    title: "Recording failed",
    body: (showTitle) => `${showTitle} could not be recorded.`,
  },
};

/**
 * Watches the proxy's recordings for status changes and raises a desktop notification
 * when one starts or ends.
 *
 * Transitions are worked out by diffing successive snapshots of the recordings list rather than
 * from the push events themselves. That keeps one decider: a pushed event only invalidates the
 * cache (see use-recordings-sync), so an event and the poll that follows it cannot both fire a
 * notification, and a transition missed while disconnected is still caught on reconnect.
 */
export const useRecordingNotifications = () => {
  const navigate = useNavigate();
  const { enabled, notifyOnStart, notifyOnFinish, notifyOnFailure } =
    useNotificationStore();
  const { isGranted } = useNotificationPermission();
  const { data: recordings } = useRecordings();

  const active = enabled && isGranted;

  // Statuses as of the previous poll. Null means "not seeded yet": the first response
  // only establishes a baseline, so recordings that were already running (or already
  // finished) when the app loaded don't set off a burst of notifications.
  const previousStatuses = useRef<Map<string, RecordingStatus> | null>(null);

  useEffect(() => {
    // The recordings page keeps this query key populated even while notifications are
    // off, so drop the baseline when inactive - it would be stale by the time it mattered.
    if (!active || !recordings) {
      previousStatuses.current = null;
      return;
    }

    const previous = previousStatuses.current;
    previousStatuses.current = new Map(
      recordings.map((recording) => [recording.id, recording.status])
    );

    if (!previous) {
      return;
    }

    const openRecordings = () => void navigate("/recordings");

    for (const recording of recordings) {
      const before = previous.get(recording.id);
      if (before === recording.status) {
        continue;
      }

      // An id we have never seen before counts as a change too: a recording created and
      // started between two polls is still news, and one that also finished inside that
      // window is reported as an ending, which is the half worth hearing about.
      if (
        recording.status === "recording" &&
        (before === undefined || before === "pending")
      ) {
        if (notifyOnStart) {
          showDesktopNotification({
            title: "Recording started",
            body: `${recording.title} - recording until ${formatTime(
              recording.endTime
            )}`,
            tag: `xtreamium-recording-${recording.id}-started`,
            onClick: openRecordings,
          });
        }
        continue;
      }

      if (isFinishedStatus(recording.status)) {
        const wanted =
          recording.status === "failed" ? notifyOnFailure : notifyOnFinish;
        if (!wanted) {
          continue;
        }

        const message = FINISHED_MESSAGES[recording.status];
        showDesktopNotification({
          title: message.title,
          body: message.body(recording.title),
          tag: `xtreamium-recording-${recording.id}-finished`,
          onClick: openRecordings,
        });
      }
    }
  }, [
    active,
    recordings,
    notifyOnStart,
    notifyOnFinish,
    notifyOnFailure,
    navigate,
  ]);
};
