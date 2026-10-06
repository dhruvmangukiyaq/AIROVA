import {
  BadgeIndianRupee,
  BarChart3,
  KeyRound,
  Mail,
  MessageCircle,
  Settings2,
  Truck,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { STORE } from "@/lib/commerce";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";

export const metadata = { title: "Settings" };

/** Shows the shape of a secret without leaking it — last 4 chars only. */
function mask(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  tone?: "ok" | "off";
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-[0.66rem] tracking-[0.14em] text-cream/45 uppercase">
        {label}
      </span>
      <span
        className={`min-w-0 break-all text-right text-sm ${mono ? "font-mono text-[0.72rem]" : ""} ${
          tone === "ok"
            ? "text-[#a9c9a0]"
            : tone === "off"
              ? "text-cream/35"
              : "text-cream/85"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const env = (key: string, fallback = "") => process.env[key] ?? fallback;

export default async function AdminSettingsPage() {
  await requireAdmin();

  const razorpayKeyId = env("RAZORPAY_KEY_ID") || env("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  const razorpayConfigured = Boolean(env("RAZORPAY_KEY_SECRET"));
  const ga4 = env("NEXT_PUBLIC_GA4_MEASUREMENT_ID");
  const metaPixel = env("NEXT_PUBLIC_META_PIXEL_ID");
  const resend = env("RESEND_API_KEY");
  const emailFrom = env("EMAIL_FROM", "AIROVA FOOTWEAR <orders@airova.in>");
  const siteUrl = STORE.siteUrl;

  const paymentsTone = razorpayConfigured ? "ok" : "off";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Read-only view of the environment this admin runs on. Change values in .env, then restart the server."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Store profile"
            hint="Baked into src/lib/commerce.ts"
            action={<Settings2 className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row label="Name" value={STORE.name} />
            <Row label="Tagline" value={STORE.tagline} />
            <Row label="Site url" value={siteUrl} mono />
            <Row label="Currency" value="INR (₹) — all prices in paise-free rupees" />
            <Row
              label="Size run"
              value={`UK ${STORE.sizes.join(", ")}`}
              mono
            />
            <Row
              label="Price band"
              value={`${formatPrice(STORE.minPrice)} – ${formatPrice(STORE.maxPrice)}`}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Shipping & fees"
            hint="NEXT_PUBLIC_* env vars read at build time"
            action={<Truck className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row label="Free shipping over" value={formatPrice(STORE.freeShippingThreshold)} />
            <Row label="Standard fee" value={formatPrice(STORE.shippingFee)} />
            <Row label="Express fee" value={formatPrice(STORE.expressFee)} />
            <Row
              label="COD fee"
              value={STORE.codFee > 0 ? formatPrice(STORE.codFee) : "Waived"}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Payments · Razorpay"
            hint="Secrets stay server-side; only the key id is referenced by the browser"
            action={<KeyRound className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row
              label="Key id"
              value={razorpayKeyId ? mask(razorpayKeyId) : "Not set"}
              mono
              tone={razorpayKeyId ? undefined : "off"}
            />
            <Row
              label="Key secret"
              value={razorpayConfigured ? "Configured" : "Not set"}
              tone={paymentsTone}
            />
            <Row
              label="Webhook secret"
              value={env("RAZORPAY_WEBHOOK_SECRET") ? "Configured" : "Not set"}
              tone={env("RAZORPAY_WEBHOOK_SECRET") ? "ok" : "off"}
            />
            <Row
              label="Mode"
              value={razorpayConfigured ? "Live gateway" : "Simulate (no gateway calls)"}
              tone={paymentsTone}
            />
          </div>
          <p className="border-t border-ink-line px-5 py-3.5 text-xs leading-relaxed text-cream/45">
            With empty keys, checkout runs in simulation mode: orders complete
            without real money moving. Add test keys from the Razorpay dashboard
            to exercise the full payment flow.
          </p>
        </Panel>

        <Panel>
          <PanelHeader
            title="Analytics"
            hint="Empty ids keep the trackers silent"
            action={<BarChart3 className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row
              label="GA4 measurement"
              value={ga4 || "Not configured"}
              mono
              tone={ga4 ? undefined : "off"}
            />
            <Row
              label="Meta pixel"
              value={metaPixel || "Not configured"}
              mono
              tone={metaPixel ? undefined : "off"}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Email"
            hint="Order confirmations and shipping updates"
            action={<Mail className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row label="From" value={emailFrom} mono />
            <Row
              label="Resend key"
              value={resend ? "Configured" : "Not set — emails log to the dev console"}
              tone={resend ? "ok" : "off"}
            />
            <Row
              label="SMTP fallback"
              value={env("SMTP_HOST") ? env("SMTP_HOST") : "Not configured"}
              mono
              tone={env("SMTP_HOST") ? undefined : "off"}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="WhatsApp & social"
            hint="Used by support links and the footer"
            action={<MessageCircle className="size-4 text-gold/70" aria-hidden />}
          />
          <div className="divide-y divide-ink-line px-5 py-2">
            <Row label="WhatsApp" value={`+${STORE.whatsapp}`} mono />
            <Row label="Instagram" value={STORE.instagram} mono />
          </div>
          <div className="border-t border-ink-line px-5 py-3.5">
            <MicroLabel>Environment file</MicroLabel>
            <p className="mt-1.5 text-xs leading-relaxed text-cream/45">
              Every value above comes from <span className="font-mono text-cream/70">.env</span>{" "}
              (see <span className="font-mono text-cream/70">.env.example</span> for the
              full list). Edit the file, restart <span className="font-mono text-cream/70">npm run dev</span>,
              and this page reflects the new configuration. Secrets such as{" "}
              <span className="font-mono text-cream/70">AUTH_SECRET</span> and{" "}
              <span className="font-mono text-cream/70">RAZORPAY_KEY_SECRET</span> are
              never sent to the browser.
            </p>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Admin access"
          hint="Session and role handling"
          action={<BadgeIndianRupee className="size-4 text-gold/70" aria-hidden />}
        />
        <div className="grid gap-4 px-5 py-5 text-sm sm:grid-cols-3">
          <div>
            <MicroLabel>Session</MicroLabel>
            <p className="mt-1 text-cream/70">
              Signed JWT cookie, HTTP-only, rotated on login.
            </p>
          </div>
          <div>
            <MicroLabel>Guard</MicroLabel>
            <p className="mt-1 text-cream/70">
              <span className="font-mono text-[0.72rem] text-cream/85">
                requireAdmin()
              </span>{" "}
              protects every /admin route and server action.
            </p>
          </div>
          <div>
            <MicroLabel>Roles</MicroLabel>
            <p className="mt-1 text-cream/70">
              Grant or revoke admin from any customer on their profile page.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
