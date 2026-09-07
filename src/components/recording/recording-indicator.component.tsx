import React from "react";
import { Link } from "react-router-dom";

import { Icons } from "@/components/icons";
import RecordingProgress from "@/components/recording/recording-progress.component";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecordings } from "@/hooks/use-recordings";

/**
 * Shows what is capturing right now, from anywhere in the app. Renders nothing at all when
 * nothing is recording, so it stays out of the way the rest of the time.
 */
export const RecordingIndicator: React.FC = () => {
  const { data: recordings = [] } = useRecordings();
  const [open, setOpen] = React.useState(false);

  const inProgress = recordings.filter((r) => r.status === "recording");

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-sm font-medium tabular-nums">
                {inProgress.length}
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-sm">
          {inProgress.length === 1
            ? "1 recording in progress"
            : `${inProgress.length} recordings in progress`}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-96 space-y-4">
        <p className="font-semibold">
          {inProgress.length === 1
            ? "Recording now"
            : `Recording now (${inProgress.length})`}
        </p>

        <div className="space-y-4">
          {inProgress.map((recording) => (
            <div key={recording.id} className="space-y-2">
              <p className="text-sm font-medium leading-tight">
                {recording.title}
              </p>
              <RecordingProgress recording={recording} />
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full gap-2"
          onClick={() => setOpen(false)}
        >
          <Link to="/recordings">
            <Icons.record className="h-4 w-4" />
            All recordings
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default RecordingIndicator;
