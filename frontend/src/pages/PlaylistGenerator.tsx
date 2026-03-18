import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchTracks, getAvailableGenres, getSimilarTracks, discoverGenre } from '../lib/api'
import { ListMusic, Search, Shuffle, Music, Loader2, X, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'
import { Link } from 'react-router-dom'

const PLAYLIST_LENGTHS = [3, 5]

export default function PlaylistGenerator() {
  const [mode, setMode] = useState<'track' | 'genres'>('genres')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [playlistLength, setPlaylistLength] = useState(5)
  const [displayedPlaylist, setDisplayedPlaylist] = useState<any[]>([])
  const [backupTracks, setBackupTracks] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatorError, setGeneratorError] = useState<string | null>(null)

  // Szukaj utworow
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchTracks(searchQuery).then(res => res.data),
    enabled: searchQuery.length > 2 && mode === 'track',
  })

  // Dostepne gatunki
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getAvailableGenres().then(res => res.data),
  })

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre].slice(0, 3) // Maksymalnie 3 gatunki
    )
  }

  const generatePlaylist = async () => {
    setIsGenerating(true)
    setGeneratorError(null)
    setDisplayedPlaylist([])
    setBackupTracks([])

    try {
      if (mode === 'track' && selectedTrack) {
        // Generuj na podstawie utworu - generujemy wiÄ™cej niĹĽ potrzeba
        const response = await getSimilarTracks(selectedTrack.id)
        const tracks = response.data || []
        const shuffled = [...tracks].sort(() => Math.random() - 0.5)
        
        setDisplayedPlaylist(shuffled.slice(0, playlistLength))
        setBackupTracks(shuffled.slice(playlistLength))
      } else if (mode === 'genres' && selectedGenres.length > 0) {
        // Generuj na podstawie gatunkĂłw - zbierz utwory z kaĹĽdego gatunku
        const allTracks: any[] = []
        for (const genre of selectedGenres) {
          const response = await discoverGenre(genre)
          if (response.data) {
            allTracks.push(...response.data)
          }
        }
        
        // Pomieszaj i weĹş unikalne
        const uniqueTracks = allTracks.filter((track, index, self) =>
          index === self.findIndex(t => t.id === track.id)
        )
        
        // Losowe przetasowanie
        const shuffled = uniqueTracks.sort(() => Math.random() - 0.5)
        
        // Podziel na wyĹ›wietlane i zapasowe (2x wiÄ™cej niĹĽ potrzeba)
        setDisplayedPlaylist(shuffled.slice(0, playlistLength))
        setBackupTracks(shuffled.slice(playlistLength, playlistLength * 3))
      }
    } catch (error) {
      console.error('Error generating playlist:', error)
      setGeneratorError((error as any)?.response?.data?.error || 'Nie udaĹ‚o siÄ™ wygenerowaÄ‡ playlisty. Zaloguj siÄ™ ponownie przez Spotify.')
    } finally {
      setIsGenerating(false)
    }
  }

  const removeTrack = (trackId: string) => {
    // UsuĹ„ utwĂłr z playlisty
    setDisplayedPlaylist(prev => prev.filter(t => t.id !== trackId))
    
    // JeĹ›li sÄ… zapasowe utwory, dodaj jeden
    if (backupTracks.length > 0) {
      const [nextTrack, ...remainingBackup] = backupTracks
      setDisplayedPlaylist(prev => [...prev, nextTrack])
      setBackupTracks(remainingBackup)
    }
  }

  const shufflePlaylist = () => {
    setDisplayedPlaylist(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const regenerateMore = async () => {
    // Dodaj wiÄ™cej utworĂłw z nowego zapytania
    setIsGenerating(true)
    try {
      if (mode === 'track' && selectedTrack) {
        const response = await getSimilarTracks(selectedTrack.id)
        const tracks = response.data || []
        const shuffled = [...tracks].sort(() => Math.random() - 0.5)
        
        // Dodaj nowe utwory do zapasu (pomijajÄ…c te ktĂłre juĹĽ sÄ…)
        const existingIds = new Set([...displayedPlaylist, ...backupTracks].map(t => t.id))
        const newTracks = shuffled.filter(t => !existingIds.has(t.id))
        setBackupTracks(prev => [...prev, ...newTracks])
      } else if (mode === 'genres' && selectedGenres.length > 0) {
        const allTracks: any[] = []
        for (const genre of selectedGenres) {
          const response = await discoverGenre(genre)
          if (response.data) {
            allTracks.push(...response.data)
          }
        }
        
        const uniqueTracks = allTracks.filter((track, index, self) =>
          index === self.findIndex(t => t.id === track.id)
        )
        
        const shuffled = uniqueTracks.sort(() => Math.random() - 0.5)
        
        // Dodaj nowe utwory do zapasu
        const existingIds = new Set([...displayedPlaylist, ...backupTracks].map(t => t.id))
        const newTracks = shuffled.filter(t => !existingIds.has(t.id))
        setBackupTracks(prev => [...prev, ...newTracks])
      }
    } catch (error) {
      console.error('Error regenerating:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Naglowek */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ListMusic className="w-8 h-8 text-primary-400" />
          Generator Playlisty
        </h1>
        <p className="text-gray-400">Wygeneruj playlistÄ™ na podstawie utworu lub gatunkĂłw muzycznych</p>
      </div>

      {/* Wybor trybu */}
      <div className="flex gap-4">
        <button
          onClick={() => { setMode('genres'); setSelectedTrack(null); setSearchQuery(''); }}
          className={cn(
            'flex-1 p-4 rounded-xl transition-all flex items-center justify-center gap-3',
            mode === 'genres'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          )}
        >
          <Music className="w-5 h-5" />
          Na podstawie gatunkĂłw
        </button>
        <button
          onClick={() => { setMode('track'); setSelectedGenres([]); }}
          className={cn(
            'flex-1 p-4 rounded-xl transition-all flex items-center justify-center gap-3',
            mode === 'track'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          )}
        >
          <Sparkles className="w-5 h-5" />
          Na podstawie utworu
        </button>
      </div>

      {/* Wybor gatunkow */}
      {mode === 'genres' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Wybierz gatunki (maks. 3)</h2>
          <p className="text-sm text-gray-400 mb-4">
            Wybrane: {selectedGenres.length}/3
          </p>

          {selectedGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-800">
              {selectedGenres.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                >
                  {genre}
                  <button onClick={() => toggleGenre(genre)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {genres && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre: string) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  disabled={selectedGenres.length >= 3 && !selectedGenres.includes(genre)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition',
                    selectedGenres.includes(genre)
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

      {/* Wybor utworu */}
      {mode === 'track' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Wybierz utwĂłr bazowy</h2>
          
          {/* Wybrany utwor */}
          {selectedTrack && (
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg mb-4">
              <img
                src={selectedTrack.album?.images?.[0]?.url || '/placeholder-album.png'}
                alt={selectedTrack.album?.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-white font-medium">{selectedTrack.name}</p>
                <p className="text-gray-400 text-sm">
                  {selectedTrack.artists?.map((a: any) => a.name).join(', ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrack(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Wyszukiwanie */}
          {!selectedTrack && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj utworu..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {/* Wyniki wyszukiwania */}
              {searching && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.slice(0, 10).map((track: any) => (
                    <button
                      key={track.id}
                      onClick={() => { setSelectedTrack(track); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-left"
                    >
                      <img
                        src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
                        alt={track.album?.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{track.name}</p>
                        <p className="text-gray-400 text-sm truncate">
                          {track.artists?.map((a: any) => a.name).join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Przycisk generowania */}
      <div className="space-y-4">
        {/* Wybor dlugosci playlisty */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">DĹ‚ugoĹ›Ä‡ playlisty</h3>
          <div className="flex gap-3">
            {PLAYLIST_LENGTHS.map(length => (
              <button
                key={length}
                onClick={() => setPlaylistLength(length)}
                className={cn(
                  'flex-1 py-3 rounded-lg font-semibold transition',
                  playlistLength === length
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {length}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generatePlaylist}
          disabled={isGenerating || (mode === 'genres' && selectedGenres.length === 0) || (mode === 'track' && !selectedTrack)}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generowanie...
            </>
          ) : (
            <>
              <Shuffle className="w-5 h-5" />
              Generuj PlaylistÄ™ ({playlistLength} utworĂłw)
            </>
          )}
        </button>

        {generatorError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
            {generatorError}
          </div>
        )}
      </div>

      {/* Wygenerowana playlista */}
      {displayedPlaylist.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Wygenerowana playlista ({displayedPlaylist.length} utworĂłw)
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {backupTracks.length > 0 
                  ? `${backupTracks.length} utworĂłw zapasowych dostÄ™pnych`
                  : 'Brak zapasowych utworĂłw - usuĹ„ niepasujÄ…ce, a wygenerujemy nowe'}
              </p>
            </div>
            <div className="flex gap-2">
              {backupTracks.length === 0 && displayedPlaylist.length < playlistLength && (
                <button
                  onClick={regenerateMore}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Wygeneruj wiÄ™cej
                </button>
              )}
              <button
                onClick={shufflePlaylist}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Shuffle className="w-4 h-4" />
                Przetasuj
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedPlaylist.map((track: any) => (
              <div key={track.id} className="relative group">
                {/* Przycisk usuwania */}
                <button
                  onClick={() => removeTrack(track.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="UsuĹ„ z playlisty"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Karta utworu */}
                <Link to={`/track/${track.id}`} className="block">
                  <div className="bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition group">
                    <div className="relative mb-3">
                      <img
                        src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
                        alt={track.album?.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {track.artists?.map((a: any) => a.name).join(', ')}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

