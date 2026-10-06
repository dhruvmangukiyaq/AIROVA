"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Please check the email address.");
        setState("idle");
        return;
      }
      setState("done");
      toast.success("You're in! Check your inbox for the ₹200 code.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-3 border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-gold">
        <Check className="size-4" />
        Welcome aboard — your code is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-13 min-w-0 flex-1 border border-ink-line bg-ink-soft px-4 py-3.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/35 focus:border-gold"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex h-13 items-center justify-center gap-2 bg-gold px-7 py-3.5 text-[0.72rem] font-semibold tracking-[0.18em] text-ink uppercase transition-colors hover:bg-gold-bright disabled:opacity-60"
        >
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Subscribe <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      <p className="mt-2.5 text-[0.68rem] text-cream/40">
        By subscribing you agree to our privacy policy. Unsubscribe anytime.
      </p>
    </form>
  );
}
