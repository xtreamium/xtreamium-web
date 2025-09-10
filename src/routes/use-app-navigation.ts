import { useNavigate } from "react-router-dom";
import { ROUTES, type RoutePath } from "./routes";

/**
 * Custom hook for type-safe navigation
 * Provides utility functions for navigating between routes
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (route: RoutePath) => {
    navigate(route);
  };

  const navigateToHome = () => navigateTo(ROUTES.HOME);
  const navigateToStreams = () => navigateTo(ROUTES.STREAMS);
  const navigateToSettings = () => navigateTo(ROUTES.SETTINGS);
  const navigateToAbout = () => navigateTo(ROUTES.ABOUT);
  const navigateToLogin = () => navigateTo(ROUTES.LOGIN);

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return {
    navigateTo,
    navigateToHome,
    navigateToStreams,
    navigateToSettings,
    navigateToAbout,
    navigateToLogin,
    goBack,
    goForward,
  };
};

export default useAppNavigation;
