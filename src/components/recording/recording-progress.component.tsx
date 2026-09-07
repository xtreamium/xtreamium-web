import React from "react";

import { Icons } from "@/components/icons";
import { Progress } from "@/components/ui/progress";
import { useRecordingProgress } from "@/hooks/use-recording-progress";
import type { Recording } from "@/models/recording";
import { cn } from "@/lib/utils";

const formatDuration = (totalSeconds: number): string => {
  const seconds = Math.max(Math.floor(totalSeconds), 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
};

type RecordingProgressProps = {
  recording: Recording;
  className?: string;
};

/**
 * Progress for an in-flight capture.
 *
 * The bar is driven by the clock, which is smooth and always available. When the proxy is
 * pushing capture positions, a marker shows where ffmpeg has actually got to - the gap between
 * the two is the only visible sign that a stream has stalled.
 *
 * Lives here rather than in components/ui: that folder is shadcn's, and has to stay deletable.
 */
export const RecordingProgress: React.FC<RecordingProgressProps> = ({
  recording,
  className,
}) => {
  const {
    wallPercent,
    capturePercent,
    driftSeconds,
    hasCaptureData,
    isStalled,
    remainingMs,
  } = useRecordingProgress(recording);

  const start = new Date(recording.startTime).getTime();
  const end = new Date(recording.endTime).getTime();
  const totalSeconds = Math.max((end - start) / 1000, 0);
  const elapsedSeconds = (wallPercent / 100) * totalSeconds;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Progress
          value={wallPercent}
          className={cn(isStalled && "bg-amber-500/20")}
        />
        {hasCaptureData && capturePercent !== null && (
          <span
            className={cn(
              "absolute top-0 h-2 w-0.5 rounded-full",
              isStalled ? "bg-amber-600" : "bg-emerald-500"
            )}
            style={{ left: `${capturePercent}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-mono text-muted-foreground tabular-nums">
          {formatDuration(elapsedSeconds)} / {formatDuration(totalSeconds)}
          {hasCaptureData && capturePercent !== null && (
            <span className="ml-2">
              · {formatDuration((capturePercent / 100) * totalSeconds)} captured
            </span>
          )}
        </span>

        {isStalled ? (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
            <Icons.info className="h-3 w-3" />
            Stalled
            {driftSeconds !== null && driftSeconds > 0 && (
              <> — {formatDuration(driftSeconds)} behind</>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground tabular-nums">
            {formatDuration(remainingMs / 1000)} left
          </span>
        )}
      </div>
    </div>
  );
};

export default RecordingProgress;
