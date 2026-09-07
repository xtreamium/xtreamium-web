import type React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Header from "@/components/navigation/app-header";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import useServerStore from "@/services/state/server.state";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { TOKEN_KEY } from "@/constants/storage";
import RecordingNotificationsWatcher from "@/components/notifications/recording-notifications-watcher";
import ProxyHubProvider from "@/contexts/proxy-hub-context";

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

  // The hub provider wraps only this branch on purpose: it runs a 1s reconnect loop and a 1s
  // HTTP fallback probe, which have no business running on the login page. This keeps the
  // connection's lifetime exactly what it was when ProxyStatus owned it.
  return (
    <ProxyHubProvider>
      <SidebarProvider>
        <Toaster position="top-center" closeButton={true} />
        <RecordingNotificationsWatcher />
        <div className="min-h-screen bg-background flex flex-col w-full">
          <Header user={query.data} />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar user={query.data} />
            <main className="flex-1 overflow-auto flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProxyHubProvider>
  );
}
