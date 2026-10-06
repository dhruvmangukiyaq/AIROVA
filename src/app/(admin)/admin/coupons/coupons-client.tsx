"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Pencil, Plus, Power, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { adminCouponSchema, type ActionResult } from "../../schemas";
import { deleteCoupon, saveCoupon, toggleCouponActive } from "../../actions";
import { TableEmptyState } from "@/components/admin/data-table-primitives";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Panel, PanelHeader } from "@/components/admin/panel";
import {
  CheckField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";

type CouponValues = z.input<typeof adminCouponSchema>;
type CouponOutput = z.output<typeof adminCouponSchema>;

interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  active: boolean;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
}

const TYPE_OPTIONS = [
  { value: "PERCENT", label: "Percentage off (%)" },
  { value: "FIXED", label: "Flat amount off (₹)" },
  { value: "FREE_SHIPPING", label: "Shipping charged up to (₹)" },
];

const valueLabel = (type: string) =>
  type === "FIXED"
    ? "Amount off (₹)"
    : type === "FREE_SHIPPING"
      ? "Shipping up to (₹)"
      : "Percent off (%)";

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

function blankForm(): CouponValues {
  return {
    code: "",
    description: "",
    type: "PERCENT",
    value: 10,
    minOrder: 0,
    maxDiscount: 0,
    usageLimit: 100,
    expiresAt: toLocalInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    active: true,
  };
}

function couponForm(coupon: AdminCoupon): CouponValues {
  return {
    code: coupon.code,
    description: coupon.description ?? "",
    type: coupon.type,
    value: coupon.value,
    minOrder: coupon.minOrder,
    maxDiscount: coupon.maxDiscount ?? 0,
    usageLimit: coupon.usageLimit ?? 0,
    expiresAt: coupon.expiresAt ? toLocalInput(coupon.expiresAt) : "",
    active: coupon.active,
  };
}

