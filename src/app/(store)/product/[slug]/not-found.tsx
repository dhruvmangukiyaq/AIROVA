import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Rendered with a real 404 status when a product slug doesn't exist. */
export default function ProductNotFound() {
  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl">This pair has moved on</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The style you&apos;re looking for is no longer listed. Browse the full line-up instead.
      </p>
      <div className="mt-8 max-w-md">
        <Button asChild variant="ink" size="lg">
          <Link href="/shop">Shop all footwear</Link>
        </Button>
      </div>
    </div>
  );
}
