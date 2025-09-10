import React, { Dispatch, SetStateAction } from "react";
import { Icons } from "@/components/icons";
import * as signalR from "@microsoft/signalr";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { logger } from "@/lib/logger";

type ConnectionState = 'checking' | 'connected' | 'disconnected';
const ConnectionState = {
  Checking: 'checking' as const,
  Connected: 'connected' as const,
  Disconnected: 'disconnected' as const,
} as const;

const _createConnection = (
  setConnectionState: Dispatch<SetStateAction<ConnectionState>>
): signalR.HubConnection => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_PROXY_URL}/hubs/proxyStatus`)
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection
    .start()
    .then(() => {
      setConnectionState(ConnectionState.Connected);
    })
    .catch((err) => {
      console.error("proxy-status.component", "CreatingConnection", err);
      setConnectionState(ConnectionState.Disconnected);
      throw new Error("Failed to connect to the server");
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
  let connection;

  const [iconClass, setIconClass] = React.useState("w-6 h-6 text-red-600");
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    ConnectionState.Checking
  );

  React.useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      logger.debug("proxy-status.component", "Proxy is connected");
      return;
    }
    connection = _createConnection(setConnectionState);
    if (connectionState === ConnectionState.Disconnected) {
      connection = _createConnection(setConnectionState);
      if (connectionState === ConnectionState.Disconnected) {
        setTimeout(() => {
          logger.debug("proxy-status.component", "Rechecking connection");
          setConnectionState(ConnectionState.Checking);
        }, 5000);
      }
    }
  }, [connectionState]);

  React.useEffect(() => {
    setIconClass(
      clsx(
        "w-6",
        "h-6",
        connectionState === ConnectionState.Checking
          ? "animate-spin text-orange-700"
          : connectionState === ConnectionState.Connected
          ? "text-green-600"
          : "text-red-600"
      )
    );
    logger.debug("proxy-status.component", "Icon class is", iconClass);
  }, [connectionState]);

  return (
    <div title="Proxy Status" className="dropdown dropdown-end ">
      <div
        tabIndex={0}
        onClick={() => {
          // if (document.activeElement instanceof HTMLElement) {
          //   document.activeElement.blur();
          // } else {
          // }
        }}
        className="gap-1 normal-case btn btn-ghost"
      >
        {connectionState === ConnectionState.Checking ? (
          <Icons.loader
            className={clsx(iconClass, "animate-spin text-orange-700")}
          />
        ) : (
          <Icons.proxy className={iconClass} />
        )}
        <Icons.chevronDown className="hidden w-5 h-5 fill-current opacity-60 sm:inline-block" />
      </div>
      <ul
        tabIndex={0}
        className="z-50 p-2 mt-4 shadow-sm dropdown-content menu bg-base-100 rounded-box w-52"
        role="menu"
      >
        <li>
          <Link to="/proxy/settings">
            <Icons.server className="w-4 h-4" />
            Proxy Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProxyStatus;
