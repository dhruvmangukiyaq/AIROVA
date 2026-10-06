import { HeaderSkeleton, PanelsSkeleton } from "@/components/admin/loading-states";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <PanelsSkeleton count={4} height="h-56" />
    </div>
  );
}
