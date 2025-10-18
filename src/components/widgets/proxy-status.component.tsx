import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { Icons } from "@/components/icons";
import * as signalR from "@microsoft/signalr";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { logger } from "@/lib/logger";
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
    })
    .configureLogging(signalR.LogLevel.None)
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(() => {
      setConnectionState(ConnectionState.Connected);
    })
    .catch(() => {
      setConnectionState(ConnectionState.Disconnected);
    });
  connection.onclose(() => {
    setConnectionState(ConnectionState.Disconnected);
  });
  connection.on("ServerMessage", (message) => {
    logger.debug("proxy-status.component", "ServerMessage", message);
  });
  return connection;
};

const ProxyStatus: React.FC = () => {
  const connectionRef = React.useRef<signalR.HubConnection | null>(null);

  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    ConnectionState.Checking
  );

  React.useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      logger.debug("proxy-status.component", "Proxy is connected");
      return;
    }
    connectionRef.current = _createConnection(setConnectionState);
    if (connectionState === ConnectionState.Disconnected) {
      connectionRef.current = _createConnection(setConnectionState);
      if (connectionState === ConnectionState.Disconnected) {
        setTimeout(() => {
          logger.debug("proxy-status.component", "Rechecking connection");
          setConnectionState(ConnectionState.Checking);
        }, 5000);
      }
    }
  }, [connectionState]);

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
