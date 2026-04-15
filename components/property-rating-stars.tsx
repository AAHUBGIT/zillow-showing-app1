export function PropertyRatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < rating;

        return (
          <span
            key={index}
            className={`text-sm ${isFilled ? "text-amber-500" : "text-slate-300"}`}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
      <span className="ml-1 text-xs font-semibold text-slate-500">{rating}/5</span>
    </div>
  );
}
