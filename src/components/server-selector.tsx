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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type ServerSelectorComponentProps = {
  user: User;
};

const ServerSelectorComponent: React.FC<ServerSelectorComponentProps> = ({
  user,
}) => {
  // All hooks must be called at the top level
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1">
          <Icons.server className="w-5 h-5" />
          <span className="hidden font-normal md:inline">{server?.name}</span>
          <Icons.chevronDown className="hidden w-4 h-4 opacity-60 sm:inline-block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Server</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.servers.map((s) => (
          <DropdownMenuItem
            key={s.id}
            className="flex items-center justify-between"
            onSelect={() => _handleClick(s.id)}
          >
            <span className="font-[sans-serif]">{s.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-red-500 hover:text-red-600"
              onClick={async (e) => {
                e.stopPropagation();
                const result = await deleteServerMutation.mutateAsync(s.id);
                if (result) {
                  queryClient.invalidateQueries({ queryKey: ["user"] });
                }
              }}
            >
              <Icons.delete className="w-4 h-4" />
            </Button>
          </DropdownMenuItem>
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
