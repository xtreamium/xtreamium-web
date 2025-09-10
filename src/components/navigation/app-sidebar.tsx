import { Link, useLocation } from "react-router-dom";
import { Home, Info, Radio, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";
import useServerStore from "@/services/state/server.state";
import type { User } from "@/models/user";
import { Icons } from "@/components/icons";

type AppSidebarProps = {
  user: User;
};
const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
  const { selectedServer } = useServerStore();
  const location = useLocation();
  const server = user.servers.find((s) => s.id === selectedServer);
  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => ApiService.getCategories(server),
  });

  if (query.isLoading) {
    return <div className="text-base-content">Loading...</div>;
  }

  return (
    <Sidebar variant="inset" className="mt-[57px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h2 className="text-xl">Channels</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {query.data?.map((item) => {
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
