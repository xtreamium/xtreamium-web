import { Button } from "@/components/ui/button";
import ServerSelectorComponent from "@/components/widgets/server-selector";
import type { User } from "@/models/user";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import ProxyStatus from "@/components/widgets/proxy-status.component";
import NotificationStatus from "@/components/notifications/notification-status.component";
import RecordingIndicator from "@/components/recording/recording-indicator.component";
import { ThemePicker } from "@/components/widgets/theme-picker";
import SearchModal from "@/components/navigation/search-modal";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type HeaderProps = { user: User };

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="w-full bg-card border-b border-border sticky top-0 z-50">
      <TooltipProvider>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/app-icon.png"
                  alt="Xtreamium"
                  width="24"
                  height="24"
                  className="object-contain"
                />
                <span className="text-lg font-semibold">Xtreamium</span>
              </Link>
            </div>

            <SidebarTrigger />

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <Icons.search className="h-4 w-4" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/recordings" className="flex items-center gap-2">
                      <Icons.record className="h-4 w-4" />
                      <span>Recordings</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recordings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <ServerSelectorComponent user={user} />
          {/* Right side - Profile dropdown */}
          <div className="flex items-center gap-3">
            <RecordingIndicator />
            <NotificationStatus />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/settings">
                    <Icons.settings className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            <ThemePicker />
            <ProxyStatus />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void logout()}
              className="flex items-center gap-2"
            >
              <Icons.logOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </TooltipProvider>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};
export default Header;
