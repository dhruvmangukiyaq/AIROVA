import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Rendered with a real 404 status when a collection slug doesn't exist. */
export default function CollectionNotFound() {
  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl">Collection not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        That edit isn&apos;t part of the line-up any more — browse every collection instead.
      </p>
      <div className="mt-8">
        <Button asChild variant="ink" size="lg">
          <Link href="/collections">All collections</Link>
        </Button>
      </div>
    </div>
  );
}