export function CouponsClient({ coupons }: { coupons: AdminCoupon[] }) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<AdminCoupon | null>(null);
  // Captured once per mount — the purity rule forbids Date.now() in render.
  const [now] = React.useState(() => Date.now());

  const form = useForm<CouponValues, unknown, CouponOutput>({
    resolver: zodResolver(adminCouponSchema) as Resolver<
      CouponValues,
      unknown,
      CouponOutput
    >,
    defaultValues: blankForm(),
    mode: "onBlur",
  });

  const type = useWatch({ control: form.control, name: "type" });
  const active = useWatch({ control: form.control, name: "active" });
  const errors = form.formState.errors;

  const startCreate = () => {
    setEditing(null);
    form.reset(blankForm());
    setOpen(true);
  };

  const startEdit = (coupon: AdminCoupon) => {
    setEditing(coupon);
    form.reset(couponForm(coupon));
    setOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const payload = {
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() ?? "",
        type: values.type,
        value: values.value,
        minOrder: values.minOrder,
        maxDiscount: values.maxDiscount && values.maxDiscount > 0 ? values.maxDiscount : null,
        usageLimit: values.usageLimit && values.usageLimit > 0 ? values.usageLimit : null,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        active: values.active,
      };
      const result: ActionResult = await saveCoupon(
        payload,
        editing ? editing.id : undefined,
      );
      if (result.ok) {
        toast.success(result.message ?? "Coupon saved");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Could not save the coupon");
      }
    });
  });

  const onToggle = (coupon: AdminCoupon) => {
    startTransition(async () => {
      const result = await toggleCouponActive(coupon.id);
      if (result.ok) toast.success(result.message ?? "Coupon updated");
      else toast.error(result.error ?? "Could not update the coupon");
    });
  };

  const onDelete = async (id: string) => {
    const result = await deleteCoupon(id);
    if (result.ok) toast.success(result.message ?? "Coupon deleted");
    else toast.error(result.error ?? "Could not delete the coupon");
  };

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code);
    toast.success(`${code} copied`);
  };

  const discountLabel = (coupon: AdminCoupon) => {
    if (coupon.type === "PERCENT") return `${coupon.value}% off`;
    if (coupon.type === "FIXED") return `${formatPrice(coupon.value)} off`;
    return `Shipping up to ${formatPrice(coupon.value)}`;
  };

  return (
    <>
      <Panel>
        <PanelHeader
          title="Coupons"
          hint="Codes customers can apply at checkout"
          action={
            <Button type="button" variant="gold" size="sm" onClick={startCreate}>
              <Plus className="size-3.5" aria-hidden />
              New coupon
            </Button>
          }
        />

        {coupons.length === 0 ? (
          <TableEmptyState
            icon={<Ticket className="size-5" aria-hidden />}
            title="No coupons yet"
            description="Create a percentage or flat discount and share the code with customers."
            action={
              <Button type="button" variant="gold" size="sm" onClick={startCreate}>
                <Plus className="size-3.5" aria-hidden />
                Create coupon
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-line text-left font-mono text-[0.6rem] tracking-[0.16em] text-cream/45 uppercase">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Min order
                  </th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    Used
                  </th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const expired =
                    coupon.expiresAt !== null &&
                    coupon.expiresAt.getTime() < now;
                  const exhausted =
                    coupon.usageLimit !== null &&
                    coupon.usedCount >= coupon.usageLimit;
                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-ink-line last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold tracking-[0.14em] text-cream">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(coupon.code)}
                            className="text-cream/35 transition-colors hover:text-gold"
                            aria-label={`Copy code ${coupon.code}`}
                          >
                            <Copy className="size-3.5" aria-hidden />
                          </button>
                          {!coupon.active ? (
                            <span className="inline-flex h-5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.58rem] font-semibold tracking-[0.14em] text-cream/55 uppercase">
                              Disabled
                            </span>
                          ) : expired ? (
                            <span className="inline-flex h-5 items-center border border-destructive/50 bg-destructive/10 px-1.5 text-[0.58rem] font-semibold tracking-[0.14em] text-[#e78a82] uppercase">
                              Expired
                            </span>
                          ) : exhausted ? (
                            <span className="inline-flex h-5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.58rem] font-semibold tracking-[0.14em] text-cream/55 uppercase">
                              Maxed
                            </span>
                          ) : null}
                        </div>
                        {coupon.description ? (
                          <p className="mt-0.5 max-w-56 truncate text-[0.68rem] text-cream/35">
                            {coupon.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-cream/85 tabular-nums">
                        {discountLabel(coupon)}
                      </td>
                      <td className="hidden px-4 py-3 text-cream/65 tabular-nums sm:table-cell">
                        {coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-cream/65 tabular-nums md:table-cell">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="hidden px-4 py-3 text-cream/65 lg:table-cell">
                        <span className="text-xs">
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" },
                              )
                            : "Never"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onToggle(coupon)}
                            disabled={pending}
                            className="p-1.5 text-cream/45 transition-colors hover:text-gold disabled:opacity-50"
                            aria-label={
                              coupon.active
                                ? `Disable ${coupon.code}`
                                : `Enable ${coupon.code}`
                            }
                          >
                            <Power
                              className={coupon.active ? "size-4" : "size-4 opacity-45"}
                              aria-hidden
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(coupon)}
                            className="p-1.5 text-cream/45 transition-colors hover:text-gold"
                            aria-label={`Edit ${coupon.code}`}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </button>
                          <ConfirmButton
                            title={`Delete ${coupon.code}?`}
                            description="The code stops working immediately. Past redemptions stay on their orders."
                            confirmLabel="Delete coupon"
                            variant="destructive"
                            size="icon-sm"
                            onConfirm={() => onDelete(coupon.id)}
                            className="text-cream/45 hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </ConfirmButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-none border-ink-line bg-[#131317] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs tracking-[0.2em] text-cream uppercase">
              {editing ? `Edit ${editing.code}` : "New coupon"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={onSubmit}
            noValidate
            className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Code"
                required
                placeholder="WELCOME10"
                className="font-mono uppercase"
                error={errors.code?.message}
                {...form.register("code")}
              />
              <SelectField
                label="Type"
                options={TYPE_OPTIONS}
                error={errors.type?.message}
                {...form.register("type")}
              />
              <NumberField
                label={valueLabel(type)}
                required
                min={0}
                hint={
                  type === "PERCENT"
                    ? "1–100 only."
                    : type === "FIXED"
                      ? "Rupees deducted from the order."
                      : "Customer pays at most this much for shipping."
                }
                error={errors.value?.message}
                {...form.register("value", { valueAsNumber: true })}
              />
              <NumberField
                label="Min order (₹)"
                min={0}
                hint="0 applies the code to any order value."
                error={errors.minOrder?.message}
                {...form.register("minOrder", { valueAsNumber: true })}
              />
              <NumberField
                label="Max discount (₹)"
                min={0}
                hint="0 for no cap on percentage codes."
                error={errors.maxDiscount?.message}
                {...form.register("maxDiscount", { valueAsNumber: true })}
              />
              <NumberField
                label="Usage limit (total)"
                min={0}
                hint="0 for unlimited redemptions."
                error={errors.usageLimit?.message}
                {...form.register("usageLimit", { valueAsNumber: true })}
              />
              <TextField
                label="Expires"
                type="datetime-local"
                error={errors.expiresAt?.message}
                {...form.register("expiresAt")}
              />
              <TextAreaField
                label="Description"
                placeholder="Shown in admin only"
                className="sm:col-span-2"
                error={errors.description?.message}
                {...form.register("description")}
              />
            </div>

            <CheckField
              label="Active"
              hint="Inactive codes stay listed but are rejected at checkout."
              checked={active ?? false}
              onCheckedChange={(v) => form.setValue("active", v)}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={pending}>
                {pending ? "Saving…" : "Save coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
