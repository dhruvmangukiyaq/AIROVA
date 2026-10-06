import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
import { AccountHeading } from "@/components/account/account-heading";
import { ReviewDeleteButton } from "@/components/account/review-actions";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "My reviews",
  description: "Read, edit and remove the product reviews you have written at AIROVA.",
  alternates: { canonical: "/account/reviews" },
};

const STATUS_STYLE: Record<string, string> = {
  published: "border-green-700/40 bg-green-700/10 text-green-800",
  pending: "border-gold/60 bg-gold/12 text-gold-deep",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  pending: "In moderation",
  rejected: "Not approved",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          aria-hidden
          className={cn("size-3.5", step <= rating ? "fill-gold text-gold" : "text-line")}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const session = await requireAccount("/account/reviews");

  const reviews = await db.review.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true, images: true, active: true } },
    },
  });

  const published = reviews.filter((review) => review.status === "published").length;

  return (
    <>
      <AccountHeading
        eyebrow="Your reviews"
        title="Reviews you've written"
        description={
          reviews.length
            ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} · ${published} published. Reviews help other shoppers pick the right size.`
            : "Share how a pair fits and wears — it genuinely helps the next buyer."
        }
        actions={
          <Button variant="gold-outline" size="sm" asChild>
            <Link href="/shop">
              <MessageSquareQuote data-icon="inline-start" className="size-3.5" />
              Review a product
            </Link>
          </Button>
        }
      />

      {reviews.length ? (
        <ul className="grid gap-5">
          {reviews.map((review) => {
            const images: string[] = JSON.parse(review.product.images || "[]");
            const image = images[0] ?? "";
            const status = STATUS_LABEL[review.status] ? review.status : "pending";

            return (
              <li key={review.id} className="border border-line bg-paper">
                <div className="flex flex-wrap items-start gap-4 border-b border-line px-5 py-4">
                  <span className="img-well size-16 shrink-0 bg-bone">
                    {image ? (
                      <Image
                        src={image}
                        alt={review.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="link-underline text-sm text-ink"
                      >
                        {review.product.name}
                      </Link>
                      <span
                        className={cn(
                          "inline-flex border px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.16em] uppercase",
                          STATUS_STYLE[status],
                        )}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                      {review.verified && (
                        <span className="text-[0.58rem] font-semibold tracking-[0.16em] text-green-800 uppercase">
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {formatOrderDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <h2 className="font-display text-lg text-ink">{review.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  {!review.product.active && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      This product is no longer listed, so the review is hidden from the
                      shop.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
                  <WriteLink slug={review.product.slug} />
                  <ReviewDeleteButton id={review.id} productName={review.product.name} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-4 border border-line bg-paper p-8">
          <MessageSquareQuote className="size-6 text-gold" aria-hidden />
          <div>
            <h2 className="text-xl text-ink">No reviews yet</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Bought a pair you love (or don&apos;t)? Your review shows up on the product
              page and in this list.
            </p>
          </div>
          <Button variant="gold" size="sm" asChild>
            <Link href="/shop">Find a product to review</Link>
          </Button>
        </div>
      )}
    </>
  );
}

/** Kept as a tiny server component so the list markup stays readable. */
function WriteLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/product/${slug}#reviews`}
      className="link-underline text-[0.68rem] font-semibold tracking-[0.16em] text-ink uppercase hover:text-gold-deep"
    >
      Open on product page
    </Link>
  );
}
