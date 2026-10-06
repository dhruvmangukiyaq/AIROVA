import { getSession } from "@/lib/auth";
import { AccountShell } from "@/components/account/account-shell";

/**
 * `/account/**` chrome — sidebar on desktop, scrolling tab row on mobile.
 *
 * Guests receive the bare children: `/account/login` and `/account/register`
 * render here, while every other page in this subtree calls
 * `requireAccount(next)`, which bounces to `/account/login?next=…`. A layout
 * cannot tell which child it is rendering, so the redirect — with an accurate
 * `next` — lives with the page instead.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>;

  return <AccountShell user={session}>{children}</AccountShell>;
}
