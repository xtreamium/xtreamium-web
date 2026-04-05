import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Header from "@/components/navigation/app-header";
import { useQuery } from "@tanstack/react-query";
import { ApiService, ProxyService } from "@/services";
import useServerStore from "@/services/state/server.state";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { TOKEN_KEY } from "@/constants/storage";
import { ProxyOutdated } from "@/components/widgets/proxy-outdated";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
    retry: false,
  });
  const { selectedServer, setSelectedServer } = useServerStore();
  const [showProxyOutdated, setShowProxyOutdated] = useState(false);
  const [proxyVersions, setProxyVersions] = useState<{
    current: string;
    latest: string;
  } | null>(null);

  // Don't redirect if we're already on server management pages
  const isOnServerRoute =
    location.pathname.startsWith("/server/") ||
    location.pathname.startsWith("/auth/");

  useEffect(() => {
    if (
      !query.isLoading &&
      !query.data &&
      !location.pathname.startsWith("/auth/")
    ) {
      localStorage.removeItem(TOKEN_KEY);
      void navigate("/auth/login", { replace: true });
    }
  }, [query.isLoading, query.data, location.pathname, navigate]);

  useEffect(() => {
    if (
      query.data &&
      (!query.data.servers || query.data.servers.length === 0) &&
      !isOnServerRoute
    ) {
      void navigate("/server/add");
    }
  }, [query.data, navigate, isOnServerRoute]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const checkProxyVersion = async () => {
      try {
        const [currentVersion, latestVersion] = await Promise.all([
          ProxyService.getVersion(),
          ApiService.getLatestProxyVersion(),
        ]);

        if (
          currentVersion &&
          latestVersion &&
          currentVersion !== latestVersion
        ) {
          setProxyVersions({
            current: currentVersion,
            latest: latestVersion,
          });
          setShowProxyOutdated(true);
        }
      } catch {
        // Silently fail version check
      }
    };

    void checkProxyVersion();
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Spinner />
        <span>Loading query</span>
      </div>
    );
  }

  if (!query.data) {
    if (location.pathname.startsWith("/auth/")) {
      return (
        <div className="min-h-screen bg-background flex flex-col w-full">
          <Toaster position="top-center" closeButton={true} />
          {children}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 p-4">
        <Spinner />
        <span>Redirecting to login...</span>
      </div>
    );
  }

  if (!query.data.servers || query.data.servers.length === 0) {
    // If we're on a server route, allow it to render (don't show loading)
    if (isOnServerRoute) {
      return (
        <div className="min-h-screen bg-background flex flex-col w-full">
          <Toaster position="top-center" closeButton={true} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      );
    }
    return <div className="flex items-center gap-2 p-4">
      <Spinner />
      <span>Redirecting to add server...</span>
    </div>;
  }

  if (!selectedServer && query.data.servers) {
    setSelectedServer(query.data.servers[0].id.toString());
  }

  return (
    <SidebarProvider>
      <Toaster position="top-center" closeButton={true} />
      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header user={query.data} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar user={query.data} />
          <main className="flex-1 overflow-auto flex flex-col">
            {showProxyOutdated && proxyVersions && (
              <ProxyOutdated
                currentVersion={proxyVersions.current}
                latestVersion={proxyVersions.latest}
                onDismiss={() => setShowProxyOutdated(false)}
              />
            )}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
