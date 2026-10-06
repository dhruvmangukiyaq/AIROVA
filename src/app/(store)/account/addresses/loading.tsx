/** Skeleton for `/account/addresses`. */
export default function AddressesLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-32 shimmer" />
        <div className="mt-5 h-9 w-64 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3 border border-line bg-paper p-5">
            <div className="h-3 w-24 shimmer" />
            <div className="space-y-2">
              <div className="h-3 w-1/2 shimmer" />
              <div className="h-3 w-3/4 shimmer" />
              <div className="h-3 w-2/3 shimmer" />
            </div>
            <div className="h-8 w-40 shimmer" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-9 w-52 shimmer" />
    </div>
  );
}
