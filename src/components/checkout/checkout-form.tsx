"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeIndianRupee,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cardImage } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { STORE, whatsappLink } from "@/lib/commerce";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";
import { useCart, useSummary } from "@/store/cart";
import { PriceSummary } from "@/components/cart/price-summary";
import { CouponField } from "@/components/cart/coupon-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface PinResult {
  serviceable: boolean;
  cod: boolean;
  standardDays: [number, number];
  expressDays: [number, number];
}

type Form = CheckoutInput;

const EMPTY: Form = {
  email: "",
  phone: "",
  address: { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" },
  paymentMethod: "RAZORPAY",
  shipping: "STANDARD",
  note: "",
};

function Section({
  n,
  title,
  children,
  aside,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line pb-8">
      <div className="flex items-center gap-3">
        <span className="grid size-6 shrink-0 place-items-center bg-ink text-[0.65rem] font-semibold text-gold tabular-nums">
          {n}
        </span>
        <h2 className="text-xl">{title}</h2>
        <span className="ml-auto">{aside}</span>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[0.65rem] tracking-[0.16em] uppercase">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ user }: { user: { name: string; email: string; phone: string } | null }) {
  const router = useRouter();
  const { lines, coupon, applyCoupon, ready, clear } = useCart();

  const [form, setForm] = useState<Form>(() => ({
    ...EMPTY,
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: { ...EMPTY.address, name: user?.name ?? "", phone: user?.phone ?? "" },
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pin, setPin] = useState<PinResult | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rzpBusy, setRzpBusy] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState<string | null>(null);

  // COD is only offered where the courier accepts it — enforced here *and* on the server.
  const codBlocked = !pin || !pin.cod;
  const paymentMethod: "RAZORPAY" | "COD" =
    form.paymentMethod === "COD" && codBlocked ? "RAZORPAY" : form.paymentMethod;

  const summary = useSummary(form.shipping, paymentMethod === "COD");

  const set = useCallback(<K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const setAddress = useCallback((key: keyof Form["address"], value: string) => {
    setForm((f) => ({ ...f, address: { ...f.address, [key]: value } }));
  }, []);

  /* ------------------------- pincode serviceability ------------------------ */

  const pincode = form.address.pincode;
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pinTimer.current) clearTimeout(pinTimer.current);
    },
    [],
  );

  const onPincodeChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setAddress("pincode", clean);
    setPin(null);
    setPinBusy(false);
    if (pinTimer.current) clearTimeout(pinTimer.current);
    if (clean.length !== 6) return;

    setPinBusy(true);
    const controller = new AbortController();
    pinTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/pincode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode: clean }),
          signal: controller.signal,
        });
        const data = await res.json();
        setPin(res.ok && data.ok ? data : null);
      } catch {
        /* the checkout still works without a lookup */
      } finally {
        setPinBusy(false);
      }
    }, 350);
  };

  /* ------------------------------- payment -------------------------------- */

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const finish = useCallback(
    async (orderId: string) => {
      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(orderId)}`);
    },
    [clear, router],
  );

  const payOnline = useCallback(
    async (orderId: string) => {
      setRzpBusy(true);
      setPaymentFailed(null);
      try {
        const res = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setPaymentFailed(data.error ?? "Could not start the payment.");
          return;
        }

        if (data.simulate) {
          // No merchant keys configured — offer an explicitly labelled test payment.
          const approved = window.confirm(
            `TEST MODE — Razorpay keys are not configured.\n\nPress OK to simulate a successful payment of ${formatPrice(data.amount)}, or Cancel to go back.`,
          );
          if (!approved) {
            setPaymentFailed("Payment cancelled. You can retry or switch to Cash on Delivery.");
            return;
          }
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const verified = await verify.json();
          if (!verify.ok || !verified.ok) {
            setPaymentFailed(verified.error ?? "Payment could not be confirmed.");
            return;
          }
          await finish(orderId);
          return;
        }

        const ready = await loadRazorpayScript();
        if (!ready || !window.Razorpay) {
          setPaymentFailed("The payment window could not load. Check your connection and retry.");
          return;
        }

        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount * 100,
          currency: data.currency,
          name: STORE.name,
          description: `Order ${data.orderNumber}`,
          order_id: data.rzpOrderId,
          prefill: {
            name: form.address.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#c8a45d" },
          modal: {
            ondismiss: () => {
              setRzpBusy(false);
              setPaymentFailed("Payment window closed. Retry when you're ready.");
            },
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const verify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const result = await verify.json();
            if (!verify.ok || !result.ok) {
              setRzpBusy(false);
              setPaymentFailed(result.error ?? "Payment could not be confirmed.");
              return;
            }
            await finish(orderId);
          },
        });
        rzp.on("payment.failed", (response: { error?: { description?: string } }) => {
          setRzpBusy(false);
          setPaymentFailed(response.error?.description ?? "Payment failed. Please try again.");
        });
        rzp.open();
      } catch {
        setRzpBusy(false);
        setPaymentFailed("Something went wrong while starting the payment.");
      }
    },
    [finish, form.address.name, form.email, form.phone],
  );

  /* -------------------------------- submit -------------------------------- */

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentFailed(null);

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      const first = Object.keys(next)[0];
      document.getElementById(first.replace(/\./g, "-"))?.focus();
      return;
    }

    if (lines.length === 0) {
      toast.error("Your bag is empty");
      router.push("/cart");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty })),
          checkout: { ...parsed.data, paymentMethod },
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.field) setErrors({ [data.field]: data.error });
        toast.error(data.error ?? "We couldn't place your order.");
        return;
      }

      if (data.paymentMethod === "COD") {
        toast.success("Order placed", { description: `Order ${data.orderNumber}` });
        await finish(data.orderId);
        return;
      }

      await payOnline(data.orderId);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const items = useMemo(
    () =>
      lines.map((line) => ({
        key: `${line.productId}|${line.color}|${line.size}`,
        line,
      })),
    [lines],
  );

  if (ready && lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 border border-dashed border-line px-6 py-20 text-center">
        <p className="text-xl">Nothing to check out yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add a pair to your bag and the secure checkout will be waiting here.
        </p>
        <Button variant="gold" size="lg" asChild>
          <Link href="/shop">Shop footwear</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_23rem] lg:gap-14">
      <div className="space-y-8">
        {/* 1 — contact */}
        <Section n="1" title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email address" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-11 rounded-none bg-paper"
                placeholder="you@example.com"
              />
            </Field>
            <Field id="phone" label="Mobile number" error={errors.phone}>
              <Input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className="h-11 rounded-none bg-paper tabular-nums"
                placeholder="98765 43210"
              />
            </Field>
          </div>
        </Section>

        {/* 2 — address */}
        <Section
          n="2"
          title="Delivery address"
          aside={
            <span className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
              <MapPin className="size-3.5" /> India only
            </span>
          }
        >
          <div className="grid gap-5">
            <Field id="address-name" label="Full name" error={errors["address.name"]}>
              <Input
                id="address-name"
                autoComplete="name"
                value={form.address.name}
                onChange={(e) => setAddress("name", e.target.value)}
                aria-invalid={!!errors["address.name"]}
                className="h-11 rounded-none bg-paper"
              />
            </Field>

            <Field id="address-line1" label="House no., building, street" error={errors["address.line1"]}>
              <Input
                id="address-line1"
                autoComplete="address-line1"
                value={form.address.line1}
                onChange={(e) => setAddress("line1", e.target.value)}
                aria-invalid={!!errors["address.line1"]}
                className="h-11 rounded-none bg-paper"
              />
            </Field>

            <Field id="address-line2" label="Area, landmark (optional)" error={errors["address.line2"]}>
              <Input
                id="address-line2"
                autoComplete="address-line2"
                value={form.address.line2 ?? ""}
                onChange={(e) => setAddress("line2", e.target.value)}
                className="h-11 rounded-none bg-paper"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field id="address-pincode" label="Pincode" error={errors["address.pincode"]}>
                <Input
                  id="address-pincode"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  value={form.address.pincode}
                  onChange={(e) => onPincodeChange(e.target.value)}
                  aria-invalid={!!errors["address.pincode"]}
                  className="h-11 rounded-none bg-paper tabular-nums"
                />
              </Field>
              <Field id="address-city" label="City" error={errors["address.city"]} className="sm:col-span-2">
                <Input
                  id="address-city"
                  autoComplete="address-level2"
                  value={form.address.city}
                  onChange={(e) => setAddress("city", e.target.value)}
                  aria-invalid={!!errors["address.city"]}
                  className="h-11 rounded-none bg-paper"
                />
              </Field>
            </div>

            <Field id="address-state" label="State" error={errors["address.state"]}>
              <Input
                id="address-state"
                autoComplete="address-level1"
                value={form.address.state}
                onChange={(e) => setAddress("state", e.target.value)}
                aria-invalid={!!errors["address.state"]}
                className="h-11 rounded-none bg-paper"
              />
            </Field>

            <div aria-live="polite" className="min-h-5 text-xs">
              {pinBusy && pincode.length === 6 && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Checking serviceability…
                </p>
              )}
              {!pinBusy && pin && (
                pin.serviceable ? (
                  <p className="text-green-700">
                    Delivers in {pin.standardDays[0]}–{pin.standardDays[1]} days
                    {pin.cod ? " · Cash on delivery available" : " · Online payment only"}
                  </p>
                ) : (
                  <p className="text-destructive">
                    We don&apos;t deliver to this pincode yet.{" "}
                    <a href={whatsappLink("Hi AIROVA! Do you deliver to this pincode?")} className="underline" target="_blank" rel="noopener noreferrer">
                      Ask us on WhatsApp
                    </a>
                  </p>
                )
              )}
            </div>
          </div>
        </Section>

        {/* 3 — shipping */}
        <Section n="3" title="Delivery method">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["STANDARD", "EXPRESS"] as const).map((method) => {
              const active = form.shipping === method;
              const fee = method === "EXPRESS" ? STORE.expressFee : summary.shipping;
              return (
                <label
                  key={method}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    active ? "border-ink bg-bone/60" : "border-line hover:border-ink/40",
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={method}
                    checked={active}
                    onChange={() => set("shipping", method)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-gold" : "border-line",
                    )}
                    aria-hidden
                  >
                    {active && <span className="size-2 rounded-full bg-gold" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {method === "EXPRESS" ? <Truck className="size-4" /> : <Package className="size-4" />}
                      {method === "EXPRESS" ? "Express" : "Standard"}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {method === "EXPRESS"
                        ? `${pin?.expressDays[0] ?? 1}–${pin?.expressDays[1] ?? 2} days, metro-first`
                        : `${pin?.standardDays[0] ?? 3}–${pin?.standardDays[1] ?? 6} days`}
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold tabular-nums">
                      {fee === 0 ? <span className="text-green-700">Free</span> : formatPrice(fee)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* 4 — payment */}
        <Section
          n="4"
          title="Payment"
          aside={
            <span className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
              <Lock className="size-3.5" /> Secure
            </span>
          }
        >
          <div className="grid gap-3">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                paymentMethod === "RAZORPAY" ? "border-ink bg-bone/60" : "border-line hover:border-ink/40",
              )}
            >
              <input
                type="radio"
                name="payment"
                value="RAZORPAY"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => set("paymentMethod", "RAZORPAY")}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                  paymentMethod === "RAZORPAY" ? "border-gold" : "border-line",
                )}
                aria-hidden
              >
                {paymentMethod === "RAZORPAY" && <span className="size-2 rounded-full bg-gold" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="size-4" />
                  UPI, cards, net banking & wallets
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Powered by Razorpay · you&apos;ll complete payment in a secure window
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {["UPI", "Visa", "Mastercard", "RuPay", "Net banking", "EMI"].map((tag) => (
                    <span
                      key={tag}
                      className="border border-line bg-paper px-2 py-0.5 text-[0.6rem] tracking-[0.1em] text-muted-foreground uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
            </label>

            <label
              className={cn(
                "flex items-start gap-3 border p-4 transition-colors",
                codBlocked
                  ? "cursor-not-allowed border-line/60 bg-bone/40 opacity-70"
                  : paymentMethod === "COD"
                    ? "border-ink bg-bone/60"
                    : "border-line hover:border-ink/40",
              )}
            >
              <input
                type="radio"
                name="payment"
                value="COD"
                disabled={codBlocked}
                checked={paymentMethod === "COD"}
                onChange={() => set("paymentMethod", "COD")}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                  paymentMethod === "COD" ? "border-gold" : "border-line",
                )}
                aria-hidden
              >
                {paymentMethod === "COD" && <span className="size-2 rounded-full bg-gold" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Banknote className="size-4" />
                  Cash on delivery
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {codBlocked
                    ? pin && !pin.serviceable
                      ? "Not available for this pincode"
                      : "Enter a serviceable pincode to enable COD"
                    : `${STORE.codFee ? `+${formatPrice(STORE.codFee)} handling · ` : ""}Pay the courier when your pair arrives`}
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5">
            <Field id="note" label="Order note (optional)" error={errors.note}>
              <Textarea
                id="note"
                rows={2}
                maxLength={240}
                value={form.note ?? ""}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Leave it with the guard, ring twice…"
                className="rounded-none bg-paper"
              />
            </Field>
          </div>

          {paymentFailed && (
            <div
              role="alert"
              className="mt-5 border border-destructive/40 bg-destructive/5 p-4 text-sm"
            >
              <p className="font-medium text-destructive">{paymentFailed}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button type="button" variant="ink" size="sm" onClick={() => setPaymentFailed(null)}>
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => set("paymentMethod", "COD")}
                >
                  Switch to COD
                </Button>
              </div>
            </div>
          )}
        </Section>

        <Button type="submit" variant="gold" size="xl" className="w-full" disabled={submitting || rzpBusy}>
          {submitting || rzpBusy ? (
            <>
              <Loader2 className="animate-spin" />
              Processing…
            </>
          ) : paymentMethod === "COD" ? (
            <>
              <BadgeIndianRupee />
              Place order · {formatPrice(summary.total)}
            </>
          ) : (
            <>
              <Lock />
              Pay {formatPrice(summary.total)}
            </>
          )}
        </Button>

        <p className="text-center text-[0.68rem] leading-relaxed text-muted-foreground">
          By placing this order you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">privacy policy</Link>.
        </p>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-line">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
              Your order · {lines.length} {lines.length === 1 ? "item" : "items"}
            </h2>
          </div>

          <ul className="max-h-72 divide-y divide-line overflow-y-auto px-4">
            {items.map(({ key, line }) => (
              <li key={key} className="flex gap-3 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden bg-bone">
                  <Image
                    src={cardImage(line.image)}
                    alt={line.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                  <span className="absolute top-0 right-0 grid size-5 place-items-center bg-ink text-[0.6rem] font-semibold text-cream tabular-nums">
                    {line.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {line.color} · UK {line.size}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(line.price * line.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-line p-4">
            <CouponField />
            <PriceSummary
              summary={summary}
              showFreeShippingBar={false}
              couponCode={coupon?.code}
              onRemoveCoupon={() => applyCoupon(null)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 border border-line bg-bone/60 p-4 text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" />
          <p>
            Free size exchange on your first order · 7-day returns · Need help?{" "}
            <a
              href={whatsappLink("Hi AIROVA! I need help with my order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-deep underline underline-offset-2"
            >
              WhatsApp us
            </a>
          </p>
        </div>

        <Separator className="my-4" />

        <Link
          href="/cart"
          className="block text-center text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase hover:text-ink"
        >
          ← Back to bag
        </Link>
      </aside>
    </form>
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        handler: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  }
}
