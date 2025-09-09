import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { routes } from './lib/routes'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/navigation/app-sidebar'
import { Header } from '@/components/navigation/header'
import './app.css'

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {routes.map((route) => {
                const Component = route.element
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={<Component />} 
                  />
                )
              })}
            </Routes>
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
