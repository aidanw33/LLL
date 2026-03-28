import { useAuth } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { Dashboard } from './components/Dashboard'
import { LoadingScreen } from './components/LoadingScreen'

function App() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (session) return <Dashboard />
  return <LandingPage />
}

export default App
