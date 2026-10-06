/** Skeleton for `/account/orders/[id]`. */
export default function OrderDetailLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-28 shimmer" />
        <div className="mt-5 h-9 w-72 shimmer" />
        <div className="mt-4 h-4 w-full max-w-lg shimmer" />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <div className="border border-line bg-paper">
            <div className="h-14 shimmer" />
            <div className="divide-y divide-line">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="size-20 shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 shimmer" />
                    <div className="h-3 w-1/3 shimmer" />
                    <div className="h-3 w-1/4 shimmer" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-line px-5 py-4">
              <div className="h-3 w-1/3 shimmer" />
              <div className="h-3 w-1/4 shimmer" />
              <div className="h-5 w-1/3 shimmer" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="h-52 shimmer" />
            <div className="h-52 shimmer" />
          </div>

          <div className="h-16 shimmer" />
        </div>

        <aside className="space-y-6">
          <div className="h-80 shimmer" />
          <div className="h-36 shimmer" />
        </aside>
      </div>
    </div>
  );
}
