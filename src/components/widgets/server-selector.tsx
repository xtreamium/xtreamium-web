import useServerStore from "@/services/state/server.state";
import React from "react";
import { Icons } from "@/components/icons";
import { NavLink } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTriggerFixed } from "@/components/dropdown-menu-trigger-fixed";
import { ChevronDown, SparklesIcon } from "lucide-react";

type ServerSelectorComponentProps = {
  user: User;
};

const ServerSelectorComponent: React.FC<ServerSelectorComponentProps> = ({
  user,
}) => {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { selectedServer, setSelectedServer } = useServerStore();

  const server = user.servers.find((s) => s.id === selectedServer);

  if (!user || !user.servers || user.servers.length === 0) {
    return (
      <NavLink to={`/server/add`}>
        <Button variant="ghost" size="sm" className="opacity-50">
          <Icons.add className="w-4 h-4 mr-2" /> Add Server
        </Button>
      </NavLink>
    );
  }

  async function _handleClick(id: string) {
    setSelectedServer(id);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTriggerFixed asChild>
        <Button variant="outline" className="gap-2 px-2">
          <Icons.server className="w-5 h-5" />
          <span className="truncate">{server?.name}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTriggerFixed>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        sideOffset={4}
      >
        {user.servers.map((s) => (
          <React.Fragment key={s.id}>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => void _handleClick(s.id)}>
                <SparklesIcon />
                {s.name}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
        <DropdownMenuItem asChild>
          <NavLink to={`/server/add`}>
            <Icons.add className="w-4 h-4 mr-2" /> Add Server
          </NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerSelectorComponent;
