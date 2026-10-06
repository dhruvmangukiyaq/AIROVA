"use client";

import { useState, useTransition } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/lib/format";
import type { ReviewDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewSummary {
  total: number;
  avg: number;
  dist: number[];
}

function Distribution({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = summary.dist[star - 1] ?? 0;
        const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="w-8 text-muted-foreground tabular-nums">{star} ★</span>
            <span className="h-1.5 flex-1 bg-line">
              <span
                className="block h-full bg-gold transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="w-6 text-right text-muted-foreground tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewForm({
  productId,
  onDone,
}: {
  productId: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", title: "", body: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Enter a valid email";
    if (form.title.trim().length < 3) next.title = "Add a short title";
    if (form.body.trim().length < 10) next.body = "Tell us a little more (10+ characters)";
    setErrors(next);
    if (Object.keys(next).length) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, rating, ...form }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          toast.error(data.error ?? "Could not submit your review");
          return;
        }
        toast.success("Thanks — your review is pending moderation");
        setOpen(false);
        setForm({ name: "", email: "", title: "", body: "" });
        onDone();
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ink">Write a review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">Share your pair</p>
          <DialogTitle className="text-2xl">Write a review</DialogTitle>
          <DialogDescription>
            Reviews are moderated and typically appear within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="review-rating" className="text-[0.65rem] tracking-[0.16em] uppercase">
              Your rating
            </Label>
            <div className="mt-2 flex gap-1" id="review-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(value)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      (hover || rating) >= value ? "fill-gold text-gold" : "fill-line text-line",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="review-name" className="text-[0.65rem] tracking-[0.16em] uppercase">
                Name
              </Label>
              <Input id="review-name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-email" className="text-[0.65rem] tracking-[0.16em] uppercase">
                Email
              </Label>
              <Input
                id="review-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-title" className="text-[0.65rem] tracking-[0.16em] uppercase">
              Title
            </Label>
            <Input
              id="review-title"
              placeholder="Best sneakers I've owned"
              value={form.title}
              onChange={set("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-body" className="text-[0.65rem] tracking-[0.16em] uppercase">
              Review
            </Label>
            <Textarea
              id="review-body"
              rows={4}
              placeholder="Fit, comfort, build quality…"
              value={form.body}
              onChange={set("body")}
              aria-invalid={!!errors.body}
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewSection({
  productId,
  summary,
  reviews,
}: {
  productId: string;
  summary: ReviewSummary;
  reviews: ReviewDTO[];
}) {
  const [version, setVersion] = useState(0);

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14">
      <div>
        <div className="border border-line bg-bone/60 p-6">
          <p className="text-5xl leading-none tabular-nums">{summary.avg.toFixed(1)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            out of 5 · {summary.total} {summary.total === 1 ? "review" : "reviews"}
          </p>
          <div className="mt-4">
            <Distribution summary={summary} />
          </div>
          <div className="mt-6">
            <ReviewForm
              productId={productId}
              onDone={() => setVersion((v) => v + 1)}
            />
          </div>
        </div>
      </div>

      <div key={version}>
        {reviews.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-14 text-center">
            <p className="text-lg">No reviews yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to tell us how this pair wears in.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {reviews.map((review) => (
              <li key={review.id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < review.rating ? "fill-gold text-gold" : "fill-line text-line",
                            )}
                          />
                        ))}
                      </span>
                      {review.verified && (
                        <span className="border border-green-700/30 bg-green-50 px-1.5 py-0.5 text-[0.58rem] font-semibold tracking-[0.12em] text-green-700 uppercase">
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-medium">{review.title}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-medium text-ink">{review.name}</p>
                    <p className="tabular-nums">{formatOrderDate(review.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
                  onClick={() => toast.success("Thanks for the feedback")}
                >
                  <ThumbsUp className="size-3.5" /> Helpful
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
