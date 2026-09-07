import React from "react";
import type { Dispatch, SetStateAction } from "react";
import * as signalR from "@microsoft/signalr";

import { logger } from "@/lib/logger";
import { ProxyService, getProxyBaseUrl } from "@/services/proxy.service";

export type ConnectionState = "checking" | "connected" | "disconnected";
export const ConnectionState = {
  Checking: "checking" as const,
  Connected: "connected" as const,
  Disconnected: "disconnected" as const,
} as const;

export type HubEventHandler = (payload: unknown) => void;

/**
 * Every event the app listens for. Dispatchers are attached per connection, so this list is
 * what gets re-wired after a reconnect - a name missing here is a handler that works until
 * the first reconnect and then silently never fires again.
 */
const HUB_EVENTS = [
  "ServerMessage",
  "RecordingChanged",
  "RecordingProgress",
] as const;

type ProxyHubContextValue = {
  connectionState: ConnectionState;
  /**
   * Subscribe to a hub event; returns an unsubscribe. Handlers survive reconnects - the
   * connection object is rebuilt on every reconnect, so subscribers must never hold one.
   */
  subscribe: (event: string, handler: HubEventHandler) => () => void;
};

const ProxyHubContext = React.createContext<ProxyHubContextValue>({
  connectionState: ConnectionState.Checking,
  subscribe: () => () => {},
});

