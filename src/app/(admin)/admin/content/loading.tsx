import { HeaderSkeleton, PanelsSkeleton } from "@/components/admin/loading-states";

export default function ContentLoading() {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <HeaderSkeleton />
      <PanelsSkeleton count={2} height="h-64" />
    </div>
  );
}
