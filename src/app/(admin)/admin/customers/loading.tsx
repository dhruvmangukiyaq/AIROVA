import { TableSkeleton } from "@/components/admin/loading-states";

export default function CustomersLoading() {
  return <TableSkeleton rows={10} />;
}
