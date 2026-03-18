import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTrackDetails, getTrackReviews, createReview, getSimilarTracks } from '../lib/api'
import AudioFeaturesDisplay from '../components/AudioFeaturesDisplay'
import StarRating from '../components/StarRating'
import TrackCard from '../components/TrackCard'
import { formatDuration } from '../lib/utils'
import { Clock, Disc, User, Loader2 } from 'lucide-react'

export default function Track() {
  const { trackId } = useParams<{ trackId: string }>()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => getTrackDetails(trackId!).then(res => res.data),
    enabled: !!trackId,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['trackReviews', trackId],
    queryFn: () => getTrackReviews(trackId!).then(res => res.data),
    enabled: !!trackId,
  })

  const { data: similarTracks } = useQuery({
    queryKey: ['similarTracks', trackId],
    queryFn: () => getSimilarTracks(trackId!).then(res => res.data),
    enabled: !!trackId && !!track,
    staleTime: 1000 * 60 * 10,
    retry: false,
  })

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackReviews', trackId] })
      queryClient.invalidateQueries({ queryKey: ['myReviews'] })
      setRating(0)
      setReviewContent('')
    },
  })

  const handleSubmitReview = () => {
    if (rating > 0 && trackId) {
      reviewMutation.mutate({
        trackId,
        rating,
        content: reviewContent || undefined,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!track) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Nie znaleziono utworu</p>
      </div>
    )
  }

  const albumArt = track.album.images[0]?.url
  const artistNames = track.artists.map((a: any) => a.name).join(', ')

  return (
    <div className="space-y-8">
      {/* Naglowek utworu */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Okladka albumu */}
        <div className="flex-shrink-0">
          <img
            src={albumArt || '/placeholder-album.png'}
            alt={track.album.name}
            className="w-64 h-64 rounded-xl shadow-2xl"
          />
        </div>

        {/* Informacje o utworze */}
        <div className="flex-1">
          <p className="text-sm text-primary-400 font-medium mb-2">UTWÓR</p>
          <h1 className="text-4xl font-bold text-white mb-4">{track.name}</h1>
          
          <div className="flex items-center gap-4 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{artistNames}</span>
            </div>
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4" />
              <span>{track.album.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(track.duration_ms)}</span>
            </div>
          </div>

          {/* Srednia ocena */}
          {reviewsData && reviewsData.averageRating > 0 && (
            <div className="bg-gray-900 rounded-lg px-4 py-3 inline-flex items-center gap-3">
              <span className="text-gray-400">Średnia ocena:</span>
              <StarRating rating={reviewsData.averageRating} readonly />
              <span className="text-gray-500 text-sm">({reviewsData.pagination.total} recenzji)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cechy audio - zawsze pokazuj, komponent obsluguje null */}
        <AudioFeaturesDisplay features={track.audioFeatures ?? null} />

        {/* Formularz recenzji */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Napisz recenzję</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Twoja ocena</label>
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Twoja recenzja (opcjonalnie)</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Co sądzisz o tym utworze?"
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition resize-none"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={rating === 0 || reviewMutation.isPending}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {reviewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {reviewMutation.isPending ? 'Zapisywanie...' : 'Opublikuj recenzję'}
            </button>

            {reviewMutation.isSuccess && (
              <p className="text-green-500 text-sm text-center">Recenzja została zapisana!</p>
            )}
          </div>
        </div>
      </div>

      {/* Lista recenzji */}
      {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Recenzje</h2>
          <div className="space-y-4">
            {reviewsData.reviews.map((review: any) => (
              <div key={review.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.user.avatarUrl || '/placeholder-user.png'}
                    alt={review.user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-white">{review.user.displayName}</span>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                {review.content && (
                  <p className="text-gray-300">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Podobne utwory */}
      {similarTracks && similarTracks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Podobne utwory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarTracks.slice(0, 10).map((track: any) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

