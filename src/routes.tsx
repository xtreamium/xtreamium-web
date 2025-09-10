import { Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/auth/login-page";
import NotFoundPage from "@/pages/404";
import ChannelPage from "@/pages/channel";
import ProxySettingsPage from "@/pages/proxy-settings.page";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/proxy/settings" element={<ProxySettingsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
