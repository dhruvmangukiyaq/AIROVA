import { TableSkeleton } from "@/components/admin/loading-states";

export default function OrdersLoading() {
  return <TableSkeleton rows={8} />;
}
