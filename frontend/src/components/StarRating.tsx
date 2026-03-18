import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ rating, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      // Pozwalaj na pol gwiazdki
      if (rating === value) {
        onChange(value - 0.5)
      } else {
        onChange(value)
      }
    }
  }

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const filled = rating >= star
        const halfFilled = rating >= star - 0.5 && rating < star

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={readonly}
            className={cn(
              'relative transition-transform',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled || halfFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
              )}
            />
            {halfFilled && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={cn(sizeClasses[size], 'text-yellow-400 fill-yellow-400')} />
              </div>
            )}
          </button>
        )
      })}
      <span className="ml-2 text-gray-400 text-sm">{rating.toFixed(1)}</span>
    </div>
  )
}

