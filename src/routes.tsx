import { Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "@/pages/home.page";
import AboutPage from "@/pages/about.page";
import SettingsPage from "@/pages/settings.page";
import LoginPage from "@/pages/auth/login.page";
import RegisterPage from "@/pages/auth/register.page";
import NotFoundPage from "@/pages/404.page";
import ChannelPage from "@/pages/channel.page";
import ProxySettingsPage from "@/pages/proxy-settings.page";
import AddServerPage from "@/pages/add-server.page";
import RecordingsPage from "@/pages/recordings.page";
import LogsPage from "@/pages/logs.page";
import GitHubCallbackPage from "@/pages/auth/github-callback.page";
import PlayPage from "@/pages/play.page";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
      {/* Protected routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/server/add" element={<AddServerPage />} />
      <Route path="/server/edit/:serverId" element={<AddServerPage />} />
      <Route path="/proxy/settings" element={<ProxySettingsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/play/:streamId" element={<PlayPage />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="/recordings" element={<RecordingsPage />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
