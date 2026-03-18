import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, updateProfile, getAvailableGenres, getUserStats } from '../lib/api'
import { User, Star, Music, Check, Loader2, Edit2, X, Save } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Profile() {
  const { user, refetchUser } = useAuth()
  const queryClient = useQueryClient()
  
  // Stan trybu edycji
  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editGenres, setEditGenres] = useState<string[]>([])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfile().then(res => res.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => getUserStats().then(res => res.data),
  })

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getAvailableGenres().then(res => res.data),
  })

  // Ustaw pola edycji po zaladowaniu profilu
  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.displayName || '')
      setEditBio(profile.bio || '')
      setEditGenres(profile.favoriteGenres || [])
    }
  }, [profile])

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      refetchUser()
      setIsEditing(false)
    },
  })

  const toggleGenre = (genre: string) => {
    setEditGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre].slice(0, 5)
    )
  }

  const handleSaveProfile = () => {
    profileMutation.mutate({
      displayName: editDisplayName,
      bio: editBio,
      favoriteGenres: editGenres
    })
  }

  const handleCancelEdit = () => {
    setEditDisplayName(profile?.displayName || '')
    setEditBio(profile?.bio || '')
    setEditGenres(profile?.favoriteGenres || [])
    setIsEditing(false)
  }

  const hasGenres = user?.favoriteGenres && user.favoriteGenres.length > 0

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Naglowek profilu */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-6">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Avatar'}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Nazwa wyĹ›wietlana"
                  className="text-2xl font-bold text-white bg-gray-800 rounded-lg px-3 py-1 w-full mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{user?.displayName || 'UĹĽytkownik'}</h1>
              )}
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edytuj profil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Anuluj
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={profileMutation.isPending}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 disabled:opacity-50"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Zapisz
              </button>
            </div>
          )}
        </div>

        {/* Sekcja bio */}
        <div className="mt-4">
          <label className="text-sm text-gray-400 mb-1 block">O mnie</label>
          {isEditing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Napisz coĹ› o sobie i swoich muzycznych gustach..."
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          ) : (
            <p className="text-gray-300">
              {profile?.bio || <span className="text-gray-500 italic">Brak opisu - kliknij "Edytuj profil" aby dodaÄ‡</span>}
            </p>
          )}
        </div>

        {/* Widok ulubionych gatunkow */}
        {hasGenres && !isEditing && (
          <div className="mt-4">
            <label className="text-sm text-gray-400 mb-2 block">Ulubione gatunki</label>
            <div className="flex flex-wrap gap-2">
              {user?.favoriteGenres?.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                >
                  <Music className="w-3 h-3" />
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Wybor gatunkow - tylko w edycji lub gdy brak wyboru */}
      {(isEditing || !hasGenres) && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {hasGenres ? 'Edytuj ulubione gatunki' : 'Wybierz ulubione gatunki'}
              </h2>
              <p className="text-sm text-gray-400">
                Wybierz do 5 gatunkĂłw, aby otrzymywaÄ‡ lepsze rekomendacje
              </p>
            </div>
            {!isEditing && !hasGenres && editGenres.length > 0 && (
              <button
                onClick={handleSaveProfile}
                disabled={profileMutation.isPending}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Zapisz wybĂłr
              </button>
            )}
          </div>

          {/* Podglad wybranych gatunkow */}
          {editGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-800">
              {editGenres.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                >
                  <Music className="w-3 h-3" />
                  {genre}
                  <button
                    onClick={() => toggleGenre(genre)}
                    className="hover:text-white"
                  >
                    Ă—
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Wszystkie gatunki */}
          {genres && (
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 40).map((genre: string) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  disabled={editGenres.length >= 5 && !editGenres.includes(genre)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm transition',
                    editGenres.includes(genre)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statystyki */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.totalReviews}</p>
            <p className="text-sm text-gray-400">Recenzji</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <p className="text-3xl font-bold text-white">
                {stats.averageRating?.toFixed(1) || '-'}
              </p>
            </div>
            <p className="text-sm text-gray-400">Ĺšrednia ocena</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{profile?._count?.playlists || 0}</p>
            <p className="text-sm text-gray-400">Playlist</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{profile?._count?.likedTracks || 0}</p>
            <p className="text-sm text-gray-400">Polubionych</p>
          </div>
        </div>
      )}

      {/* Rozklad ocen */}
      {stats?.ratingDistribution && stats.totalReviews > 0 && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">RozkĹ‚ad ocen</h2>
          <div className="space-y-2">
            {['5', '4', '3', '2', '1'].map(rating => {
              const count = stats.ratingDistribution[rating] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-gray-400 w-8">{rating}â…</span>
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 w-12 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

