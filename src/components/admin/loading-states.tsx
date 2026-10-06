import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/admin/panel";

const block = "rounded-none bg-white/[0.05]";

export function HeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2.5">
        <Skeleton className={`h-3 w-24 ${block}`} />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <Skeleton className="h-9 w-40" />
    </div>
  );
}

export function StatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`h-32 ${block}`} />
      ))}
    </div>
  );
}

export function PanelsSkeleton({ count = 2, height = "h-72" }: { count?: number; height?: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} ${block}`} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Panel>
      <div className="flex items-center gap-3 border-b border-ink-line px-4 py-3.5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="ml-auto h-8 w-32" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ink-line px-4 py-4">
            <Skeleton className="size-10 shrink-0" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <HeaderSkeleton />
      <StatsSkeleton />
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className={`h-80 ${block} xl:col-span-2`} />
        <Skeleton className={`h-80 ${block}`} />
      </div>
      <PanelsSkeleton />
      <Skeleton className={`h-64 ${block}`} />
    </div>
  );
}
