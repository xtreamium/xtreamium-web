import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import useServerStore from "@/services/state/server.state";
import type { User } from "@/models/user";
import { Icons } from "@/components/icons";
import ChannelSearch from "@/components/widgets/channel-search";
import { useState, useMemo } from "react";

type AppSidebarProps = {
  user: User;
};
const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
  const { selectedServer } = useServerStore();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const server = user.servers.find((s) => s.id === selectedServer);

  const query = useQuery({
    queryKey: ["categories", selectedServer],
    queryFn: () =>
      server ? ApiService.getCategories(server) : Promise.resolve([]),
    enabled: !!server,
  });

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!query.data || !searchTerm.trim()) {
      return query.data || [];
    }

    return query.data.filter((category) =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [query.data, searchTerm]);

  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  if (query.isLoading) {
    return <div className="text-base-content">Loading...</div>;
  }

  return (
    <Sidebar variant="inset" className="mt-[57px]">
      <SidebarHeader className="border-b border-sidebar-border">
        <h2 className="text-xl">Channels</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <ChannelSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCategories.map((item) => {
                return (
                  <SidebarMenuItem key={item.category_id}>
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={
                        location.pathname === `/channel/${item.category_id}`
                      }
                      tooltip={item.category_name}
                      asChild
                    >
                      <Link to={`/channel/${item.category_id}`}>
                        <Icons.alarm />
                        <span>{item.category_name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
export default AppSidebar;
