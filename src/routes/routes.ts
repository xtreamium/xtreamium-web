/**
 * Route path constants for the application
 * Use these constants instead of hardcoded strings for type safety
 */
export const ROUTES = {
  // Public routes
  LOGIN: "/login",

  // Protected routes
  HOME: "/",
  STREAMS: "/streams",
  SETTINGS: "/settings",
  ABOUT: "/about",
} as const;

/**
 * Type for valid route paths
 */
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/**
 * Helper function to get route path by key
 */
export const getRoute = (key: RouteKey): RoutePath => ROUTES[key];

/**
 * Check if a path is a valid route
 */
export const isValidRoute = (path: string): path is RoutePath => {
  return Object.values(ROUTES).includes(path as RoutePath);
};
