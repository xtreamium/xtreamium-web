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
      className={`z-30 shrink-0 hidden lg:block transition-all duration-300 overflow-y-auto ${
        isSidebarOpen ? 'w-64' : 'w-0'
      }`}
    >
      {isSidebarOpen && <SidebarContent user={user} />}
    </aside>
  );
};

export default DesktopSidebar;
