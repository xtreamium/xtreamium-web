import { useQuery } from '@tanstack/react-query'

function AboutPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['app-info'],
    queryFn: async () => {
      // Simulate fetching app information
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        name: 'Xtreamium',
        version: '1.0.0',
        description: 'IPTV streaming application with local proxy support',
        features: [
          'Stream IPTV content through local proxy',
          'Use whatever media player you want',
          'FastAPI backend support',
          'ASP.Net proxy application',
        ],
        timestamp: new Date().toISOString(),
      }
    },
  })

  if (isLoading) {return <div>Loading app information...</div>}
  if (error) {return <div>Error loading app information!</div>}

  return (
    <div>
      <h1>About {data?.name}</h1>
      <div className="card">
        <h3>Application Information:</h3>
        <p><strong>Version:</strong> {data?.version}</p>
        <p><strong>Description:</strong> {data?.description}</p>
        
        <h4>Features:</h4>
        <ul>
          {data?.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        
        <p><small>Last updated: {data?.timestamp}</small></p>
      </div>
    </div>
  )
}

export default AboutPage