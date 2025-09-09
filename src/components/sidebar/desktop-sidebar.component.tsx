import React from "react";
import SidebarContent from "./sidebar-content.component";
import { User } from "@/models";
import { SidebarContext } from "@/context";
type DesktopSidebarProps = {
  user: User;
};
const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ user }) => {
  const { isSidebarOpen } = React.useContext(SidebarContext);

  return (
    <aside
      className={`z-30 shrink-0 hidden lg:block transition-all duration-300 overflow-hidden ${
        isSidebarOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className={`h-full w-64 overflow-y-auto transition-opacity duration-300 ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        <SidebarContent user={user} />
      </div>
    </aside>
  );
};

export default DesktopSidebar;
