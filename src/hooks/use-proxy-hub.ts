import React from "react";

import {
  ProxyHubContext,
  type HubEventHandler,
} from "@/contexts/proxy-hub-context";

export const useProxyHub = () => React.useContext(ProxyHubContext);

/**
 * Subscribes to a hub event for the lifetime of the calling component.
 *
 * The handler is held in a ref so an inline arrow function doesn't tear down and rebuild
 * the subscription on every render.
 */
export const useProxyHubEvent = (
  event: string,
  handler: HubEventHandler
): void => {
  const { subscribe } = useProxyHub();
  const handlerRef = React.useRef(handler);

  React.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  React.useEffect(
    () => subscribe(event, (payload) => handlerRef.current(payload)),
    [subscribe, event]
  );
};
