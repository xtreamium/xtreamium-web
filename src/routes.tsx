import { Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import NotFoundPage from "@/pages/404";
import ChannelPage from "@/pages/channel";
import ProxySettingsPage from "@/pages/proxy-settings.page";
import AddServerPage from "@/pages/add-server.page";
import RecordingsPage from "@/pages/recordings.page";
import LogsPage from "@/pages/logs.page";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/server/add" element={<AddServerPage />} />
      <Route path="/proxy/settings" element={<ProxySettingsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="/recordings" element={<RecordingsPage />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
