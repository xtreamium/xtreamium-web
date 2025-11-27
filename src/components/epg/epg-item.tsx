import React, { useState } from "react";
import { Icons } from "../icons";
import { dateToTimeString } from "@/utils/date-utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { ProxyService } from "@/services/proxy.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type EpgItemProps = {
  channelUrl: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
};

const EpgItem: React.FC<EpgItemProps> = ({
  channelUrl,
  title,
  description,
  startTime,
  endTime,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHoverCardOpen, setIsHoverCardOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use shared recordings query - React Query deduplicates across all EpgItems
  const { data: recordings } = useQuery({
    queryKey: ["recordings"],
    queryFn: ProxyService.getRecordings,
    staleTime: 30000,
  });

  // Find if this show has a scheduled recording
  const recordingId = recordings?.find(
    (r) =>
      r.url === channelUrl &&
      new Date(r.startTime).getTime() === startTime &&
      !r.isRecorded
  )?.id;

  const invalidateRecordings = () => {
    queryClient.invalidateQueries({ queryKey: ["recordings"] });
  };

  const recordShow = async () => {
    setIsLoading(true);
    try {
      const result = await ProxyService.recordShow(
        title,
        channelUrl,
        startTime,
        endTime
      );
      logger.debug("epg-item", "recordShow", "Recording requested");

      if (result) {
        invalidateRecordings();
        toast.success(
          <div>
            <div className="font-bold">Recording scheduled</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>,
          { position: "top-right" }
        );
      } else {
        toast.error(
          <div>
            <div>Unable to schedule recording!</div>
            <div>
              <a
                href="https://github.com/xtreamium/xtreamium-proxy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Make sure you've installed the proxy and that it is running.
              </a>
            </div>
          </div>,
          { position: "top-right" }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRecording = async () => {
    if (!recordingId) return;

    setIsLoading(true);
    try {
      const result = await ProxyService.deleteRecording(recordingId);
      if (result) {
        setIsHoverCardOpen(false);
        invalidateRecordings();
        toast.success(
          <div>
            <div className="font-bold">Recording cancelled</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>,
          { position: "top-right" }
        );
      } else {
        toast.error("Failed to cancel recording", { position: "top-right" });
      }
    } catch {
      toast.error("Failed to cancel recording", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Recording indicator */}
      {recordingId && (
        <div className="absolute -top-1 -left-1 z-20" title="Recording scheduled">
          <div className="bg-destructive rounded-full p-0.5 shadow-md">
            <Icons.record className="w-2.5 h-2.5 text-destructive-foreground" />
          </div>
        </div>
      )}
      <HoverCard open={isHoverCardOpen} onOpenChange={setIsHoverCardOpen}>
        <HoverCardTrigger asChild>
          <div className="w-full h-full p-2 cursor-pointer flex items-center justify-start text-sm font-medium transition-colors hover:text-secondary-foreground overflow-hidden">
            <span className="truncate w-full text-left">{title}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 max-w-sm p-0 border-border shadow-lg bg-popover">
          <div className="bg-primary px-4 py-3 rounded-t-lg">
            <h3 className="text-primary-foreground font-semibold text-base leading-tight">
              {title}
            </h3>
          </div>
          <div className="bg-popover p-4 space-y-4 rounded-b-lg">
            <p className="text-popover-foreground text-sm leading-relaxed font-medium">
              {description}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
                {dateToTimeString(new Date(startTime))} -{" "}
                {dateToTimeString(new Date(endTime))}
              </div>
              <Button
                size="sm"
                variant={recordingId ? "outline" : "destructive"}
                className="h-8 px-3 text-sm gap-1.5 font-medium"
                onClick={() =>
                  void (recordingId ? cancelRecording() : recordShow())
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.loader className="w-3.5 h-3.5 animate-spin" />
                    {recordingId ? "Cancelling..." : "Scheduling..."}
                  </>
                ) : recordingId ? (
                  <>
                    <Icons.delete className="w-3.5 h-3.5" />
                    Cancel Recording
                  </>
                ) : (
                  <>
                    <Icons.record className="w-3.5 h-3.5" />
                    Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
export default EpgItem;
