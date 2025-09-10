import type { LazyExoticComponent, ComponentType } from 'react'

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// IPTV Stream types
export interface StreamChannel {
  id: string
  name: string
  category: string
  logo?: string
  url: string
  epgId?: string
}

export interface StreamCategory {
  id: string
  name: string
  channelCount: number
}

// User/Settings types
export interface UserSettings {
  preferredPlayer: 'mpv' | 'vlc'
  proxyUrl: string
  bufferSize: number
  autoplay: boolean
}

// Query keys for React Query
export const QueryKeys = {
  STREAMS: ['streams'] as const,
  CATEGORIES: ['categories'] as const,
  USER_SETTINGS: ['user-settings'] as const,
  APP_INFO: ['app-info'] as const,
} as const

// Route types
export interface RouteConfig {
  path: string
  element: LazyExoticComponent<ComponentType>
  name: string
}
