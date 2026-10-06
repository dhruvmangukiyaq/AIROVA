import { TableSkeleton } from "@/components/admin/loading-states";

export default function ProductsLoading() {
  return <TableSkeleton rows={10} />;
}
