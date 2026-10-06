import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/store/cart";
import { WishlistProvider } from "@/store/wishlist";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@/components/analytics";
import { SITE, COMPANY_JSONLD } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "AIROVA",
    "footwear India",
    "premium sneakers",
    "sports shoes",
    "loafers",
    "men shoes",
    "women shoes",
    "running shoes India",
    "denim sneakers",
    "buy shoes online India",
  ],
  applicationName: SITE.name,
  manifest: "/site.webmanifest",
  authors: [{ name: SITE.legalName }],
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/images/brand/airova-logo.webp",
        width: 1254,
        height: 1254,
        alt: "AIROVA FOOTWEAR logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/images/brand/airova-logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(COMPANY_JSONLD) }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        {/* `reducedMotion="user"` makes every framer-motion animation honour
            prefers-reduced-motion — the CSS media query only covers CSS anims. */}
        <MotionConfig reducedMotion="user">
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </MotionConfig>
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "!rounded-none !border-line !bg-ink !text-cream !font-sans",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
