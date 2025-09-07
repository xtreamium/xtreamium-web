import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/header.component';
import Main from './main.container';
import { CategoryPage, HomePage, PlayerPage } from '@/pages';
import ThemedSuspense from '@/components/themed-suspense.component';
import Sidebar from '@/components/sidebar';
import LoginPage from '@/pages/login.page';
import { ApiService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import AddServerPage from '@/pages/add-server.page';
import useServerStore from '@/services/state/server.state';
import ProxySettingsPage from '@/pages/proxy-settings.page';
import RegisterPage from '@/pages/register.page';
const Layout = () => {
  const query = useQuery({
    queryKey: ['user'],
    queryFn: ApiService.getCurrentUser,
    retry: false
  });

  const { selectedServer, setSelectedServer } = useServerStore();
  if (selectedServer === 0 && query.data?.servers) {
    setSelectedServer(query.data.servers[0].id);
  }

  return query.isLoading ? (
    <div>Loading...</div>
  ) : !query.data ? (
    <LoginPage />
  ) : (
    <div className="bg-base-100">
      <div className="flex flex-col size-full">
        {/* Full-width header */}
        <Header user={query.data} />

        {/* Content area with sidebar below header */}
        <div className="flex flex-1 overflow-hidden">
          {query?.data?.servers && <Sidebar user={query.data} />}
          <div className="flex-1 h-full overflow-auto main-wrapper">
            <Main>
              <Suspense fallback={<ThemedSuspense />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/server/add" element={<AddServerPage />} />
                  <Route
                    path="/proxy/settings"
                    element={<ProxySettingsPage />}
                  />
                  <Route path="/dashboard" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="category/:categoryId"
                    element={<CategoryPage />}
                  />
                  <Route path="play/:streamId" element={<PlayerPage />} />
                </Routes>
              </Suspense>
            </Main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
