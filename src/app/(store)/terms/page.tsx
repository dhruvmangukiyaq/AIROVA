import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/page-hero";
import { Prose } from "@/components/pages/prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms on which AIROVA FOOTWEAR sells to you — eligibility, pricing in INR with GST, order acceptance, Razorpay and COD payment, shipping, returns, intellectual property, liability and Mumbai jurisdiction. GSTIN 27AAECA1234F1Z5.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE_DATE = "6 October 2026";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance" },
  { id: "eligibility", label: "2. Eligibility & account" },
  { id: "products", label: "3. Products & pricing" },
  { id: "orders", label: "4. Orders" },
  { id: "payment", label: "5. Payment" },
  { id: "shipping", label: "6. Shipping" },
  { id: "returns", label: "7. Returns" },
  { id: "ip", label: "8. Intellectual property" },
  { id: "prohibited", label: "9. Prohibited use" },
  { id: "liability", label: "10. Liability" },
  { id: "indemnity", label: "11. Indemnity" },
  { id: "law", label: "12. Governing law" },
  { id: "grievance", label: "13. Grievance officer" },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function TermsPage(_props: PageProps<"/terms">) {
  return (
    <>
      <PageHero
        eyebrow="Legal · Last updated 6 October 2026"
        title="Terms of service"
        description="The agreement between you and AIROVA FOOTWEAR when you browse this site or place an order — written to be read, not skipped."
        breadcrumbs={[{ label: "Terms of service", href: "/terms" }]}
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
            Effective {EFFECTIVE_DATE}. These terms govern your use of airova.in and every
            purchase from {SITE.legalName} (&ldquo;AIROVA&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;), GSTIN{" "}
            <strong className="tracking-wide">{SITE.gstin}</strong>. By placing an order you
            accept these terms in full.
          </p>

          <h2 id="acceptance">1. Acceptance of these terms</h2>
          <p>
            Reading, browsing or buying on this site constitutes acceptance of these terms and of
            our <Link href="/privacy">privacy policy</Link> and{" "}
            <Link href="/shipping-and-returns">shipping &amp; returns policy</Link>, which are
            incorporated by reference. If you do not agree, please do not use the site. We may
            update these terms from time to time; the version in force is the one dated at the
            top of this page when you order.
          </p>

          <h2 id="eligibility">2. Eligibility &amp; account</h2>
          <p>
            You must be 18 years or older, or transact through a parent or guardian, and capable
            of entering into a binding contract under Indian law. You are responsible for keeping
            your password and account activity confidential, and for telling us at once about any
            unauthorised use. We may suspend an account where we reasonably believe it is being
            used for fraud, resale at scale or any activity prohibited by these terms.
          </p>

          <h2 id="products">3. Products &amp; pricing</h2>
          <p>
            All prices are in Indian Rupees (₹) and are inclusive of GST unless stated otherwise.
            Product colours can vary slightly between screens and the light in which a photo was
            taken; leather and denim are natural materials, so grain and wash variations are part
            of the product, not a defect.
          </p>
          <p>
            Despite our care, pricing or stock errors can happen. If a product is listed at an
            incorrect price or marked available in error, we may cancel the order and refund you
            in full, even after an order confirmation email. We will always tell you before the
            item ships. MRP, discounts and offers shown on the site are valid only for the
            period stated and cannot be combined unless the offer says so.
          </p>

          <h2 id="orders">4. Orders &amp; acceptance</h2>
          <p>
            An order is an offer to buy. You will receive an automated confirmation, but the
            contract is formed only when we dispatch the parcel. We may decline or cancel an order
            for reasons including stock availability, suspicion of fraud, a mismatch between the
            billing and delivery address, or restrictions on delivery to your pincode. In every
            such case any amount collected is refunded to the original payment method.
          </p>

          <h2 id="payment">5. Payment</h2>
          <p>
            Payments are collected through Razorpay, supporting UPI, credit and debit cards, net
            banking and wallets. Cash on Delivery is available on serviceable pincodes; any COD
            fee applicable is shown at checkout before you confirm. Card and banking credentials
            are entered on Razorpay&rsquo;s secure interface and are never visible to us.
          </p>
          <p>
            Title to the goods passes to you when we receive payment in full; risk passes when
            the parcel is delivered to you or your nominee at the address you provided.
          </p>

          <h2 id="shipping">6. Shipping</h2>
          <p>
            Dispatch, delivery estimates, shipping charges and the free-shipping threshold are
            set out in our <Link href="/shipping-and-returns">shipping &amp; returns policy</Link>.
            Dates are estimates, not guarantees — we are not liable for delays caused by couriers,
            weather, strikes, festivals or events outside our reasonable control. Risk of loss for
            items lost in transit lies with us until delivery is marked complete by the courier.
          </p>

          <h2 id="returns">7. Returns, exchanges &amp; warranty</h2>
          <p>
            You may raise a return or size exchange within 7 days of delivery, provided the pair
            is unworn outdoors and complete with its original packaging. Refunds are made to the
            original payment method within the timelines published in our shipping &amp; returns
            policy. Separately, every pair carries a 90-day warranty against manufacturing defects
            in stitching, sole adhesion and hardware; normal wear, misuse and damage from
            chemicals or heat are excluded.
          </p>

          <h2 id="ip">8. Intellectual property</h2>
          <p>
            The AIROVA name, wordmark, gold-line logo, product photography, copy, lookbooks and
            site design belong to {SITE.legalName} and are protected under the Trade Marks Act,
            1999 and the Copyright Act, 1957. You may view and print pages for personal,
            non-commercial use. Reselling, scraping, reproducing or using our content to train
            commercial models, or to sell counterfeit goods, is prohibited.
          </p>

          <h2 id="prohibited">9. Prohibited use</h2>
          <ul>
            <li>Using the site for any unlawful, fraudulent or misleading purpose.</li>
            <li>Placing automated or bulk orders intended for unauthorised resale.</li>
            <li>Attempting to gain unauthorised access to accounts, servers or data.</li>
            <li>Interfering with the site&rsquo;s security, integrity or performance.</li>
            <li>Reproducing any content, or removing copyright or trademark notices.</li>
          </ul>

          <h2 id="liability">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, our total liability for any claim arising out
            of your purchase is limited to the amount you paid for the item in question. We are
            not liable for indirect, incidental or consequential losses — loss of profit, loss of
            data, or business interruption — however caused. Nothing in these terms limits
            liability for death, personal injury caused by negligence, or any liability that
            cannot be excluded under the Consumer Protection Act, 2019.
          </p>

          <h2 id="indemnity">11. Indemnity</h2>
          <p>
            You agree to indemnify and hold {SITE.legalName} harmless from any claim, demand or
            loss arising out of your breach of these terms, your misuse of the site, or any
            content you submit to us — including reviews posted in bad faith or infringing
            third-party rights.
          </p>

          <h2 id="law">12. Governing law &amp; jurisdiction</h2>
          <p>
            These terms are governed by the laws of India. Any dispute arising from them or from a
            purchase shall be subject to the exclusive jurisdiction of the courts at Mumbai,
            Maharashtra. Before starting proceedings, please write to us — most issues are settled
            in a single conversation.
          </p>

          <h2 id="grievance">13. Grievance officer</h2>
          <p>
            Complaints under the Information Technology Act, 2000 and the Consumer Protection
            Act, 2019 may be addressed to:
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
            We acknowledge complaints within 24 hours and work to resolve them within 30 days.
            You may also escalate to the consumer forum having jurisdiction over your place of
            residence.
          </p>

          <hr />

          <p>
            Questions about these terms? Write to{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, call{" "}
            <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`}>{SITE.phone}</a>, or use our{" "}
            <Link href="/contact">contact form</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}
