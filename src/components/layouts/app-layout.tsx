import type React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Header from "@/components/navigation/app-header";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import useServerStore from "@/services/state/server.state";
import { Toaster } from "sonner";
import Loading from "@/components/loading";

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
      query.data &&
      (!query.data.servers || query.data.servers.length === 0) &&
      !isOnServerRoute
    ) {
      navigate("/server/add");
    }
  }, [query.data, navigate, isOnServerRoute]);

  if (query.isLoading) {
    return <Loading>Loading query</Loading>;
  }

  if (!query.data) {
    // If we're not on an auth page, navigate to login
    if (!location.pathname.startsWith("/auth/")) {
      navigate("/auth/login");
      return <Loading>Redirecting to login...</Loading>;
    }
    // If we're already on an auth page, render it without layout
    return (
      <div className="min-h-screen bg-background flex flex-col w-full">
        <Toaster position="top-center" closeButton={true} />
        {children}
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
    return <Loading>Redirecting to add server...</Loading>;
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
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
