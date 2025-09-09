import React from 'react';
import { SidebarContext } from '@/context';
import { User } from '@/models';
import SidebarContent from './sidebar-content.component';

type MobileSidebarProps = {
  user: User;
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({ user }) => {
  const { isSidebarOpen, closeSidebar } = React.useContext(SidebarContext);

  React.useEffect(() => {
    console.log('Mobile sidebar state changed:', isSidebarOpen);
  }, [isSidebarOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Overlay clicked - closing sidebar');
    closeSidebar();
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 pt-16 overflow-y-auto bg-base-100 lg:hidden transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent user={user} />
      </aside>
    </>
  );
};

export default MobileSidebar;
