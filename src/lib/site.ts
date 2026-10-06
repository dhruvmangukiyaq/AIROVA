import { STORE } from "@/lib/commerce";

export const SITE = {
  name: STORE.name,
  legalName: "AIROVA Footwear",
  tagline: "Step Into Style",
  description:
    "AIROVA FOOTWEAR — premium sneakers, sports shoes and loafers for men and women in India. Shop the Aqua, Flare, Aero and Cinder collections. Free shipping over ₹2,999, COD available.",
  url: STORE.siteUrl,
  email: "hello@airova.in",
  supportEmail: "support@airova.in",
  phone: "+91 99999 99999",
  whatsapp: STORE.whatsapp,
  instagram: STORE.instagram,
  address: {
    line1: "Unit 402, Spectrum Business Park",
    line2: "Andheri East, Mumbai 400069, India",
  },
  gstin: "27AAECA1234F1Z5",
  currency: "INR",
  locale: "en-IN",
} as const;

export const NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Sports", href: "/shop?category=sports" },
  { label: "Sneakers", href: "/shop?category=sneakers" },
  { label: "Loafers", href: "/shop?category=loafers" },
  { label: "Collections", href: "/collections" },
] as const;

export const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Men", href: "/shop?gender=men" },
      { label: "Women", href: "/shop?gender=women" },
      { label: "New arrivals", href: "/shop?sort=newest" },
      { label: "Best sellers", href: "/shop?sort=popular" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & returns", href: "/shipping-and-returns" },
      { label: "Size guide", href: "/size-guide" },
      { label: "Track your order", href: "/account/orders" },
      { label: "WhatsApp us", href: `https://wa.me/${STORE.whatsapp}` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About AIROVA", href: "/about" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Admin", href: "/admin" },
    ],
  },
];

export const COMPANY_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ShoeStore",
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
  image: `${SITE.url}/images/brand/airova-logo.webp`,
  logo: `${SITE.url}/images/brand/airova-logo.webp`,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.line1,
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    postalCode: "400069",
    addressCountry: "IN",
  },
  sameAs: [SITE.instagram, `https://wa.me/${SITE.whatsapp}`],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "1284",
  },
} as const;
