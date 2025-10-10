import { ApiService } from "@/services";
import type { Server } from "@/models/server";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import EpgItem from "./epg-item";
import {
  getPrevious30MinuteBoundary,
  generate30MinuteIntervals,
  THIRTY_MINUTES_MS,
} from "@/utils/date-utils";
import { useState, useEffect } from "react";

interface IEPGComponentProps {
  server: Server;
  channelId: string;
  streamId: number;
}

interface RawEPGItem {
  start: string;
  stop: string;
  title: string;
  description: string;
  categories: string[];
}

const EPGComponent = ({ server, channelId, streamId }: IEPGComponentProps) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const epgQuery = useQuery({
    queryKey: [`epg_${channelId}`],
    queryFn: () => {
      if (!server) {
        throw new Error("No server selected");
      }
      return ApiService.getEPGForChannel(server, channelId);
    },
    enabled: !!server,
  });

  const parseDateTime = (dateTimeStr: string): number => {
    // Parse format: "20250915121000 +0100"
    const [dateTime] = dateTimeStr.split(" ");
    const year = parseInt(dateTime.slice(0, 4));
    const month = parseInt(dateTime.slice(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateTime.slice(6, 8));
    const hour = parseInt(dateTime.slice(8, 10));
    const minute = parseInt(dateTime.slice(10, 12));
    const second = parseInt(dateTime.slice(12, 14));

    return new Date(year, month, day, hour, minute, second).getTime();
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getCurrentAndUpcomingShows = (epgData: unknown[]) => {
    // Check if the data contains raw JSON objects with start/stop strings
    const rawShows = epgData.filter((item: unknown): item is RawEPGItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        "start" in item &&
        "stop" in item &&
        "title" in item &&
        typeof (item as RawEPGItem).start === "string"
      );
    });

    if (rawShows.length > 0) {
      // Handle raw JSON format
      return rawShows.filter((show) => {
        const endTime = parseDateTime(show.stop);
        return endTime > currentTime;
      });
    }

    // If not raw format, try EPGListing format (fallback)
    return [];
  };

  const isCurrentlyPlaying = (show: RawEPGItem): boolean => {
    const startTime = parseDateTime(show.start);
    const endTime = parseDateTime(show.stop);

    return currentTime >= startTime && currentTime <= endTime;
  };

  if (epgQuery.isLoading) {
    return <div className="p-4">Loading EPG data...</div>;
  }

  if (epgQuery.error) {
    return <div className="p-4 text-red-500">Error loading EPG data</div>;
  }

  if (!epgQuery.data || epgQuery.data.length === 0) {
    return <div className="p-4">No EPG data available</div>;
  }

  const shows = getCurrentAndUpcomingShows(epgQuery.data);

  if (shows.length === 0) {
    return (
      <div className="p-4">
        <div>No upcoming shows</div>
        <div className="text-xs mt-2 text-gray-500">
          Total shows in data: {epgQuery.data.length}
        </div>
        <div className="text-xs text-gray-500">
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    );
  }

  // Timeline View Render Function
  const renderTimelineView = () => {
    const INTERVAL_WIDTH = 120; // pixels per 30-minute interval

    // Get the start boundary (previous 30-minute interval to now)
    const timelineStart = getPrevious30MinuteBoundary(currentTime);

    // Calculate how much time is remaining in the first interval
    const timeElapsedInFirstInterval = currentTime - timelineStart;
    const timeRemainingInFirstInterval =
      THIRTY_MINUTES_MS - timeElapsedInFirstInterval;
    const proportionalFirstWidth =
      (timeRemainingInFirstInterval / THIRTY_MINUTES_MS) * INTERVAL_WIDTH;

    // Ensure minimum width for time text (about 60px should be enough for "HH:MM")
    const MIN_INTERVAL_WIDTH = 60;
    const firstIntervalWidth = Math.max(
      MIN_INTERVAL_WIDTH,
      proportionalFirstWidth
    );

    // Calculate timeline end based on all shows
    const lastShowEnd = Math.max(
      ...shows.map((show) => parseDateTime(show.stop))
    );
    const timelineEnd = lastShowEnd + THIRTY_MINUTES_MS; // Add buffer

    // Generate 30-minute intervals for the timeline
    const timeIntervals = generate30MinuteIntervals(
      timelineStart,
      timelineEnd - timelineStart
    );

    // Calculate total width accounting for the proportional first interval
    const totalTimelineWidth =
      firstIntervalWidth + (timeIntervals.length - 1) * INTERVAL_WIDTH;

    return (
      <ScrollArea className="w-full">
        <div className="pb-4 pr-4" style={{ width: `${totalTimelineWidth}px` }}>
          {/* Time Header */}
          <div className="h-10 bg-primary flex items-center text-primary-foreground text-sm font-medium">
            {timeIntervals.map((intervalStart, index) => {
              const isFirstInterval = index === 0;
              const intervalWidth = isFirstInterval
                ? firstIntervalWidth
                : INTERVAL_WIDTH;

              return (
                <div
                  key={`time-${index}`}
                  className="border-r border-primary-foreground/20 px-2 text-left flex-shrink-0 flex items-center"
                  style={{ width: `${intervalWidth}px` }}
                >
                  {formatTime(intervalStart)}
                </div>
              );
            })}
          </div>

          {/* Program Row */}
          <div className="h-12 bg-secondary text-secondary-foreground text-sm font-medium relative">
            {shows.map((show, index) => {
              const startTime = parseDateTime(show.start);
              const endTime = parseDateTime(show.stop);
              const isPlaying = isCurrentlyPlaying(show);

              // Calculate position accounting for the proportional first interval
              const calculateLeftOffset = (time: number): number => {
                if (time <= timelineStart + THIRTY_MINUTES_MS) {
                  // Within the first interval
                  const offsetInFirstInterval = time - timelineStart;
                  return (
                    (offsetInFirstInterval / THIRTY_MINUTES_MS) *
                    firstIntervalWidth
                  );
                } else {
                  // Beyond the first interval
                  const fullIntervalsAfterFirst = Math.floor(
                    (time - timelineStart - THIRTY_MINUTES_MS) /
                      THIRTY_MINUTES_MS
                  );
                  const remainderInInterval =
                    (time - timelineStart - THIRTY_MINUTES_MS) %
                    THIRTY_MINUTES_MS;
                  return (
                    firstIntervalWidth +
                    fullIntervalsAfterFirst * INTERVAL_WIDTH +
                    (remainderInInterval / THIRTY_MINUTES_MS) * INTERVAL_WIDTH
                  );
                }
              };

              const rawLeftOffset = calculateLeftOffset(startTime);
              const rawEndOffset = calculateLeftOffset(endTime);
              const rawWidth = rawEndOffset - rawLeftOffset;

              // Handle programmes that start before the visible timeline
              const leftOffset = Math.max(0, rawLeftOffset);
              const isClippedStart = rawLeftOffset < 0;
              const width = Math.max(0, isClippedStart
                ? rawWidth + rawLeftOffset
                : rawWidth);

              return (
                <div
                  key={`show-${index}`}
                  className={`absolute border-r border-border transition-colors duration-200 hover:bg-accent hover:text-accent-foreground cursor-pointer overflow-hidden ${
                    isPlaying
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary/80 text-secondary-foreground"
                  }`}
                  style={{
                    left: `${leftOffset}px`,
                    width: `${width}px`,
                    height: "48px",
                  }}
                >
                  <EpgItem
                    channelUrl={`${server.url}/live/${server.username}/${server.password}/${streamId}.m3u8`}
                    title={show.title}
                    description={show.description}
                    startTime={startTime}
                    endTime={endTime}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full">{renderTimelineView()}</div>
    </TooltipProvider>
  );
};

export default EPGComponent;
