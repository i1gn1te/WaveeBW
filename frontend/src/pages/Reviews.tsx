import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMyReviews, deleteReview } from '../lib/api'
import StarRating from '../components/StarRating'
import { Trash2, Loader2, Music } from 'lucide-react'

export default function Reviews() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => getMyReviews().then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  const reviews = data?.reviews || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Twoje recenzje</h1>
        <p className="text-gray-400">
          {reviews.length > 0
            ? `Masz ${reviews.length} ${reviews.length === 1 ? 'recenzję' : reviews.length < 5 ? 'recenzje' : 'recenzji'}`
            : 'Nie masz jeszcze żadnych recenzji'}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl">
          <p className="text-gray-400 mb-4">Zacznij recenzować muzykę!</p>
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Szukaj utworów
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-gray-900 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4"
            >
              {/* Okladka albumu */}
              <Link to={`/track/${review.trackId}`} className="flex-shrink-0">
                {review.albumArt ? (
                  <img
                    src={review.albumArt}
                    alt={review.albumName}
                    className="w-full md:w-24 h-48 md:h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full md:w-24 h-48 md:h-24 rounded-lg bg-gray-800 items-center justify-center"
                  style={{ display: review.albumArt ? 'none' : 'flex' }}
                >
                  <Music className="w-10 h-10 text-gray-600" />
                </div>
              </Link>

              {/* Tresc recenzji */}
              <div className="flex-1 min-w-0">
                <Link to={`/track/${review.trackId}`}>
                  <h3 className="text-lg font-semibold text-white hover:text-primary-400 transition truncate">
                    {review.trackName}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-2">{review.artistName}</p>
                
                <div className="mb-3">
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>

                {review.content && (
                  <p className="text-gray-300 text-sm line-clamp-2">{review.content}</p>
                )}

                {/* Tagi cech audio */}
                {review.tempo && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                      {Math.round(review.tempo)} BPM
                    </span>
                    {review.energy && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                        Energia: {Math.round(review.energy * 100)}%
                      </span>
                    )}
                    {review.danceability && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                        Taneczność: {Math.round(review.danceability * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Akcje */}
              <div className="flex md:flex-col items-center gap-2">
                <button
                  onClick={() => deleteMutation.mutate(review.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="Usuń recenzję"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

