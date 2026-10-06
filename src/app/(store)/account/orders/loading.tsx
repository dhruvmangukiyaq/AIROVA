/** Skeleton for `/account/orders` — the shell comes from the account layout. */
export default function OrdersLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-32 shimmer" />
        <div className="mt-5 h-9 w-56 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-9 w-28 shimmer" />
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border border-line bg-paper">
            <div className="h-20 shimmer" />
            <div className="flex items-center gap-6 px-5 py-5">
              <div className="flex gap-2">
                <div className="size-14 shimmer" />
                <div className="size-14 shimmer" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 shimmer" />
                <div className="h-3 w-32 shimmer" />
              </div>
              <div className="h-9 w-36 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
