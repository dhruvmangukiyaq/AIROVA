import Image from "next/image";
import Link from "next/link";
import { Search, Home, ArrowRight } from "lucide-react";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="shell flex items-center justify-between border-b border-line py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/brand/airova-monogram-transparent.png"
            alt=""
            width={40}
            height={36}
            className="h-9 w-auto"
          />
          <span className="text-[0.7rem] font-semibold tracking-[0.24em] uppercase">
            {SITE.name}
          </span>
        </Link>
        <Button variant="ink" size="sm" asChild>
          <Link href="/shop">Shop all</Link>
        </Button>
      </header>

      <main className="shell flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-6xl leading-none sm:text-8xl">
          <span className="text-gold-gradient">Lost</span> your step
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re after has been moved, renamed or never existed. Your bag is safe —
          let&apos;s get you back to the good stuff.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="gold" size="lg" asChild>
            <Link href="/">
              <Home /> Back home
            </Link>
          </Button>
          <Button variant="ink" size="lg" asChild>
            <Link href="/shop">
              <Search /> Browse footwear <ArrowRight />
            </Link>
          </Button>
        </div>

        <nav aria-label="Popular pages" className="mt-14 w-full max-w-3xl border-t border-line pt-8">
          <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
            Popular destinations
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm">
            {[...FOOTER_LINKS[0].links, ...FOOTER_LINKS[1].links.slice(0, 3)].map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="link-underline text-ink/80 hover:text-gold-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="shell border-t border-line py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.legalName} · {SITE.address.line2}
      </footer>
    </div>
  );
}
