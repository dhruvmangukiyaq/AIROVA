/** Skeleton for `/account/reviews`. */
export default function ReviewsLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-32 shimmer" />
        <div className="mt-5 h-9 w-64 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="grid gap-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border border-line bg-paper">
            <div className="flex items-center gap-4 border-b border-line px-5 py-4">
              <div className="size-16 shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 shimmer" />
                <div className="h-3 w-1/4 shimmer" />
              </div>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div className="h-4 w-1/2 shimmer" />
              <div className="h-3 w-full shimmer" />
              <div className="h-3 w-4/5 shimmer" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <div className="h-3 w-36 shimmer" />
              <div className="h-7 w-24 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
