import { PanelsSkeleton, HeaderSkeleton } from "@/components/admin/loading-states";

export default function ReviewsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeaderSkeleton />
        </div>
        <PanelsSkeleton count={1} height="h-64" />
      </div>
    </div>
  );
}
