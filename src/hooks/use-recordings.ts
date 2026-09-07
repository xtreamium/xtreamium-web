import { useQuery } from "@tanstack/react-query";

import { ConnectionState } from "@/contexts/proxy-hub-context";
import { useProxyHub } from "@/hooks/use-proxy-hub";
import { ProxyService } from "@/services/proxy.service";

/**
 * Reconcile interval, not a latency budget. The push channel carries latency; this only has to
 * catch what push structurally cannot - transitions raised while we were disconnected, and the
 * startup reconciliation that runs before any client can possibly be connected.
 */
const RECONCILE_INTERVAL_MS = 60000;

/**
 * The one owner of the ["recordings"] query. Everything that needs recordings - the notification
 * watcher, the header indicator, the recordings page - goes through here, so there is a single
 * poll interval rather than whichever observer happens to have set the shortest one.
 */
export const useRecordings = () => {
  const { connectionState } = useProxyHub();
  const isProxyConnected = connectionState === ConnectionState.Connected;

  const query = useQuery({
    queryKey: ["recordings"],
    queryFn: () => ProxyService.getRecordings(),
    refetchInterval: RECONCILE_INTERVAL_MS,
    // Polling normally stops once the tab is hidden, which is precisely when a desktop
    // notification is worth having - so keep it running in the background.
    refetchIntervalInBackground: true,
    // No point hammering a proxy that isn't there; reconnecting invalidates anyway.
    enabled: isProxyConnected,
    retry: false,
  });

  return { ...query, isProxyConnected };
};
