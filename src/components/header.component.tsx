import React from 'react';

import { Icons } from './icons';
import ThemeChanger from './theme-changer.component';
import ProfileDropdown from './widgets/profile-dropdown.component';
import ServerSelectorComponent from './widgets/server-selecter.component';
import { User } from '@/models';
import ProxyStatus from './widgets/proxy-status.component';
import { Link } from 'react-router-dom';
import { SidebarContext } from '@/context';
type HeaderProps = { user: User };

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { toggleSidebar } = React.useContext(SidebarContext);

  const handleToggleSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle sidebar clicked');
    try {
      toggleSidebar();
    } catch (error) {
      console.error('Error toggling sidebar:', error);
    }
  };

  return (
    <div className="w-full navbar">
      <div className="flex-1">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Icons.menu className="w-6 h-6" />
        </button>
        <Link to="/" className="btn btn-ghost" aria-label="Home">
          <img src="/app-icon.png" alt="Home" className="w-8 h-8" />
        </Link>
      </div>
      <div className="flex-none mx-2">
        <ServerSelectorComponent user={user} />
        <ThemeChanger />
        <ProxyStatus />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Header;
