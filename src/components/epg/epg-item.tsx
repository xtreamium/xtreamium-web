import React, { Fragment } from "react";
import { Icons } from "../icons";
import { dateToTimeString } from "@/utils/date-utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [isHover, setIsHover] = React.useState(false);
  const recordShow = async (
    channelUrl: string,
    startTime: number,
    endTime: number
  ) => {
    const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/record`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        url: channelUrl,
        startTime: startTime,
        endTime: endTime,
      }),
    });

    console.log("epg-item", "recordShow", response);
  };

  return (
    <div className="w-full h-full">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" className="w-full h-full hover:*:">
            {title}
          </Button>
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
