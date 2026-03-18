import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchTracks } from '../lib/api'
import TrackCard from '../components/TrackCard'
import { Search as SearchIcon, Loader2 } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: tracks, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchTracks(searchTerm).then(res => res.data),
    enabled: searchTerm.length > 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(query)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Szukaj utworów</h1>
        <p className="text-gray-400">Znajdź utwory, aby je ocenić lub dodać do playlisty</p>
      </div>

      {/* Formularz wyszukiwania */}
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wpisz nazwę utworu, artysty lub albumu..."
          className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Szukaj'}
        </button>
      </form>

      {/* Wyniki */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {tracks && tracks.length > 0 && (
        <div>
          <p className="text-gray-400 mb-4">Znaleziono {tracks.length} wyników</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tracks.map((track: any) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {searchTerm && tracks && tracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Nie znaleziono wyników dla "{searchTerm}"</p>
          <p className="text-sm text-gray-500 mt-2">Spróbuj wyszukać coś innego</p>
        </div>
      )}

      {searchTerm && isError && (
        <div className="text-center py-12">
          <p className="text-red-400">Nie udało się pobrać wyników wyszukiwania.</p>
          <p className="text-sm text-gray-500 mt-2">
            {(error as any)?.response?.data?.error || 'Odśwież stronę i zaloguj się ponownie przez Spotify.'}
          </p>
        </div>
      )}

      {!searchTerm && (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">Zacznij wpisywać, aby wyszukać utwory</p>
        </div>
      )}
    </div>
  )
}

