import { Link, useLocation } from "react-router-dom"
import { Home, Info, Radio, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild>
          <a href="/" className="flex items-center">
            <Radio />
            <span className="font-semibold">Xtreamium</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
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