import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

interface TrackCardProps {
  track: {
    id: string
    name: string
    artists: { name: string }[]
    album: {
      name: string
      images: { url: string }[]
    }
  }
  showArtist?: boolean
}

export default function TrackCard({ track, showArtist = true }: TrackCardProps) {
  const albumArt = track.album.images[0]?.url || '/placeholder-album.png'
  const artistNames = track.artists.map(a => a.name).join(', ')

  return (
    <Link
      to={`/track/${track.id}`}
      className="group bg-gray-900/50 rounded-lg p-4 hover:bg-gray-800/50 transition-all duration-200"
    >
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden">
        <img
          src={albumArt}
          alt={track.album.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-white truncate">{track.name}</h3>
      {showArtist && (
        <p className="text-sm text-gray-400 truncate mt-1">{artistNames}</p>
      )}
    </Link>
  )
}
