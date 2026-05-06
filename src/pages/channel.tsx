import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ApiService } from "@/services";
import { Icons } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";
import useServerStore from "@/services/state/server.state";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { env } from "@/env";
import type { Stream } from "@/models/stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ImageWithFallback from "@/components/widgets/image-with-fallback";
import EPGComponent from "@/components/epg/epg.component";
import { ProxyService } from "@/services/proxy.service";
import CopyButton from "@/components/widgets/copy-button";
import { CustomRecordingModal } from "@/components/recording/custom-recording-modal";

const CHANNELS_PER_PAGE = 50;

const ChannelPage = () => {
  const { selectedServer } = useServerStore();
  const navigate = useNavigate();
  const [streamUrls, setStreamUrls] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(CHANNELS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [selectedStreamForRecording, setSelectedStreamForRecording] = useState<Stream | null>(null);
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusStreamId = searchParams.get("focus");
  const server = userQuery.data?.servers.find((s) => s.id === selectedServer);

  const channelQuery = useQuery({
    queryKey: [`channels_${params.channelId}`],
    queryFn: () => {
      if (!server) {
        throw new Error("No server selected");
      }
      return ApiService.getChannels(server, params.channelId);
    },
    enabled: !!server,
  });

  // Filter channels based on search term
  const allFilteredChannels = useMemo(() => {
    if (!channelQuery.data) return [];
    if (!searchTerm.trim()) return channelQuery.data;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return channelQuery.data.filter((stream: Stream) =>
      stream.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [channelQuery.data, searchTerm]);

  // Visible channels (for infinite scroll)
  const visibleChannels = useMemo(() => {
    return allFilteredChannels.slice(0, visibleCount);
  }, [allFilteredChannels, visibleCount]);

  // Batch fetch EPG data only for visible channels (infinite scroll optimization)
  const epgBatchQuery = useQuery({
    queryKey: [`epg_batch_${params.channelId}_${visibleCount}_${searchTerm}`],
    queryFn: () => {
      if (!server || !visibleChannels.length) {
        throw new Error("No server or channels available");
      }
      const channelIds = visibleChannels
        .map((s) => s.epg_channel_id)
        .filter((id) => id); // Filter out empty/null channel IDs
      return ApiService.getEPGForChannelsBatch(server, channelIds);
    },
    enabled: !!server && visibleChannels.length > 0,
  });

  // Generate stream URLs only for visible channels (performance optimization)
  useEffect(() => {
    if (server && visibleChannels.length > 0) {
      setStreamUrls((prev) => {
        const urls = { ...prev };
        for (const stream of visibleChannels) {
          // Only generate URL if not already cached
          if (!urls[stream.stream_id]) {
            urls[stream.stream_id] = ApiService.getStreamUrl(server, stream.stream_id);
          }
        }
        return urls;
      });
    }
  }, [server, visibleChannels]);

  const hasMore = visibleCount < allFilteredChannels.length;

  // Reset visible count when search term or category changes
  useEffect(() => {
    setVisibleCount(CHANNELS_PER_PAGE);
  }, [searchTerm, params.channelId]);

  // If we landed here with ?focus=<stream_id>, ensure the channel is rendered
  // and scroll its card into view, then drop the param. Jump instantly rather
  // than smooth-scroll: cards above can grow as their EPG data settles, which
  // disrupts a smooth scroll mid-flight.
  useEffect(() => {
    if (!focusStreamId || !allFilteredChannels.length) {
      return;
    }
    const targetId = Number(focusStreamId);
    const index = allFilteredChannels.findIndex(
      (s) => s.stream_id === targetId
    );
    if (index === -1) {
      return;
    }
    if (index >= visibleCount) {
      setVisibleCount(
        Math.ceil((index + 1) / CHANNELS_PER_PAGE) * CHANNELS_PER_PAGE
      );
      return;
    }
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(`stream-${targetId}`);
      if (!el) {
        requestAnimationFrame(tryScroll);
        return;
      }
      el.scrollIntoView({ behavior: "instant", block: "start" });
      // Re-anchor once layout has likely settled (EPG batch query resolved).
      const reanchor = window.setTimeout(() => {
        if (cancelled) return;
        const target = document.getElementById(`stream-${targetId}`);
        target?.scrollIntoView({ behavior: "instant", block: "start" });
      }, 600);
      setSearchParams({}, { replace: true });
      return () => window.clearTimeout(reanchor);
    };
    requestAnimationFrame(tryScroll);
    return () => {
      cancelled = true;
    };
  }, [focusStreamId, allFilteredChannels, visibleCount, setSearchParams]);

  // Intersection observer for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + CHANNELS_PER_PAGE);
    }
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore]);

  const copyStreamUrl = async (streamId: number) => {
    if (!server) {
      return;
    }
    try {
      // Get URL from cache (already generated) or generate it
      const url = streamUrls[streamId] || ApiService.getStreamUrl(server, streamId);

      logger.info("channel.page", "copyStreamUrl", url);
      await navigator.clipboard.writeText(url).then(() => {
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
    await navigate(`/play/${streamId}`);
  };

  const playStream = async (streamId: number) => {
    if (!server) {
      return;
    }
    const url = streamUrls[streamId] || ApiService.getStreamUrl(server, streamId);
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
                Cannot find media player installation.
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

  const openCustomRecordingModal = (stream: Stream) => {
    setSelectedStreamForRecording(stream);
    setRecordingModalOpen(true);
  };

  const handleCustomRecording = async (
    startDate: Date,
    startTime: string,
    endDate: Date,
    endTime: string
  ) => {
    if (!server || !selectedStreamForRecording) {
      return;
    }

    try {
      // Combine date and time into full DateTime strings
      const [startHour, startMinute] = startTime.split(':');
      const startDateTime = new Date(startDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const [endHour, endMinute] = endTime.split(':');
      const endDateTime = new Date(endDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const url = streamUrls[selectedStreamForRecording.stream_id] ||
        ApiService.getStreamUrl(server, selectedStreamForRecording.stream_id);

      await ProxyService.recordShow(
        selectedStreamForRecording.name,
        url,
        startDateTime.getTime(),
        endDateTime.getTime()
      );

      toast.success(
        <>
          <div className="font-bold text-foreground">
            Recording Scheduled
          </div>
          <div className="text-muted-foreground text-sm">
            {selectedStreamForRecording.name} will be recorded from{' '}
            {startDateTime.toLocaleString()} to {endDateTime.toLocaleString()}
          </div>
        </>,
        {
          position: "top-right",
        }
      );
    } catch (err) {
      logger.error("channel.page", "handleCustomRecording", String(err));
      toast.error(
        <>
          <div className="font-bold text-foreground">Failed to schedule recording</div>
        </>,
        {
          position: "top-right",
        }
      );
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="text-center space-y-4">
              <Icons.loader className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Loading Channels
                </h3>
                <p className="text-muted-foreground mt-2 text-sm px-4">
                  Please wait while we fetch channel information...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    channelQuery.isError ||
    !channelQuery.data ||
    channelQuery.data.length === 0
  ) {
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
                {channelQuery.isError
                  ? "Failed to load channel information."
                  : "No channels found for this category."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Search Box */}
      <div className="relative">
        <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        {searchTerm && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSearchTerm("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            title="Clear search"
          >
            <Icons.delete className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Channel List */}
      <div className="space-y-3">
        {allFilteredChannels.length === 0 && searchTerm ? (
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <Icons.search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  No channels found
                </h3>
                <p className="text-muted-foreground mt-2">
                  No channels match your search "{searchTerm}"
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {visibleChannels.map((stream: Stream) => (
          <Card
            key={stream.stream_id}
            id={`stream-${stream.stream_id}`}
            className="overflow-hidden"
          >
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border">
                    <ImageWithFallback
                      className="w-full h-full object-cover"
                      src={stream.stream_icon}
                      alt={`${stream.name} - ${stream.stream_icon} icon`}
                      fallback="/images/unknown-stream.svg"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-base truncate">
                    {stream.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {env.VITE_ENABLE_DEV_ICONS &&  (
                    <Button
                      size="sm"
                      variant="outline"
                      title="Cast stream to device"
                      onClick={() => void playStream(stream.stream_id)}
                      className="gap-1.5 h-8 px-2 text-xs"
                    >
                      <Icons.cast className="h-3.5 w-3.5" />
                      Cast
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="default"
                    title="Play to xtreamium local proxy"
                    onClick={() => void playStream(stream.stream_id)}
                    className="gap-1.5 h-8 px-2 text-xs"
                  >
                    <Icons.airplay className="h-3.5 w-3.5" />
                    Play
                  </Button>
                  {env.VITE_ENABLE_DEV_ICONS && (
                    <Button
                      size="sm"
                      variant="secondary"
                      title="Play stream in browser"
                      onClick={() => void playStreamInternal(stream.stream_id)}
                      className="gap-1.5 h-8 px-2 text-xs"
                    >
                      <Icons.play className="h-3.5 w-3.5" />
                      Browser
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    title="Schedule custom recording"
                    onClick={() => openCustomRecordingModal(stream)}
                    className="gap-1.5 h-8 px-2 text-xs"
                  >
                    <Icons.calendar className="h-3.5 w-3.5" />
                    Custom Recording
                  </Button>

                  {streamUrls[stream.stream_id] ? (
                    <CopyButton
                      textToCopy={streamUrls[stream.stream_id]}
                      showText={true}
                      variant="outline"
                      title="Copy stream URL"
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      title="Copy stream URL"
                      onClick={() => void copyStreamUrl(stream.stream_id)}
                      className="gap-1.5 h-8 px-2 text-xs"
                    >
                      <Icons.copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Suspense
                fallback={
                  <div className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Loading EPG...
                    </div>
                  </div>
                }
              >
                <EPGComponent
                  server={server}
                  channelId={stream.epg_channel_id}
                  streamId={stream.stream_id}
                  epgData={epgBatchQuery.data?.[stream.epg_channel_id]}
                  streamUrl={streamUrls[stream.stream_id]}
                />
              </Suspense>
            </CardContent>
          </Card>
            ))}

            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-sm">
                      Loading more channels... ({visibleCount} / {allFilteredChannels.length})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* All channels loaded message */}
            {!hasMore && visibleChannels.length > 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  All {allFilteredChannels.length} channels loaded
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Recording Modal */}
      <CustomRecordingModal
        open={recordingModalOpen}
        onOpenChange={setRecordingModalOpen}
        onConfirm={handleCustomRecording}
        streamName={selectedStreamForRecording?.name}
      />
    </div>
  );
};

export default ChannelPage;
