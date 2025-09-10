import { Suspense } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageWithFallback from "@/components/widgets/image-with-fallback";
import EPGComponent from "@/components/epg/epg.component";
import { ProxyService } from "@/services/proxy.service";

const ChannelPage = () => {
  const { selectedServer } = useServerStore();
  const navigate = useNavigate();
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  const params = useParams();
  const server = userQuery.data?.servers.find((s) => s.id === selectedServer);

  const channelQuery = useQuery({
    queryKey: [`channels_${params.channelId}`],
    queryFn: () => {
      if (!server) {
        throw new Error("No server selected");
      }
      return ApiService.getChannels(server, params.channelId as string);
    },
    enabled: !!server,
  });

  const copyStreamUrl = async (streamId: number) => {
    if (!server) {
      return;
    }
    try {
      const url = await ApiService.getStreamUrl(server, streamId);
      logger.info("channel.page", "copyStreamUrl", url);
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          toast.success(
            <>
              <div className="font-bold text-foreground">
                🙌 URL copied to clipboard
              </div>
            </>,
            {
              position: "top-right",
            }
          );
        });
      }
    } catch (err) {
      logger.error("channel.page", "copyStreamUrl", String(err));
      toast.error(
        <>
          <div className="font-bold text-foreground">🤦 Failed to copy URL</div>
        </>,
        {
          position: "top-right",
        }
      );
    }
  };

  const playStreamInternal = async (streamId: number) => {
    navigate(`/play/${streamId}`);
  };

  const playStream = async (streamId: number) => {
    if (!server) {
      return;
    }
    const url = await ApiService.getStreamUrl(server, streamId);
    if (url) {
      try {
        const response = await ProxyService.play(url);
        if (!response) {
          toast(
            <>
              <div className="font-bold text-foreground">
                🚫 Unable to play stream!
              </div>
              <div className="text-muted-foreground font-sm">
                Cannot find mpv installation.
              </div>
              <a
                className="font-bold text-primary"
                href="https://github.com/fergalmoran/xtreamium/#installmpv"
                target="_blank"
                rel="noreferrer noopener"
              >
                See here
              </a>
            </>,
            {
              position: "top-right",
            }
          );
        }
      } catch (e) {
        logger.error("channel.page", "playStream", String(e));
        toast(
          <div>
            <div>🚫 Unable to play stream!</div>
            <div>
              <a
                href="https://github.com/xtreamium/xtreamium-proxy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Make sure you've installed the local server.
              </a>
            </div>
          </div>
        );
      }
    }
  };

  if (!server) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No Server Selected
              </h3>
              <p className="text-muted-foreground mt-2">
                Please select a server to view channels.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (channelQuery.isLoading) {
    return <Loading />;
  }

  if (!channelQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Icons.info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No Data Available
              </h3>
              <p className="text-muted-foreground mt-2">
                Unable to load channel information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-4">
        {channelQuery.data.map((stream: Stream) => (
          <Card key={stream.stream_id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border">
                    <ImageWithFallback
                      className="w-full h-full object-cover"
                      src={stream.stream_icon}
                      alt={`${stream.name} icon`}
                      fallback="/images/unknown-stream.svg"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg truncate">
                    {stream.name}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    Stream ID: {stream.stream_id}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {import.meta.env.DEV && (
                    <Button
                      size="sm"
                      variant="outline"
                      title="Cast stream to device"
                      onClick={() => playStream(stream.stream_id)}
                      className="gap-2"
                    >
                      <Icons.cast className="h-4 w-4" />
                      Cast
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="default"
                    title="Play to xtreamium local proxy"
                    onClick={() => playStream(stream.stream_id)}
                    className="gap-2"
                  >
                    <Icons.airplay className="h-4 w-4" />
                    Play
                  </Button>
                  {import.meta.env.DEV && (
                    <Button
                      size="sm"
                      variant="secondary"
                      title="Play stream in browser"
                      onClick={() => playStreamInternal(stream.stream_id)}
                      className="gap-2"
                    >
                      <Icons.play className="h-4 w-4" />
                      Browser
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    title="Copy stream URL"
                    onClick={() => copyStreamUrl(stream.stream_id)}
                    className="gap-2"
                  >
                    <Icons.copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense
                fallback={
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading EPG...
                    </div>
                  </div>
                }
              >
                <EPGComponent
                  server={server}
                  channelId={stream.epg_channel_id}
                />
              </Suspense>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChannelPage;
