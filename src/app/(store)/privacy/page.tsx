import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/page-hero";
import { Prose } from "@/components/pages/prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How AIROVA FOOTWEAR collects, uses and protects your data — what we gather at checkout, cookies and analytics, payments handled by Razorpay, courier sharing, retention periods, your rights and our grievance officer.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE_DATE = "6 October 2026";

const PRIVACY_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE.url}/privacy#webpage`,
  name: `Privacy policy — ${SITE.name}`,
  url: `${SITE.url}/privacy`,
  inLanguage: "en-IN",
  dateModified: "2026-10-06",
  description:
    "Privacy policy for AIROVA FOOTWEAR covering data collection, cookies, analytics, payment processing, sharing, retention and your rights.",
  isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  about: { "@type": "Thing", name: "Privacy policy" },
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
  },
} as const;

const SECTIONS = [
  { id: "what-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use it" },
  { id: "cookies", label: "Cookies & analytics" },
  { id: "payments", label: "Payments" },
  { id: "sharing", label: "Sharing" },
  { id: "retention", label: "Retention" },
  { id: "your-rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "grievance", label: "Grievance officer" },
  { id: "changes", label: "Changes" },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PrivacyPage(_props: PageProps<"/privacy">) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRIVACY_JSONLD) }}
      />

      <PageHero
        eyebrow="Legal · Last updated 6 October 2026"
        title="Privacy policy"
        description="Plain English, no tricks: what we collect when you shop with AIROVA, why we need it, who else sees it, and the control you keep over it."
        breadcrumbs={[{ label: "Privacy policy", href: "/privacy" }]}
      />

      <div className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">On this page</p>
          <ol className="mt-4 space-y-2.5 border-l border-line pl-4">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-gold-deep"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Prose>
          <p className="text-sm text-muted-foreground">
            Effective {EFFECTIVE_DATE}. This policy applies to airova.in and every order placed
            with {SITE.legalName} (&ldquo;AIROVA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). It is
            written to meet the requirements of the Digital Personal Data Protection Act, 2023
            and the Information Technology Act, 2000 rules applicable to Indian e-commerce
            sellers.
          </p>

          <h2 id="what-we-collect">1. Information we collect</h2>
          <p>
            <strong> You give us.</strong> When you place an order or contact us we collect your
            name, email address, phone number, delivery address and pincode, order history, and
            whatever you write in a message or review. If you subscribe to our newsletter we
            store your email address and the welcome code issued against it.
          </p>
          <p>
            <strong> You browse.</strong> Like most sites, we record IP address, device and
            browser type, pages viewed, referral source and approximate city, so we can secure
            the site, spot fraud and understand what shoppers actually look for.
          </p>
          <p>
            <strong> You never give us.</strong> We do not collect Aadhaar numbers, biometrics,
            health data or your financial account credentials. Payment card details are entered
            on Razorpay&rsquo;s interface, never on ours.
          </p>

          <h2 id="how-we-use">2. How we use it</h2>
          <ul>
            <li>To accept, pack, ship and deliver your order, and to send tracking updates.</li>
            <li>To handle exchanges, returns, refunds, warranty claims and support replies.</li>
            <li>To verify delivery details and prevent fraudulent or duplicate orders.</li>
            <li>
              To improve the catalogue, sizing guidance and site experience using aggregated
              browsing patterns.
            </li>
            <li>
              To send drop alerts and offers — only where you have opted in, and every email
              carries a one-click unsubscribe.
            </li>
            <li>To meet accounting, GST and other record-keeping obligations under Indian law.</li>
          </ul>
          <p>We do not sell, rent or trade your personal data. Not now, not later.</p>

          <h2 id="cookies">3. Cookies &amp; analytics</h2>
          <p>
            <strong> Essential cookies</strong> keep your cart, wishlist and login session alive
            and remember your pincode. The site will not work properly without them.
          </p>
          <p>
            <strong> Analytics</strong> — we use Google Analytics 4 (GA4) to understand traffic
            and the Meta Pixel to measure which campaigns lead to sales. Both are configured to
            minimise data: IP anonymisation where the tool allows it, and no personalised
            advertising to minors. You can opt out with browser settings, Google&rsquo;s
            Analytics opt-out add-on, or by rejecting non-essential cookies in our cookie banner
            where it is shown.
          </p>
          <p>
            <strong> Third-party cookies</strong> may also be set by Razorpay during checkout and
            by social platforms when you open our Instagram profile from the site.
          </p>

          <h2 id="payments">4. Payments</h2>
          <p>
            All payments — UPI, credit and debit cards, net banking, wallets and Cash on
            Delivery — are processed by Razorpay Software Pvt. Ltd., a PCI-DSS Level 1 certified
            gateway. <strong>We never receive, store or see your card number, CVV, UPI PIN or
            net-banking password.</strong> Our server only stores the payment identifier, amount,
            method and status returned by Razorpay, plus your billing details for the invoice.
          </p>
          <p>
            Cash on Delivery orders are handled by the courier, who collects the amount at
            delivery; refunds for COD orders are transferred to a bank account you nominate.
          </p>

          <h2 id="sharing">5. When we share it</h2>
          <p>We share the minimum needed, with these parties only:</p>
          <ul>
            <li>
              <strong> Courier and logistics partners</strong> — name, phone number and address,
              so the parcel reaches you and reverse pickups can be scheduled.
            </li>
            <li>
              <strong> Razorpay</strong> — order amount and reference, to take and refund your
              payment.
            </li>
            <li>
              <strong> Hosting, email and analytics providers</strong> — acting under contract,
              on our instructions, with access limited to what the tool needs.
            </li>
            <li>
              <strong> Authorities</strong> — when disclosure is required by a court, a lawful
              request from a government body, or to protect the rights and safety of our
              customers and the business.
            </li>
          </ul>

          <h2 id="retention">6. How long we keep it</h2>
          <ul>
            <li>
              <strong> Order and invoice records</strong> — 8 years, because Indian tax and
              accounting rules require it.
            </li>
            <li>
              <strong> Support messages and call notes</strong> — 24 months from closure, so we
              can see the history if you write again.
            </li>
            <li>
              <strong> Marketing consent</strong> — until you unsubscribe, after which we keep
              only a suppression entry so we do not email you by mistake.
            </li>
            <li>
              <strong> Account profile</strong> — until you ask us to delete it, or after 24
              months of inactivity.
            </li>
          </ul>

          <h2 id="your-rights">7. Your rights</h2>
          <p>
            You can ask us for a summary of the personal data we hold, correct anything that is
            wrong, erase your data where we are not required to keep it, withdraw any consent you
            gave us, and nominate someone to exercise your rights on your behalf.
          </p>
          <p>
            Write to{" "}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from your registered
            email address and we will respond within 30 days. We may need to verify your identity
            first — that protects you as much as it protects us.
          </p>

          <h2 id="children">8. Children&rsquo;s privacy</h2>
          <p>
            AIROVA sells adult footwear and does not knowingly collect data from anyone under
            18. If you believe a minor has shared personal data with us, write to our grievance
            officer and we will delete it promptly.
          </p>

          <h2 id="grievance">9. Grievance officer</h2>
          <p>
            In line with the Information Technology Act, 2000 and its rules, complaints about
            privacy or data handling can be addressed to:
          </p>
          <p>
            <strong>Grievance Officer, {SITE.legalName}</strong>
            <br />
            {SITE.address.line1}
            <br />
            {SITE.address.line2}
            <br />
            Email: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
            <br />
            Phone: <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`}>{SITE.phone}</a>
          </p>
          <p>
            We acknowledge every complaint within 24 hours and aim to resolve it within 30 days,
            in line with the Information Technology (Reasonable Security Practices and Procedures
            and Sensitive Personal Data or Information) Rules, 2011.
          </p>

          <h2 id="changes">10. Changes to this policy</h2>
          <p>
            When we change anything material we will update this page, revise the
            &ldquo;last updated&rdquo; date at the top, and — for significant changes — email
            registered users before the change takes effect. Continuing to shop with AIROVA after
            an update means you accept the revised policy.
          </p>

          <hr />

          <p>
            Questions about this policy? Write to{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use our{" "}
            <Link href="/contact">contact form</Link> — we answer within one business day.
          </p>
        </Prose>
      </div>
    </>
  );
}
