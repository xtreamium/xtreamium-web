import { Routes, Route, Link } from 'react-router-dom'
import { Suspense } from 'react'
import { routes, navigationItems } from './lib/routes'
import './app.css'

// Loading component
function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div>Loading...</div>
    </div>
  )
}

// Navigation component
function Navigation() {
  return (
    <nav style={{ 
      padding: '1rem', 
      borderBottom: '1px solid #ccc', 
      marginBottom: '2rem',
      backgroundColor: '#f8f9fa'
    }}>
      {navigationItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          style={{ 
            marginRight: '1rem', 
            color: '#646cff',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid transparent'
          }}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

function App() {
  return (
    <div>
      <Navigation />
      <main style={{ padding: '0 1rem' }}>
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
    </div>
  )
}

export default App
