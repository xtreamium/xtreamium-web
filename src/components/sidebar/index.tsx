import { User } from '@/models';
import DesktopSidebar from './desktop-sidebar.component';
import MobileSidebar from './mobile-sidebar.component';

type SidebarProps = {
  user: User;
};
const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <>
      <div className="hidden lg:block">
        <DesktopSidebar user={user} />
      </div>
      <div className="block lg:hidden">
        <MobileSidebar user={user} />
      </div>
    </>
  );
};

export default Sidebar;
