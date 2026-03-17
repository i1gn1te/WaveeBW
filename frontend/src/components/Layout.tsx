import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Search, Star, ListMusic, User, LogOut, Menu, X, Users } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Wavee</span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/search" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Szukaj
                </Link>
                <Link to="/reviews" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Recenzje
                </Link>
                <Link to="/generator" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  Generator
                </Link>
                <Link to="/community" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Społeczność
                </Link>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="text-sm">{user?.displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-gray-300"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-spotify-green text-white rounded-full text-sm font-medium hover:bg-green-500 transition"
                >
                  Zaloguj przez Spotify
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <Link to="/dashboard" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/search" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Szukaj
              </Link>
              <Link to="/reviews" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Recenzje
              </Link>
              <Link to="/generator" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Generator
              </Link>
              <Link to="/community" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Społeczność
              </Link>
              <Link to="/profile" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Profil
              </Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                Wyloguj
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Wavee - Twój personalny przewodnik muzyczny 🎵</p>
          <p className="mt-2">Powered by Spotify Web API</p>
        </div>
      </footer>
    </div>
  )
}
