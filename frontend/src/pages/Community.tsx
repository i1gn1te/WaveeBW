import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Loader2, Search, User, Star, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getPublicUser, searchUsers } from '../lib/api'

type FoundUser = {
  id: string
  displayName?: string
  avatarUrl?: string
  _count?: {
    reviews?: number
  }
}

type PublicReview = {
  id: string
  trackId: string
  trackName: string
  artistName: string
  albumArt?: string
  rating: number
  content?: string
  createdAt: string
}

type PublicUserProfile = {
  id: string
  displayName?: string
  avatarUrl?: string
  favoriteGenres: string[]
  createdAt: string
  reviews: PublicReview[]
  _count: {
    reviews: number
    playlists: number
  }
}

export default function Community() {
  const { user } = useAuth()
  const { userId } = useParams()
  const [query, setQuery] = useState('')
  const isDemoUser = user?.spotifyId === 'demo_user'

  const trimmedQuery = useMemo(() => query.trim(), [query])

  const { data: users, isLoading: usersLoading } = useQuery<FoundUser[]>({
    queryKey: ['communitySearch', trimmedQuery],
    queryFn: () => searchUsers(trimmedQuery).then((res) => res.data),
    enabled: !isDemoUser && trimmedQuery.length >= 2,
  })

  const { data: selectedUser, isLoading: profileLoading } = useQuery<PublicUserProfile>({
    queryKey: ['publicUser', userId],
    queryFn: () => getPublicUser(userId as string).then((res) => res.data),
    enabled: !isDemoUser && !!userId,
  })

  if (isDemoUser) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Zakładka Społeczność</h1>
        <p className="text-gray-300">
          Ta funkcja jest dostępna tylko przy logowaniu przez Spotify.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-gray-900 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Społeczność</h1>
        <p className="text-gray-400 mb-5">Wyszukaj użytkownika i zobacz jego profil oraz recenzje.</p>

        <div className="relative">
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj po nazwie lub emailu..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {trimmedQuery.length > 0 && trimmedQuery.length < 2 && (
          <p className="text-xs text-gray-500 mt-2">Wpisz minimum 2 znaki.</p>
        )}

        {usersLoading && (
          <div className="mt-4 flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Szukam użytkowników...
          </div>
        )}

        {!!users?.length && (
          <div className="mt-4 space-y-2">
            {users.map((foundUser) => (
              <Link
                key={foundUser.id}
                to={`/community/${foundUser.id}`}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition"
              >
                {foundUser.avatarUrl ? (
                  <img src={foundUser.avatarUrl} alt={foundUser.displayName || 'Avatar'} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{foundUser.displayName || 'Użytkownik'}</p>
                  <p className="text-xs text-gray-400">Recenzje: {foundUser._count?.reviews || 0}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {userId && (
        <section className="bg-gray-900 rounded-xl p-6">
          {profileLoading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ładuję profil...
            </div>
          ) : selectedUser ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt={selectedUser.displayName || 'Avatar'} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedUser.displayName || 'Użytkownik'}</h2>
                  <p className="text-sm text-gray-400">Recenzji: {selectedUser._count?.reviews || 0}</p>
                </div>
              </div>

              {selectedUser.favoriteGenres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUser.favoriteGenres.slice(0, 8).map((genre) => (
                    <span key={genre} className="px-3 py-1 text-xs rounded-full bg-primary-500/20 text-primary-300">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Ostatnie recenzje</h3>
                {selectedUser.reviews?.length ? (
                  selectedUser.reviews.map((review) => (
                    <Link
                      key={review.id}
                      to={`/track/${review.trackId}`}
                      className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition"
                    >
                      <div className="flex items-center gap-4">
                        {review.albumArt ? (
                          <img src={review.albumArt} alt={review.trackName} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-700" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{review.trackName}</p>
                          <p className="text-sm text-gray-400 truncate">{review.artistName}</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-yellow-400" />
                          <span className="text-white text-sm">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {review.content && <p className="text-sm text-gray-300 mt-3 line-clamp-2">{review.content}</p>}
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400">Ten użytkownik nie ma jeszcze recenzji.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Nie znaleziono użytkownika.</p>
          )}
        </section>
      )}
    </div>
  )
}
