/** Skeleton for `/account` — the shell (sidebar/tabs) comes from the layout. */
export default function AccountLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-32 shimmer" />
        <div className="mt-5 h-9 w-56 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 shimmer" />
        ))}
      </div>

      <div className="mt-8 h-60 shimmer" />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="h-64 shimmer" />
        <div className="h-64 shimmer" />
      </div>
    </div>
  );
}
