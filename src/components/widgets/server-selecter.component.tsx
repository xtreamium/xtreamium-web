import { User } from "@/models";
import useServerStore from "@/services/state/server.state";
import React from "react";
import { Icons } from "@/components/icons";
import { NavLink } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services";

type ServerSelectorComponentProps = {
  user: User;
};
const ServerSelectorComponent: React.FC<ServerSelectorComponentProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const { selectedServer, setSelectedServer } = useServerStore();
  const server = user.servers.find((s) => s.id === selectedServer);
  if (!user || !user.servers || user.servers.length === 0)
    return (
      <NavLink to={`/server/add`}>
        <button className="w-full opacity-50 btn btn-sm">
          <Icons.add className="w-6 h-6" /> Add
        </button>
      </NavLink>
    );

  const deleteServerMutation = useMutation({
    mutationFn: (serverId: number) => {
      return ApiService.deleteServer(serverId);
    },
  });
  function _handleClick(id: number): void {
    setSelectedServer(id);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div title="Selected Server" className="dropdown dropdown-end ">
      <div
        tabIndex={0}
        onClick={() => {
          // if (document.activeElement instanceof HTMLElement) {
          //   document.activeElement.blur();
          // } else {
          // }
        }}
        className="gap-1 normal-case btn btn-ghost"
      >
        <Icons.server className="w-5 h-5" />
        <span className="hidden font-normal md:inline">{server?.name}</span>
        <Icons.chevronDown className="hidden w-5 h-5 fill-current opacity-60 sm:inline-block" />
        <span className="hidden lg:inline_notreally">{server?.name}</span>
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-box top-px mt-16 max-h-[calc(100vh-10rem)] w-56 overflow-y-auto border border-white/5 shadow-2xl outline-solid outline-1 outline-black/5 z-50">
        <ul className="gap-1 menu menu-sm">
          {user.servers.map((s) => (
            <li key={s.id}>
              <div className="flex">
                <button
                  title="Delete Server"
                  onClick={async () => {
                    const result = await deleteServerMutation.mutateAsync(s.id);
                    if (result) {
                      queryClient.invalidateQueries({ queryKey: ["user"] });
                    }
                  }}
                >
                  <Icons.delete className="w-4 h-4 text-red-500" />
                </button>
                <span onClick={() => _handleClick(s.id)} className="font-[sans-serif]">
                  {s.name}
                </span>
              </div>
            </li>
          ))}
          <hr className="text-primary" />
          <NavLink to={`/server/add`}>
            <button className="w-full opacity-50 btn btn-sm">
              <Icons.add className="w-6 h-6" /> Add
            </button>
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default ServerSelectorComponent;
