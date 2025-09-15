import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import Loading from '@/components/loading';

type AppSidebarProps = {
  user: User;
};
const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
  const { selectedServer } = useServerStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

  // Handle selecting a category via keyboard
  const handleSelectItem = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < filteredCategories.length) {
      const selectedCategory = filteredCategories[selectedIndex];
      navigate(`/channel/${selectedCategory.category_id}`);
      setSearchTerm("");
      setSelectedIndex(-1);
    }
  }, [selectedIndex, filteredCategories, navigate]);

  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  if (query.isLoading) {
    return <Loading>Loading channels...</Loading>;
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
              selectedIndex={selectedIndex}
              onSelectedIndexChange={setSelectedIndex}
              onSelectItem={handleSelectItem}
              itemCount={filteredCategories.length}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCategories.map((item, index) => {
                const isKeyboardSelected = selectedIndex === index;
                return (
                  <SidebarMenuItem key={item.category_id}>
                    <SidebarMenuButton
                      className={cn(
                        "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10",
                        isKeyboardSelected && "bg-[var(--primary)]/20 text-foreground"
                      )}
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
