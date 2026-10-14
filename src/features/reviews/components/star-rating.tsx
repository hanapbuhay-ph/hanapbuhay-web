interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumeric?: boolean
}

export function StarRating({
  rating,
  size = 'md',
  showNumeric = false,
}: StarRatingProps) {
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }

  const filledStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  return (
    <div className='flex items-center gap-1.5'>
      <div className='flex items-center gap-0.5'>
        {/* Filled stars */}
        {Array.from({ length: filledStars }).map((_, i) => (
          <span key={`filled-${i}`} className={`${sizeMap[size]} text-amber-400`}>
            ★
          </span>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <span className={`${sizeMap[size]} text-amber-400`}>⯨</span>
        )}

        {/* Empty stars */}
        {Array.from({ length: 5 - filledStars - (hasHalfStar ? 1 : 0) }).map(
          (_, i) => (
            <span
              key={`empty-${i}`}
              className={`${sizeMap[size]} text-gray-300`}
            >
              ☆
            </span>
          )
        )}
      </div>

      {/* Numeric value */}
      {showNumeric && (
        <span className='text-sm font-medium text-foreground'>
          {rating}/5
        </span>
      )}
    </div>
  )
}
