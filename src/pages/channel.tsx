import React, { Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiService } from "@/services";
import { Icons } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";
import useServerStore from "@/services/state/server.state";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import Loading from "@/components/loading";
import type { Stream } from "@/models/stream";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/widgets/image-with-fallback";
import EPGComponent from "@/components/epg/epg.component";

const ChannelPage = () => {
  const { selectedServer } = useServerStore();
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  const params = useParams();
  const server = userQuery.data?.servers.find((s) => s.id === selectedServer);

  const channelQuery = useQuery({
    queryKey: [`channels_${params.channelId}`],
    queryFn: () => ApiService.getChannels(server, params.channelId as string),
    enabled: !!server,
  });
  const copyStreamUrl = async (streamId: number) => {
    try {
      const url = await ApiService.getStreamUrl(server, streamId);
      console.log("channel.page", "copyStreamUrl", url);
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          toast.success(
            <>
              <div className="font-bold text-gray-800">
                🙌 URL copied to clipboard
              </div>
            </>,
            {
              position: "top-right",
              closeOnClick: true,
            }
          );
        });
      }
    } catch (err) {
      console.error("channel.page", "copyStreamUrl", err);
      toast.error(
        <>
          <div className="font-bold text-gray-800">🤦 Failed to copy URL</div>
        </>,
        {
          position: "top-right",
          closeOnClick: true,
        }
      );
    }
  };
  const playStreamInternal = async (streamId: number) => {
    navigate(`/play/${streamId}`);
  };
  const playStream = async (streamId: number) => {
    const url = await ApiService.getStreamUrl(server, streamId);
    if (url) {
      const query = `play/${encodeURIComponent(url)}`;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROXY_URL}/${query}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.status === 501) {
          toast(
            <>
              <div className="font-bold text-gray-800">
                🚫 Unable to play stream!
              </div>
              <div className="text-gray-700 font-sm">
                Cannot find mpv installation.
              </div>
              <a
                className="font-bold text-indigo-600"
                href="https://github.com/fergalmoran/xtreamium/#installmpv"
                target="_blank"
                rel="noreferrer noopener"
              >
                See here
              </a>
            </>,
            {
              position: "top-right",
              closeOnClick: true,
            }
          );
        }
      } catch (e) {
        console.log(e);
        toast(
          <>
            <div className="font-bold text-gray-800">
              🚫 Unable to play stream!
            </div>
            <div className="text-gray-700 font-sm">
              Make sure you've installed the local server.
            </div>
            <a
              className="font-bold text-indigo-600"
              href="https://github.com/fergalmoran/xtreamium/#localserver"
              target="_blank"
              rel="noreferrer noopener"
            >
              Instructions here
            </a>
          </>,
          {
            position: "top-right",
          }
        );
      }
    }
  };
  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  if (channelQuery.isLoading) {
    return <Loading />;
  }
  if (!channelQuery.data) {
    return <div>No data</div>;
  }
  return (
    <div className="overflow-x-auto pt-4 px-2">
      <table className="table">
        <tbody>
          {channelQuery.data.map((stream: Stream) => [
            <React.Fragment key={stream.stream_id}>
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 mask mask-squircle">
                        <ImageWithFallback
                          className="hidden w-10 h-10 md:block"
                          src={stream.stream_icon}
                          alt="Stream icon"
                          fallback="/images/unknown-stream.svg"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{stream.name}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center space-x-1">
                    {import.meta.env.DEV && (
                      <Button
                        title="Cast stream to device"
                        aria-label="Edit"
                        onClick={() => playStream(stream.stream_id)}
                      >
                        <Icons.cast />
                      </Button>
                    )}
                    <Button
                      title="Play to xtreamium local proxy"
                      aria-label="Edit"
                      onClick={() => playStream(stream.stream_id)}
                    >
                      <Icons.airplay />
                    </Button>
                    {import.meta.env.DEV && (
                      <Button
                        title="Play stream in browser"
                        aria-label="Edit"
                        onClick={() => playStreamInternal(stream.stream_id)}
                      >
                        <Icons.play />
                      </Button>
                    )}
                    <Button
                      title="Copy stream URL"
                      aria-label="Edit"
                      onClick={() => copyStreamUrl(stream.stream_id)}
                    >
                      <Icons.copy />
                    </Button>
                  </div>
                </td>
              </tr>
              <tr key={`${stream.num}-epg`}>
                <Suspense
                  fallback={
                    <td colSpan={3}>
                      <div className="py-4 text-center">Loading EPG...</div>
                    </td>
                  }
                >
                  <EPGComponent
                    server={server}
                    channelId={stream.epg_channel_id}
                  />
                </Suspense>
              </tr>
            </React.Fragment>,
          ])}
        </tbody>
      </table>
    </div>
  );
};

export default ChannelPage;
