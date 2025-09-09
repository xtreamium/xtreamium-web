import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/navigation/app-sidebar";
import Header from "@/components/navigation/app-header";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import LoginPage from "@/pages/auth/login-page";
import useServerStore from "@/services/state/server.state";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
    retry: false,
  });
  const { selectedServer, setSelectedServer } = useServerStore();
  if (selectedServer === 0 && query.data?.servers) {
    setSelectedServer(query.data.servers[0].id);
  }
  if (query.isLoading) {
    return <div>Loading...</div>;
  }
  if (!query.data) {
    return <LoginPage />;
  }

  return (
    <SidebarProvider>
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
