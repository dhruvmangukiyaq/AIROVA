import { ShopGridSkeleton } from "@/components/shop/shop-view";

export default function ShopLoading() {
  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <header className="border-b border-ink pb-8">
        <div className="h-3 w-40 shimmer" />
        <div className="mt-5 h-12 w-2/3 max-w-lg shimmer" />
        <div className="mt-4 h-4 w-full max-w-xl shimmer" />
      </header>

      <div className="grid gap-10 pt-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="space-y-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-24 shimmer" />
                <div className="h-3 w-32 shimmer" />
                <div className="h-3 w-28 shimmer" />
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="h-4 w-24 shimmer" />
            <div className="h-9 w-52 shimmer" />
          </div>
          <div className="pt-8">
            <ShopGridSkeleton count={9} />
          </div>
        </div>
      </div>
    </div>
  );
}
