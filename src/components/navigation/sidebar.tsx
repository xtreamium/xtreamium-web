import { Link, useLocation } from "react-router-dom"
import { Home, Info, Radio, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { navigationItems } from "@/lib/routes"

// Icon mapping for navigation items
const iconMap: Record<string, React.ComponentType> = {
  'Home': Home,
  'About': Info,
  'Streams': Radio,
  'Settings': Settings,
}

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" className="mt-[57px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = iconMap[item.name] || Home
                const isActive = location.pathname === item.path
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}