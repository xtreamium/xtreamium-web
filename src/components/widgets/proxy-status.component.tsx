import React from "react";
import { Icons } from "@/components/icons";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProxyService } from "@/services/proxy.service";
import { ApiService } from "@/services";
import { Button } from "@/components/ui/button";
import { ConnectionState } from "@/contexts/proxy-hub-context";
import { useProxyHub } from "@/hooks/use-proxy-hub";
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

const ProxyStatus: React.FC = () => {
  // The connection itself lives in ProxyHubProvider - it is shared with the recording
  // watchers, and it outlives this widget.
  const { connectionState } = useProxyHub();

  const versionsQuery = useQuery({
    queryKey: ["proxy-version-check"],
    queryFn: async () => {
      const [current, latest] = await Promise.all([
        ProxyService.getVersion(),
        ApiService.getLatestProxyVersion(),
      ]);
      return { current, latest };
    },
    enabled: connectionState === ConnectionState.Connected,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isOutdated =
    !!versionsQuery.data?.current &&
    !!versionsQuery.data?.latest &&
    versionsQuery.data.current !== versionsQuery.data.latest;

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
                <span className="relative inline-flex p-0.5">
                  {connectionState === ConnectionState.Checking ? (
                    <Icons.loader
                      className={clsx(
                        iconClass,
                        "animate-spin text-orange-700"
                      )}
                    />
                  ) : (
                    <Icons.proxy className={iconClass} />
                  )}
                  {isOutdated && (
                    <span className="absolute -top-1 -right-2 inline-flex h-3 w-3 items-center justify-center rounded-full bg-destructive/80 text-[8px] font-bold leading-none text-destructive-foreground ring-1 ring-background">
                      !
                    </span>
                  )}
                </span>
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
            <DropdownMenuItem asChild>
              <Link to="/logs" className="flex items-center gap-2">
                <Icons.info className="w-4 h-4" />
                Proxy Logs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom" className="text-sm">
          {isOutdated ? (
            <div className="space-y-1">
              <p className="font-semibold">Proxy is outdated</p>
              <p>
                Current: {versionsQuery.data?.current} · Latest:{" "}
                {versionsQuery.data?.latest}
              </p>
              <a
                href="https://github.com/xtreamium/xtreamium-proxy/releases"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Download from GitHub releases
              </a>
            </div>
          ) : (
            getTooltipText()
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProxyStatus;
