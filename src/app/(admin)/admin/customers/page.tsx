import Link from "next/link";
import { Search, UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, TableEmptyState } from "@/components/admin/data-table-primitives";
import { Money } from "@/components/admin/money";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { CONTROL_CLASS } from "@/components/admin/styles";

export const metadata = { title: "Customers" };

const PER_PAGE = 15;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const sp = await searchParams;

  const q = first(sp.q).trim().slice(0, 80);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const roleRaw = first(sp.role);
  const role: "ADMIN" | "CUSTOMER" | "" =
    roleRaw === "ADMIN" || roleRaw === "CUSTOMER" ? roleRaw : "";

  const where = {
    ...(role ? { role } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] }
      : {}),
  };

  const [users, total, orderGroups] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
    db.order.groupBy({
      by: ["userId"],
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const stats = new Map(
    orderGroups
      .filter((g) => g.userId)
      .map((g) => [g.userId as string, { count: g._count._all, spent: g._sum.total ?? 0 }]),
  );

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hasFilters = Boolean(q || role);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="People"
        title="Customers"
        description={`${total} account${total === 1 ? "" : "s"} registered on the store.`}
      />

      <Panel>
        <form
          action="/admin/customers"
          method="get"
          className="flex flex-wrap items-end gap-2 border-b border-ink-line px-4 py-3.5"
        >
          <label className="flex min-w-56 flex-1 flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">
              Search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, email or phone"
              className={`${CONTROL_CLASS} h-9 border px-3 text-sm outline-none focus-visible:border-gold/60`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">Role</span>
            <select
              name="role"
              defaultValue={role}
              className={`${CONTROL_CLASS} h-9 border px-3 pr-8 text-sm outline-none focus-visible:border-gold/60`}
              style={{ colorScheme: "dark" }}
            >
              <option value="">Everyone</option>
              <option value="CUSTOMER">Customers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </label>
          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" variant="gold" size="sm">
              <Search className="size-3.5" aria-hidden />
              Apply
            </Button>
            {hasFilters ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/customers">Clear</Link>
              </Button>
            ) : null}
          </div>
        </form>

        {users.length === 0 ? (
          <TableEmptyState
            icon={<UsersRound className="size-5" aria-hidden />}
            title="No customers found"
            description="Nobody matches the current search — clear it to see every account."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-ink-line hover:bg-transparent">
                    <TableHead className="text-cream/45">Customer</TableHead>
                    <TableHead className="hidden text-cream/45 md:table-cell">Phone</TableHead>
                    <TableHead className="hidden text-cream/45 sm:table-cell">Joined</TableHead>
                    <TableHead className="text-right text-cream/45">Orders</TableHead>
                    <TableHead className="text-right text-cream/45">Total spent</TableHead>
                    <TableHead className="text-cream/45">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const s = stats.get(user.id) ?? { count: 0, spent: 0 };
                    return (
                      <TableRow key={user.id} className="border-ink-line hover:bg-white/[0.02]">
                        <TableCell>
                          <Link
                            href={`/admin/customers/${user.id}`}
                            className="block text-cream transition-colors hover:text-gold"
                          >
                            <span className="block text-sm">{user.name}</span>
                            <span className="block text-[0.68rem] text-cream/40">{user.email}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden text-cream/65 md:table-cell">
                          {user.phone ?? <span className="text-cream/30">—</span>}
                        </TableCell>
                        <TableCell className="hidden text-cream/65 sm:table-cell">
                          {formatOrderDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right text-cream/70 tabular-nums">
                          {s.count}
                        </TableCell>
                        <TableCell className="text-right">
                          <Money value={s.spent} className="text-cream" />
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              user.role === "ADMIN"
                                ? "inline-flex h-5.5 items-center border border-gold/45 bg-gold/10 px-2 text-[0.62rem] font-semibold tracking-[0.14em] text-gold uppercase"
                                : "inline-flex h-5.5 items-center border border-white/15 bg-white/5 px-2 text-[0.62rem] font-semibold tracking-[0.14em] text-cream/55 uppercase"
                            }
                          >
                            {user.role}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              unit="customer"
              basePath="/admin/customers"
              query={{ q, role }}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