const _createConnection = (
  setConnectionState: Dispatch<SetStateAction<ConnectionState>>,
  isActive: () => boolean,
  dispatch: (event: string, payload: unknown) => void
): signalR.HubConnection => {
  const guarded = (next: ConnectionState) => {
    if (isActive()) {
      setConnectionState(next);
    }
  };
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${getProxyBaseUrl()}/hubs/proxyStatus`, {
      skipNegotiation: false,
      withCredentials: false,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.ServerSentEvents |
        signalR.HttpTransportType.LongPolling,
    })
    .configureLogging(signalR.LogLevel.None)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Limit automatic reconnection attempts to avoid infinite loops
        // After 3 attempts, let our manual reconnection take over for faster detection
        if (retryContext.previousRetryCount >= 3) {
          logger.debug(
            "SignalR automatic reconnection limit reached, switching to manual",
            retryContext,
            "proxy-hub-context"
          );
          return null; // Stop automatic reconnection
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, then 10s max
        const delay = Math.min(
          1000 * Math.pow(2, retryContext.previousRetryCount),
          10000
        );
        logger.debug(
          `SignalR reconnecting in ${delay}ms (attempt ${
            retryContext.previousRetryCount + 1
          })`,
          retryContext,
          "proxy-hub-context"
        );
        return delay;
      },
    })
    .build();

  connection
    .start()
    .then(() => {
      logger.debug(
        "Connection established successfully",
        undefined,
        "proxy-hub-context"
      );
      guarded(ConnectionState.Connected);
    })
    .catch((error) => {
      logger.debug("Failed to start connection", error, "proxy-hub-context");
      guarded(ConnectionState.Disconnected);
    });

  connection.onclose((error) => {
    if (error) {
      logger.debug("Connection closed with error", error, "proxy-hub-context");
    } else {
      logger.debug(
        "Connection closed gracefully",
        undefined,
        "proxy-hub-context"
      );
    }
    // Always trigger manual reconnection when connection closes
    guarded(ConnectionState.Disconnected);
  });

  connection.onreconnecting((error) => {
    logger.debug(
      "Connection lost, attempting to reconnect",
      error,
      "proxy-hub-context"
    );
    guarded(ConnectionState.Checking);
  });

  connection.onreconnected((connectionId) => {
    logger.debug(
      "Reconnected successfully",
      { connectionId },
      "proxy-hub-context"
    );
    guarded(ConnectionState.Connected);
  });

  for (const event of HUB_EVENTS) {
    connection.on(event, (payload: unknown) => dispatch(event, payload));
  }

  return connection;
};

type ProxyHubProviderProps = {
  children: React.ReactNode;
};

/**
 * Owns the single SignalR connection to the local proxy.
 *
 * Mount this around the signed-in app only - it runs a 1s manual reconnect loop and a 1s
 * HTTP fallback probe, neither of which has any business running on the login page.
 */
const ProxyHubProvider: React.FC<ProxyHubProviderProps> = ({ children }) => {
  const connectionRef = React.useRef<signalR.HubConnection | null>(null);
  const reconnectTimeoutRef = React.useRef<number | null>(null);
  const httpCheckTimeoutRef = React.useRef<number | null>(null);
  const activeTokenRef = React.useRef<symbol | null>(null);

  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    ConnectionState.Checking
  );

  const handlersRef = React.useRef(new Map<string, Set<HubEventHandler>>());

  const dispatch = React.useCallback((event: string, payload: unknown) => {
    handlersRef.current.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        // One bad subscriber must not stop the others, or take the connection down with it.
        logger.debug("Hub handler threw", error, "proxy-hub-context");
      }
    });
  }, []);

  const subscribe = React.useCallback(
    (event: string, handler: HubEventHandler) => {
      const handlers = handlersRef.current.get(event) ?? new Set();
      handlersRef.current.set(event, handlers);
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
    []
  );

  // HTTP-based fallback check for when SignalR isn't working
  const checkProxyAvailabilityViaHTTP = async (): Promise<boolean> => {
    try {
      const version = await ProxyService.getVersion();
      logger.debug(
        "HTTP proxy check successful",
        { version },
        "proxy-hub-context"
      );
      return version !== null;
    } catch (error) {
      logger.debug("HTTP proxy check failed", error, "proxy-hub-context");
      return false;
    }
  };

  React.useEffect(() => {
    const createAndStartConnection = async () => {
      // Clean up existing connection
      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
        } catch (error) {
          logger.debug(
            "Error stopping existing connection",
            error,
            "proxy-hub-context"
          );
        }
        connectionRef.current = null;
      }

      // Clear any existing timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (httpCheckTimeoutRef.current) {
        clearTimeout(httpCheckTimeoutRef.current);
        httpCheckTimeoutRef.current = null;
      }

      // Create new connection. Tag it with a token so its handlers can no-op
      // if a newer connection has since taken over (prevents a stale onclose
      // from a stopped connection clobbering the live one's state).
      const token = Symbol("proxy-conn");
      activeTokenRef.current = token;
      connectionRef.current = _createConnection(
        setConnectionState,
        () => activeTokenRef.current === token,
        dispatch
      );

      // No need for health checks - SignalR's built-in connection management handles this
      logger.debug("Connection setup complete", undefined, "proxy-hub-context");
    };

    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Start HTTP-based checks as fallback
      const startHttpFallbackCheck = () => {
        if (httpCheckTimeoutRef.current) {
          clearTimeout(httpCheckTimeoutRef.current);
        }

        httpCheckTimeoutRef.current = window.setTimeout(() => {
          const performHttpCheck = async () => {
            const isAvailable = await checkProxyAvailabilityViaHTTP();
            if (
              isAvailable &&
              connectionState === ConnectionState.Disconnected
            ) {
              logger.debug(
                "HTTP check detected proxy is back online, triggering SignalR reconnection",
                undefined,
                "proxy-hub-context"
              );
              setConnectionState(ConnectionState.Checking);
            } else if (connectionState === ConnectionState.Disconnected) {
              startHttpFallbackCheck(); // Continue checking
            }
          };
          void performHttpCheck();
        }, 1000);
      };

      // Use very short intervals for manual reconnection to detect when proxy comes back online faster
      reconnectTimeoutRef.current = window.setTimeout(() => {
        logger.debug(
          "Manual reconnection attempt",
          undefined,
          "proxy-hub-context"
        );
        setConnectionState(ConnectionState.Checking);
      }, 1000); // Reduced to 1 second for fastest detection

      // Also start HTTP fallback checks
      startHttpFallbackCheck();
    };

    if (connectionState === ConnectionState.Checking) {
      void createAndStartConnection();
    } else if (connectionState === ConnectionState.Disconnected) {
      scheduleReconnect();
    }

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (httpCheckTimeoutRef.current) {
        clearTimeout(httpCheckTimeoutRef.current);
        httpCheckTimeoutRef.current = null;
      }
    };
  }, [connectionState, dispatch]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch((error) => {
          logger.debug(
            "Error stopping connection on cleanup",
            error,
            "proxy-hub-context"
          );
        });
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (httpCheckTimeoutRef.current) {
        clearTimeout(httpCheckTimeoutRef.current);
      }
    };
  }, []);

  const value = React.useMemo(
    () => ({ connectionState, subscribe }),
    [connectionState, subscribe]
  );

  return (
    <ProxyHubContext.Provider value={value}>{children}</ProxyHubContext.Provider>
  );
};

export default ProxyHubProvider;
export { ProxyHubContext };
