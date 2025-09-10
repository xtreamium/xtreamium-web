import React from "react";
import { ApiService } from "@/services";
import { dateToTimeString, roundDateDown } from "@/utils/date-utils";
import EpgItem from "./epg-item";
import type { Server } from "@/models/server";
import type { EPGListing } from "@/models/epg-listing";
interface IEPGComponentProps {
  server: Server;
  channelId: string;
}
const EPGComponent = ({ server, channelId }: IEPGComponentProps) => {
  const [epg, setEpg] = React.useState<EPGListing[]>([]);

  React.useEffect(() => {
    const fetchChannels = async () => {
      const response = await ApiService.getEPGForChannel(server, channelId);
      setEpg(response);
    };
    if (channelId) {
      fetchChannels();
    }
  }, [channelId, server]);

  const _mapHeaderRows = () => {
    const currentTime = new Date();
    const startTime = roundDateDown(currentTime, 30 * 60 * 1000);

    const timebar = [];
    const programs = [];
    let currentStartRendering = 0;
    const cellDuration = 1000 * 60 * 30; // 30 minutes
    const totalSlots = 24; // Show 12 hours (24 slots of 30 minutes each)
    const totalDuration = cellDuration * totalSlots;

    // Create time slots for 12 hours ahead
    for (let i = 0; i < totalSlots; i++) {
      const currentRenderingTime = new Date(
        startTime.getTime() + cellDuration * i
      );
      const time = dateToTimeString(currentRenderingTime);

      timebar.push(
        <th
          key={i}
          className="px-4 py-2 text-xs font-medium text-primary-foreground whitespace-nowrap min-w-[120px]"
        >
          {time}
        </th>
      );

      // Find the program that is playing at this time
      const nowPlaying = epg.find((r) => {
        return (
          r.getStartTime() <= currentRenderingTime.getTime() &&
          r.getStopTime() >= currentRenderingTime.getTime()
        );
      });

      if (nowPlaying && currentStartRendering !== nowPlaying?.getStartTime()) {
        // Calculate the duration of the program as a percentage of the total duration.
        const programDuration =
          i === 0
            ? nowPlaying.getStopTime() - startTime.getTime()
            : nowPlaying.getStopTime() - nowPlaying.getStartTime();

        const thisDurationPercentage = (programDuration / totalDuration) * 100;

        programs.push(
          <td
            key={`${i}-${nowPlaying.getStartTime()}`}
            className="h-12 text-xs break-words hover:bg-primary/80 hover:text-primary-foreground border-r border-border min-w-[120px]"
            style={{ width: `${Math.max(thisDurationPercentage, 5)}%` }} // Minimum 5% width
          >
            <EpgItem
              channelUrl="TODO: Fetch Channel URL"
              title={nowPlaying.getTitle()}
              startTime={nowPlaying.getStartTime()}
              endTime={nowPlaying.getStopTime()}
              description={nowPlaying.getDescription()}
            />
          </td>
        );
        currentStartRendering = nowPlaying.getStartTime();
      }
    }

    return (
      <td colSpan={3} className="p-0 text-foreground">
        {/* Horizontal scrollable container */}
        <div className="w-full max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            {" "}
            {/* Minimum width to ensure horizontal scroll */}
            {/* Time header */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary">{timebar}</tr>
              </thead>
            </table>
            {/* Programs */}
            <table className="w-full border-collapse bg-secondary/50">
              <tbody>
                <tr className="w-full">
                  {programs.length > 0 ? (
                    programs
                  ) : (
                    <td className="h-12 px-4 py-2 text-center text-muted-foreground">
                      No EPG data available
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </td>
    );
  };
  return epg && epg.length ? _mapHeaderRows() : null;
};

export default EPGComponent;
