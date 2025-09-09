import { lazy } from 'react'
import type { RouteConfig } from '../types'

// Lazy load components for code splitting
const HomePage = lazy(() => import('../pages/home'))
const AboutPage = lazy(() => import('../pages/about'))
const StreamsPage = lazy(() => import('../pages/streams'))
const SettingsPage = lazy(() => import('../pages/settings'))
const NotFoundPage = lazy(() => import('../pages/404'))

// Route configuration
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    name: 'Home',
  },
  {
    path: '/about',
    element: AboutPage,
    name: 'About',
  },
  {
    path: '/streams',
    element: StreamsPage,
    name: 'Streams',
  },
  {
    path: '/settings',
    element: SettingsPage,
    name: 'Settings',
  },
  {
    path: '*',
    element: NotFoundPage,
    name: 'Not Found',
  },
]

// Navigation items (excluding the 404 page)
export const navigationItems = routes.filter(route => route.path !== '*')