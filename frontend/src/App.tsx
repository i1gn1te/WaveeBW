import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Track from './pages/Track'
import Reviews from './pages/Reviews'
import PlaylistGenerator from './pages/PlaylistGenerator'
import Profile from './pages/Profile'
import Community from './pages/Community'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute><Search /></ProtectedRoute>
            } />
            <Route path="track/:trackId" element={
              <ProtectedRoute><Track /></ProtectedRoute>
            } />
            <Route path="reviews" element={
              <ProtectedRoute><Reviews /></ProtectedRoute>
            } />
            <Route path="generator" element={
              <ProtectedRoute><PlaylistGenerator /></ProtectedRoute>
            } />
            <Route path="community" element={
              <ProtectedRoute><Community /></ProtectedRoute>
            } />
            <Route path="community/:userId" element={
              <ProtectedRoute><Community /></ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
