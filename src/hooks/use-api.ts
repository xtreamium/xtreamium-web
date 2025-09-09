import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types - define these according to your API structure
interface DataItem {
  id: string
  [key: string]: unknown
}

interface CreateDataPayload {
  [key: string]: unknown
}

interface UpdateDataPayload {
  [key: string]: unknown
}

// Example API functions - replace these with your actual API calls
const api = {
  // Example GET request
  fetchData: async (id: string): Promise<DataItem> => {
    const response = await fetch(`/api/data/${id}`)
    if (!response.ok) {throw new Error('Failed to fetch data')}
    return response.json()
  },

  // Example POST request
  createData: async (data: CreateDataPayload): Promise<DataItem> => {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {throw new Error('Failed to create data')}
    return response.json()
  },

  // Example PUT request
  updateData: async ({ id, data }: { id: string; data: UpdateDataPayload }): Promise<DataItem> => {
    const response = await fetch(`/api/data/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {throw new Error('Failed to update data')}
    return response.json()
  },

  // Example DELETE request
  deleteData: async (id: string): Promise<void> => {
    const response = await fetch(`/api/data/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {throw new Error('Failed to delete data')}
    return response.json()
  },
}

// Custom hooks for React Query
export const useData = (id: string) => {
  return useQuery({
    queryKey: ['data', id],
    queryFn: () => api.fetchData(id),
    enabled: !!id, // Only run query if id exists
  })
}

export const useCreateData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createData,
    onSuccess: () => {
      // Invalidate and refetch data queries
      queryClient.invalidateQueries({ queryKey: ['data'] })
    },
  })
}

export const useUpdateData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.updateData,
    onSuccess: (_, variables) => {
      // Update the specific item in cache
      queryClient.invalidateQueries({ queryKey: ['data', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['data'] })
    },
  })
}

export const useDeleteData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteData,
    onSuccess: () => {
      // Invalidate and refetch data queries
      queryClient.invalidateQueries({ queryKey: ['data'] })
    },
  })
}