import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getLoginUrl } from '../lib/api'
import { Loader2, Music } from 'lucide-react'
import { queryClient } from '../main'

const API_URL = '/api';

export default function Login() {
  const { isAuthenticated, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Sprawdz blad po powrocie z autoryzacji
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'auth_failed': 'Logowanie nie powiodło się. Spróbuj ponownie.',
        'no_code': 'Brak autoryzacyjnego kodu. Spróbuj ponownie.',
      }
      setError(errorMessages[errorParam] || `Błąd logowania: ${errorParam}`)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    try {
      const { data } = await getLoginUrl()
      
      if (data.demoMode) {
        alert('⚠️ Spotify API nie jest skonfigurowany.\n\nUżyj przycisku "Tryb Demo" aby przetestować aplikację.')
        return
      }
      
      if (!data.url) {
        alert('Nie można zalogować się przez Spotify.')
        return
      }
      
      window.location.href = data.url
    } catch (error) {
      console.error('Failed to get login URL:', error)
      alert('Błąd: nie można zalogować się przez Spotify')
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      // Wyczysc cache po poprzedniej sesji
      queryClient.clear()
      
      const response = await fetch(`${API_URL}/auth/demo-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        await refetchUser()
        navigate('/dashboard')
      } else {
        const error = await response.json()
        alert(`Błąd: ${error.error || 'Demo login nie powiódł się'}`)
      }
    } catch (error) {
      console.error('Demo login error:', error)
      alert('Błąd podczas logowania demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center">
            <Music className="w-10 h-10 text-primary-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Zaloguj się do waveeProjectBW</h1>
        <p className="text-gray-400 mb-8">
          Połącz swoje konto Spotify lub wypróbuj wersję demo
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-4 bg-[#1DB954] hover:bg-[#1aa34a] text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zaloguj się kontem Spotify (wymaga konfiguracji API)"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Kontynuuj ze Spotify
        </button>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-500 text-sm">lub</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Music className="w-5 h-5 text-gray-400" />
          )}
          {loading ? 'Logowanie...' : 'Tryb Demo'}
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Tryb demo używa przykładowych danych. Nie wymaga konta Spotify.
        </p>
      </div>
    </div>
  )
}

