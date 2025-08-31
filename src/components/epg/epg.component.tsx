import React from 'react';
import { EPGListing, Server } from '@/models';
import { ApiService } from '@/services';
import { dateToTimeString, roundDateDown } from '@/utils/date-utils';
import EpgItem from './epg-item';
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
  }, [channelId]);

  const _mapHeaderRows = () => {
    const currentTime = new Date();
    const startTime = roundDateDown(currentTime, 30 * 60 * 1000);

    const timebar = [];
    const programs = [];
    let currentStartRendering = 0;
    const cellDuration = 1000 * 60 * 30;
    const totalDuration = cellDuration * 9;

    for (let i = 0; i <= 8; i++) {
      //need to find how long the first program has been running for and
      //set the width of that to a multiple of the width of the other cells
      const currentRenderingTime = new Date(
        startTime.getTime() + cellDuration * i
      );
      const time = dateToTimeString(
        currentRenderingTime //half hour segments
      );
      timebar.push(<td key={i}>{time}</td>);

      //need to find the program that is playing at this time
      const nowPlaying = epg.find((r) => {
        return (
          r.getStartTime() <= currentRenderingTime.getTime() &&
          r.getStopTime() >= currentRenderingTime.getTime()
        );
      });

      if (nowPlaying && currentStartRendering !== nowPlaying?.getStartTime()) {
        //calculate the duration of the program as a percentage of the total duration.
        const thisDurationPercentage =
          ((i === 0
            ? nowPlaying.getStopTime() - startTime.getTime()
            : nowPlaying.getStopTime() - nowPlaying.getStartTime()) /
            totalDuration) *
          100;
        programs.push(
          <td
            key={i}
            className="h-10 text-xs break-words hover:bg-indigo-400 hover:text-white"
            style={{ width: `${thisDurationPercentage}%` }}
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
      }
      currentStartRendering = nowPlaying?.getStartTime() || 0;
    }

    return (
      <td colSpan={3} className="text-base-content ">
        <table className="w-full table-fixed">
          <thead className="mb-7">
            <tr className="font-semibold bg-primary">{timebar}</tr>
          </thead>
        </table>
        <table className="w-full text-base-100 bg-secondary">
          <tbody className="w-full mt-2">
            <tr className="w-full">{programs}</tr>
          </tbody>
        </table>
      </td>
    );
  };
  return epg && epg.length ? _mapHeaderRows() : null;
};

export default EPGComponent;
