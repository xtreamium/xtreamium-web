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

  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  if (channelQuery.isLoading) {
    return <Loading />;
  }
  if (!channelQuery.data) {
    return <div>No data</div>;
  }
  return <div>Channnel: {JSON.stringify(params)}</div>;
};

export default ChannelPage;
