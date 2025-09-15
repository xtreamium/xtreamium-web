import { ApiService } from "@/services";
import type { Server } from "@/models/server";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import EpgItem from "./epg-item";

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
    const now = Date.now();

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
        return endTime > now;
      });
    }

    // If not raw format, try EPGListing format (fallback)
    return [];
  };

  const isCurrentlyPlaying = (show: RawEPGItem): boolean => {
    const now = Date.now();
    const startTime = parseDateTime(show.start);
    const endTime = parseDateTime(show.stop);

    return now >= startTime && now <= endTime;
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
  const renderTimelineView = () => (
    <ScrollArea className="w-full">
      <div className="flex pb-4 pr-4">
        {/* Time Header */}
        <div className="h-16 bg-purple-500 flex items-center justify-center text-white text-sm font-medium min-w-0 flex-1">
          {shows.map((show, index) => {
            const startTime = parseDateTime(show.start);
            const endTime = parseDateTime(show.stop);
            const duration = endTime - startTime;
            const width = Math.max(120, (duration / (1000 * 60)) * 2); // 2px per minute, min 120px
            
            return (
              <div
                key={`time-${index}`}
                className="border-r border-purple-400 px-2 text-center flex-shrink-0"
                style={{ width: `${width}px` }}
              >
                {formatTime(startTime)}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex pb-4 pr-4">
        {/* Program Row */}
        <div className="h-12 bg-orange-500 flex items-center text-white text-sm font-medium min-w-0 flex-1">
          {shows.map((show, index) => {
            const startTime = parseDateTime(show.start);
            const endTime = parseDateTime(show.stop);
            const duration = endTime - startTime;
            const width = Math.max(120, (duration / (1000 * 60)) * 2); // 2px per minute, min 120px
            const isPlaying = isCurrentlyPlaying(show);
            
            return (
              <div
                key={`show-${index}`}
                className={`border-r border-orange-400 flex-shrink-0 ${
                  isPlaying ? 'bg-orange-600' : ''
                }`}
                style={{ width: `${width}px`, height: '48px' }}
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

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">TV Guide</h3>
        </div>
        
        {/* Timeline view */}
        {renderTimelineView()}
      </div>
    </TooltipProvider>
  );
};

export default EPGComponent;
