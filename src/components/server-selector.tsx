import useServerStore from "@/services/state/server.state";
import React from "react";
import { Icons } from "@/components/icons";
import { NavLink } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services";
import type { User } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronDown,
  CreditCardIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ServerSelectorComponentProps = {
  user: User;
};

const ServerSelectorComponent: React.FC<ServerSelectorComponentProps> = ({
  user,
}) => {
  // All hooks must be called at the top level
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { selectedServer, setSelectedServer } = useServerStore();
  const deleteServerMutation = useMutation({
    mutationFn: (serverId: number) => {
      return ApiService.deleteServer(serverId);
    },
  });

  // Now we can do conditional logic after hooks
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

  function _handleClick(id: number): void {
    setSelectedServer(id);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 px-2">
          <Icons.server className="w-5 h-5" />{" "}
          <div className="truncate">{server?.name}</div>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <Icons.server className="w-5 h-5" />{" "}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{server?.name}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.servers.map((s) => (
          <React.Fragment key={s.id}>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => _handleClick(s.id)}>
                <SparklesIcon />
                {s.name}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NavLink to={`/server/add`}>
            <Button variant="ghost" size="sm" className="w-full opacity-50">
              <Icons.add className="w-4 h-4 mr-2" /> Add Server
            </Button>
          </NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerSelectorComponent;
