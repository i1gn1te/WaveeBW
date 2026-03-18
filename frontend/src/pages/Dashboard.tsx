import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTopTracks, getTopArtists, getMyReviews, getUserStats } from '../lib/api'
import { Star, TrendingUp, Music, Clock, Hash } from 'lucide-react'

const TIME_RANGES = [
  { value: 'short_term', label: 'Ostatnie 4 tygodnie' },
  { value: 'medium_term', label: 'Ostatnie 6 miesięcy' },
  { value: 'long_term', label: 'Wszystkich czasów' },
] as const;

export default function Dashboard() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<string>('short_term')

  const { data: topTracks, isLoading: loadingTracks } = useQuery({
    queryKey: ['topTracks', timeRange],
    queryFn: () => getTopTracks(timeRange).then(res => res.data),
  })

  const { data: topArtists } = useQuery({
    queryKey: ['topArtists', timeRange],
    queryFn: () => getTopArtists(timeRange).then(res => res.data),
  })

  const { data: reviews } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => getMyReviews().then(res => res.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => getUserStats().then(res => res.data),
  })

  return (
    <div className="space-y-8">
      {/* Naglowek powitalny */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Cześć, {user?.displayName || 'Użytkowniku'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">Oto Twój muzyczny przegląd</p>
        </div>
        <Link
          to="/search"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          Szukaj utworów
        </Link>
      </div>

      {/* Karty statystyk */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalReviews || 0}</p>
              <p className="text-sm text-gray-400">Recenzji</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.averageRating?.toFixed(1) || '-'}</p>
              <p className="text-sm text-gray-400">Śr. ocena</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{topTracks?.length || 0}</p>
              <p className="text-sm text-gray-400">Top utworów</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{topArtists?.length || 0}</p>
              <p className="text-sm text-gray-400">Artystów</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top utwory - lista numerowana */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary-400" />
              Top utwory
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {TIME_RANGES.find(t => t.value === timeRange)?.label}
            </p>
          </div>
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  timeRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range.value === 'short_term' ? '4 tyg.' : range.value === 'medium_term' ? '6 mies.' : 'Zawsze'}
              </button>
            ))}
          </div>
        </div>
        {loadingTracks ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-800 rounded" />
                <div className="w-12 h-12 bg-gray-800 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded mb-2 w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : topTracks && topTracks.length > 0 ? (
          <div className="space-y-2">
            {topTracks.slice(0, 20).map((track: any, index: number) => (
              <Link
                key={track.id}
                to={`/track/${track.id}`}
                className="flex items-center gap-4 bg-gray-900/60 hover:bg-gray-800/80 rounded-lg p-3 transition group"
              >
                {/* Numer */}
                <span className={`w-8 text-center font-bold text-lg ${
                  index < 3 ? 'text-primary-400' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>

                {/* Okladka albumu */}
                <img
                  src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
                  alt={track.album?.name}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />

                {/* Dane utworu */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate group-hover:text-primary-400 transition">
                    {track.name}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {track.artists?.map((a: any) => a.name).join(', ')}
                  </p>
                </div>

                {/* Nazwa albumu */}
                <p className="text-sm text-gray-500 truncate hidden md:block max-w-[200px]">
                  {track.album?.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <Music className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">Brak danych o top utworach</p>
            <p className="text-sm text-gray-500 mt-1">Słuchaj więcej na Spotify!</p>
          </div>
        )}
      </section>

      {/* Top artysci */}
      {topArtists && topArtists.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-1">Twoi ulubieni artyści</h2>
          <p className="text-sm text-gray-500 mb-4">
            {TIME_RANGES.find(t => t.value === timeRange)?.label}
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {topArtists.slice(0, 8).map((artist: any, index: number) => (
              <div key={artist.id} className="flex-shrink-0 text-center">
                <div className="relative">
                  <img
                    src={artist.images?.[0]?.url || '/placeholder-artist.png'}
                    alt={artist.name}
                    className="w-24 h-24 rounded-full object-cover mb-2"
                  />
                  <span className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-white font-medium truncate w-24">{artist.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ostatnie recenzje */}
      {reviews?.reviews && reviews.reviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Twoje ostatnie recenzje</h2>
            <Link to="/reviews" className="text-primary-400 text-sm hover:text-primary-300">
              Zobacz wszystkie →
            </Link>
          </div>
          <div className="space-y-3">
            {reviews.reviews.slice(0, 5).map((review: any) => (
              <Link
                key={review.id}
                to={`/track/${review.trackId}`}
                className="flex items-center gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition"
              >
                <img
                  src={review.albumArt || '/placeholder-album.png'}
                  alt={review.albumName}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{review.trackName}</p>
                  <p className="text-sm text-gray-400 truncate">{review.artistName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{review.rating.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

