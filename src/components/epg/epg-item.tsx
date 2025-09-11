import React from "react";
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
  const recordShow = async (
    channelUrl: string,
    startTime: number,
    endTime: number
  ) => {
    const result = await ProxyService.recordShow(
      channelUrl,
      startTime,
      endTime
    );
    logger.debug("epg-item", "recordShow", "Recording requested");

    if (!result) {
      toast(
        <div>
          <div>🚫 Unable to schedule recording!</div>
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
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="w-full h-full p-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-colors hover:text-primary">
            {title}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 max-w-sm p-0">
          <div className="bg-gradient-to-r from-primary to-primary/90 px-4 py-3 rounded-t-md">
            <h3 className="text-primary-foreground font-semibold text-base leading-tight">
              {title}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium">
                {dateToTimeString(new Date(startTime))} -{" "}
                {dateToTimeString(new Date(endTime))}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 px-2 text-xs gap-1"
                onClick={async () =>
                  await recordShow(channelUrl, startTime, endTime)
                }
              >
                <Icons.record className="w-3 h-3" />
                Record
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
export default EpgItem;
