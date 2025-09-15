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
          <div className="w-full h-full p-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-colors hover:text-secondary-foreground">
            {title}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 max-w-sm p-0 border-border shadow-lg">
          <div className="bg-primary px-4 py-3 rounded-t-lg">
            <h3 className="text-primary-foreground font-semibold text-base leading-tight">
              {title}
            </h3>
          </div>
          <div className="bg-card p-4 space-y-4 rounded-b-lg">
            <p className="text-foreground text-sm leading-relaxed font-medium">
              {description}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
                {dateToTimeString(new Date(startTime))} -{" "}
                {dateToTimeString(new Date(endTime))}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-3 text-sm gap-1.5 font-medium"
                onClick={async () =>
                  await recordShow(channelUrl, startTime, endTime)
                }
              >
                <Icons.record className="w-3.5 h-3.5" />
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
