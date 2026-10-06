/** Skeleton for `/account/profile`. */
export default function ProfileLoading() {
  return (
    <div>
      <header className="mb-8 border-b border-ink pb-6 sm:mb-10">
        <div className="h-3 w-36 shimmer" />
        <div className="mt-5 h-9 w-56 shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="space-y-8">
        <div className="space-y-5 border border-line bg-paper p-5 sm:p-6">
          <div className="h-3 w-32 shimmer" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-16 shimmer" />
            <div className="h-16 shimmer" />
          </div>
          <div className="h-16 shimmer" />
          <div className="ml-auto h-9 w-40 shimmer" />
        </div>

        <div className="space-y-5 border border-line bg-paper p-5 sm:p-6">
          <div className="h-3 w-36 shimmer" />
          <div className="h-16 shimmer" />
          <div className="h-16 shimmer" />
          <div className="ml-auto h-9 w-44 shimmer" />
        </div>

        <div className="h-44 shimmer" />
      </div>
    </div>
  );
}
