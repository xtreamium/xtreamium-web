import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <div className="card">
        <Link to="/" style={{ color: '#646cff', textDecoration: 'none' }}>
          ← Go back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage