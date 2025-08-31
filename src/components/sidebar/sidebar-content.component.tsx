import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Category, User } from '@/models';
import { ApiService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import useServerStore from '@/services/state/server.state';
import Loading from '@/components/widgets/loading.component';
import { SidebarContext } from '@/context';

type SidebarContentProps = {
  user: User;
};
const SidebarContent: React.FC<SidebarContentProps> = ({ user }) => {
  const { selectedServer } = useServerStore();
  const { closeSidebar } = React.useContext(SidebarContext);
  const location = useLocation();
  const server = user.servers.find((s) => s.id === selectedServer);

  // Close sidebar on mobile when location changes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        closeSidebar();
      }
    };

    handleResize(); // Close on navigation for mobile
  }, [location.pathname, closeSidebar]);

  if (!server) {
    return <div className="text-base-content">No Server Selected</div>;
  }

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => ApiService.getCategories(server)
  });

  if (query.isLoading) {
    return <Loading />;
  }
  //   const _searchChannels = ($event: React.ChangeEvent<HTMLInputElement>) => {
  //     const searchString = $event.target.value;
  //     if (searchString) {
  //       const filteredChannels = channels.filter((c) => {
  //         const result = c.category_name
  //           .toLowerCase()
  //           .includes(searchString.toLowerCase());
  //         console.log(
  //           "sidebar.component",
  //           `Category Name: ${c.category_name}`,
  //           `Search String: ${searchString}`
  //         );
  //         console.log("sidebar.component", "Result", result);
  //         return result;
  //       });
  //       setFilteredChannels(filteredChannels);
  //     } else {
  //       setFilteredChannels(channels);
  //     }
  //   };
  return (
    query.data && (
      <div className="py-4 text-base-content scroller">
        <a className="ml-6 text-lg font-bold " href="/">
          Categories
        </a>
        <ul className="mt-6">
          {query.data.map((category: Category) => (
            <li className="relative px-6 py-3 text-secondary-content" key={category.category_id}>
              <NavLink
                to={`/category/${category.category_id}`}
                className={({ isActive }) =>
                  `inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-accent ${
                    isActive && 'text-info'
                  }`
                }
                children={({ isActive }) => {
                  return (
                    <>
                      {isActive && (
                        <span
                          className="absolute inset-y-0 left-0 w-1 rounded-tr-lg rounded-br-lg bg-info"
                          aria-hidden="true"
                        ></span>
                      )}
                      {/* <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} /> */}
                      <span className="ml-4">{category.category_name}</span>
                    </>
                  );
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default SidebarContent;
