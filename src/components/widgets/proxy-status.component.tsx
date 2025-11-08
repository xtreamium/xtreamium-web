import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { Icons } from "@/components/icons";
import * as signalR from "@microsoft/signalr";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { logger } from "@/lib/logger";
import { ProxyService } from "@/services/proxy.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ConnectionState = "checking" | "connected" | "disconnected";
const ConnectionState = {
  Checking: "checking" as const,
  Connected: "connected" as const,
  Disconnected: "disconnected" as const,
} as const;

const _createConnection = (
  setConnectionState: Dispatch<SetStateAction<ConnectionState>>
): signalR.HubConnection => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_PROXY_URL}/hubs/proxyStatus`, {
      skipNegotiation: false,
      withCredentials: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
    })
    .configureLogging(signalR.LogLevel.None)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Limit automatic reconnection attempts to avoid infinite loops
        // After 3 attempts, let our manual reconnection take over for faster detection
        if (retryContext.previousRetryCount >= 3) {
          logger.debug("SignalR automatic reconnection limit reached, switching to manual", retryContext, "proxy-status.component");
          return null; // Stop automatic reconnection
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s, then 10s max
        const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
        logger.debug(`SignalR reconnecting in ${delay}ms (attempt ${retryContext.previousRetryCount + 1})`, retryContext, "proxy-status.component");
        return delay;
      },
    })
    .build();

  connection
    .start()
    .then(() => {
      logger.debug("Connection established successfully", undefined, "proxy-status.component");
      setConnectionState(ConnectionState.Connected);
    })
    .catch((error) => {
      logger.debug("Failed to start connection", error, "proxy-status.component");
      setConnectionState(ConnectionState.Disconnected);
    });

  connection.onclose((error) => {
    if (error) {
      logger.debug("Connection closed with error", error, "proxy-status.component");
    } else {
      logger.debug("Connection closed gracefully", undefined, "proxy-status.component");
    }
    // Always trigger manual reconnection when connection closes
    setConnectionState(ConnectionState.Disconnected);
  });

  connection.onreconnecting((error) => {
    logger.debug("Connection lost, attempting to reconnect", error, "proxy-status.component");
    setConnectionState(ConnectionState.Checking);
  });

  connection.onreconnected((connectionId) => {
    logger.debug("Reconnected successfully", { connectionId }, "proxy-status.component");
    setConnectionState(ConnectionState.Connected);
  });

  connection.on("ServerMessage", (message) => {
    logger.debug("ServerMessage received", message, "proxy-status.component");
  });

  return connection;
};

const ProxyStatus: React.FC = () => {
  const connectionRef = React.useRef<signalR.HubConnection | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const httpCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    ConnectionState.Checking
  );

  // HTTP-based fallback check for when SignalR isn't working
  const checkProxyAvailabilityViaHTTP = async (): Promise<boolean> => {
    try {
      const version = await ProxyService.getVersion();
      logger.debug("HTTP proxy check successful", { version }, "proxy-status.component");
      return version !== null;
    } catch (error) {
      logger.debug("HTTP proxy check failed", error, "proxy-status.component");
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
          logger.debug("Error stopping existing connection", error, "proxy-status.component");
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

      // Create new connection
      connectionRef.current = _createConnection(setConnectionState);
      
      // No need for health checks - SignalR's built-in connection management handles this
      logger.debug("Connection setup complete", undefined, "proxy-status.component");
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
        
        httpCheckTimeoutRef.current = setTimeout(() => {
          const performHttpCheck = async () => {
            const isAvailable = await checkProxyAvailabilityViaHTTP();
            if (isAvailable && connectionState === ConnectionState.Disconnected) {
              logger.debug("HTTP check detected proxy is back online, triggering SignalR reconnection", undefined, "proxy-status.component");
              setConnectionState(ConnectionState.Checking);
            } else if (connectionState === ConnectionState.Disconnected) {
              startHttpFallbackCheck(); // Continue checking
            }
          };
          void performHttpCheck();
        }, 1000);
      };
      
      // Use very short intervals for manual reconnection to detect when proxy comes back online faster
      reconnectTimeoutRef.current = setTimeout(() => {
        logger.debug("Manual reconnection attempt", undefined, "proxy-status.component");
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
  }, [connectionState]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch((error) => {
          logger.debug("Error stopping connection on cleanup", error, "proxy-status.component");
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

  const iconClass = React.useMemo(() => {
    return clsx(
      "w-4",
      "h-4",
      connectionState === ConnectionState.Checking
        ? "animate-spin text-orange-700"
        : connectionState === ConnectionState.Connected
        ? "text-green-600"
        : "text-red-600"
    );
  }, [connectionState]);

  const getTooltipText = () => {
    switch (connectionState) {
      case ConnectionState.Checking:
        return "Checking proxy connection...";
      case ConnectionState.Connected:
        return "Proxy is connected and ready";
      case ConnectionState.Disconnected:
        return "Proxy is disconnected";
      default:
        return "Unknown proxy status";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-8"
                title="Proxy Status"
              >
                {connectionState === ConnectionState.Checking ? (
                  <Icons.loader
                    className={clsx(iconClass, "animate-spin text-orange-700")}
                  />
                ) : (
                  <Icons.proxy className={iconClass} />
                )}
                <Icons.chevronDown className="hidden w-4 h-4 fill-current opacity-60 sm:inline-block" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link to="/proxy/settings" className="flex items-center gap-2">
                <Icons.server className="w-4 h-4" />
                Proxy Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom" className="text-sm">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProxyStatus;
