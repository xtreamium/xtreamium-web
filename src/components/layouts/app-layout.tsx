import type React from "react";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/sidebar";
import { Header } from "@/components/navigation/header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {/* Full width header at the top */}
        <Header />
        
        {/* Sidebar and content below header */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          
          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
