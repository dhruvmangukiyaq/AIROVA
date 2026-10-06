/** Skeleton for `/account/wishlist`. */
export default function WishlistLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-32 shimmer" />
        <div className="mt-5 h-9 w-56 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="mb-5 h-4 w-40 shimmer" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="border border-line bg-paper">
            <div className="aspect-[4/5] shimmer" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 shimmer" />
              <div className="h-3 w-1/2 shimmer" />
              <div className="h-7 w-32 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
