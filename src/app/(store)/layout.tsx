import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getSession } from "@/lib/auth";

/**
 * Storefront shell: announcement strip → sticky header → page → footer,
 * plus the global cart drawer and WhatsApp float.
 */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <SiteHeader user={user} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}
