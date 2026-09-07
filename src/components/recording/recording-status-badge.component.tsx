import React from "react";

import { Icons } from "@/components/icons";
import { useRecordingProgress } from "@/hooks/use-recording-progress";
import type { Recording } from "@/models/recording";

/**
 * The badge for a capture that is currently running.
 *
 * Its own component purely so the progress hook is called at the top of a component rather than
 * inside the recordings list's map callback.
 */
export const InProgressBadge: React.FC<{ recording: Recording }> = ({
  recording,
}) => {
  const { isStalled } = useRecordingProgress(recording);

  if (isStalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
        <Icons.info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          Stalled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-sm font-medium text-primary">Recording</span>
    </div>
  );
};

export default InProgressBadge;
