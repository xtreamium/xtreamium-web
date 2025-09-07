import React from 'react';
import { SidebarContext } from '@/context';
import { User } from '@/models';
import { Transition } from '@headlessui/react';
import SidebarContent from './sidebar-content.component';
type MobileSidebarProps = {
  user: User;
};
const MobileSidebar: React.FC<MobileSidebarProps> = ({ user }) => {
  const { isSidebarOpen, closeSidebar } = React.useContext(SidebarContext);

  return (
    <>
      {/* Overlay */}
      <Transition
        show={isSidebarOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      </Transition>

      {/* Sidebar */}
      <Transition
        show={isSidebarOpen}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <aside className="fixed inset-y-0 left-0 z-50 shrink-0 w-64 pt-16 overflow-y-auto bg-base-100 lg:hidden">
          <SidebarContent user={user} />
        </aside>
      </Transition>
    </>
  );
};

export default MobileSidebar;
