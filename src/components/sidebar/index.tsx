import { User } from '@/models';
import { SidebarContext } from '@/context';
import React from 'react';
import SidebarContent from './sidebar-content.component';

type SidebarProps = {
  user: User;
};

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const { isSidebarOpen, closeSidebar } = React.useContext(SidebarContext);
  const [overlayActive, setOverlayActive] = React.useState(false);

  // Delay overlay activation to prevent immediate closing
  React.useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => setOverlayActive(true), 100);
      return () => clearTimeout(timer);
    } else {
      setOverlayActive(false);
    }
  }, [isSidebarOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (overlayActive) {
      console.log('Overlay clicked - closing sidebar');
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay - only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Unified sidebar - responsive for both mobile and desktop */}
      <aside
        className={`
          fixed lg:relative
          inset-y-0 lg:inset-y-auto
          left-0
          z-50 lg:z-30
          w-64
          pt-16 lg:pt-0
          overflow-y-auto
          bg-base-100
          transition-all duration-300 ease-in-out
          ${isSidebarOpen
            ? 'translate-x-0 lg:w-64'
            : '-translate-x-full lg:translate-x-0 lg:w-0'
          }
        `}
      >
        <div className={`h-full w-64 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'lg:opacity-0'
        }`}>
          <SidebarContent user={user} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
