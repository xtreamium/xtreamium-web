import VideoPlayer from "@/components/video/video-player.component";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import { getProxyBaseUrl } from "@/services/proxy.service";
import useServerStore from "@/services/state/server.state";

const PlayPage: React.FC = () => {
  const params = useParams<{ streamId: string }>();
  const { selectedServer } = useServerStore();

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  const server = userQuery.data?.servers.find((s) => s.id === selectedServer);

  const proxiedUrl = React.useMemo(() => {
    if (!server || !params.streamId) {
      return null;
    }
    const upstream = ApiService.getStreamUrl(server, Number(params.streamId));
    return `${getProxyBaseUrl()}/stream?url=${encodeURIComponent(upstream)}`;
  }, [server, params.streamId]);

  return (
    <div className="container grid px-6 mx-auto">
      <div className="mb-10">Play: {params.streamId}</div>
      <AspectRatio ratio={16 / 9} className="bg-black">
        {proxiedUrl ? (
          <VideoPlayer videoSourceUrl={proxiedUrl} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No server selected.
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default PlayPage;
