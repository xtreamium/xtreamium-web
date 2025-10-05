import { Button } from "@/components/ui/button";
import ServerSelectorComponent from "@/components/widgets/server-selector";
import type { User } from "@/models/user";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import ProxyStatus from "@/components/widgets/proxy-status.component";
import { ThemeToggle } from "@/components/widgets/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
type HeaderProps = { user: User };

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { logout } = useAuth();

  return (
    <header className="w-full bg-card border-b border-border sticky top-0 z-50">
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
            <Button variant="ghost" size="sm">
              <Icons.search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Icons.bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ServerSelectorComponent user={user} />
        {/* Right side - Profile dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
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
    </header>
  );
};
export default Header;
