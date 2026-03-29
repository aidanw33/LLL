import { BrowserRouter, Routes, Route } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { LandingPage } from './components/LandingPage'
import { Dashboard } from './components/Dashboard'
import { LoadingScreen } from './components/LoadingScreen'
import { ProtectedRoute } from './components/ProtectedRoute'
import { VideoPlayerPage } from './components/video/VideoPlayerPage'
import { FlashcardsPage } from './components/flashcards/FlashcardsPage'

function HomePage() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (session) return <Dashboard />
  return <LandingPage />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/watch/:videoId"
          element={
            <ProtectedRoute>
              <VideoPlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
