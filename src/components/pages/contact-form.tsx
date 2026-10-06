"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitContact } from "@/app/(store)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { cn } from "cn";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.75rem] text-destructive">
      {message}
    </p>
  );
}

const fieldClass =
  "mt-2 h-11 rounded-none border-line bg-background text-base placeholder:text-muted-foreground/70";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const busy = isSubmitting || isPending;

  const onSubmit = (values: ContactInput) => {
    startTransition(async () => {
      const res = await submitContact(values);
      if (res.ok) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="contact-form-heading"
      className="border border-line bg-paper p-6 sm:p-8"
    >
      <p className="eyebrow">Send a message</p>
      <h2 id="contact-form-heading" className="mt-3 text-2xl text-ink sm:text-3xl">
        We reply within one business day
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Order questions go faster on WhatsApp — for everything else, write to us here.
      </p>

      <div className="mt-7 grid gap-5">
        <div>
          <Label htmlFor="contact-name" className="text-[0.68rem] tracking-[0.2em] uppercase">
            Full name
          </Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Priya Sharma"
            className={cn(fieldClass, errors.name && "border-destructive")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="contact-name-error" message={errors.name?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-email" className="text-[0.68rem] tracking-[0.2em] uppercase">
              Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(fieldClass, errors.email && "border-destructive")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="contact-email-error" message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="contact-phone" className="text-[0.68rem] tracking-[0.2em] uppercase">
              Phone <span className="text-muted-foreground normal-case">(optional)</span>
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              className={cn(fieldClass, errors.phone && "border-destructive")}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              {...register("phone")}
            />
            <FieldError id="contact-phone-error" message={errors.phone?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="contact-subject" className="text-[0.68rem] tracking-[0.2em] uppercase">
            Subject
          </Label>
          <Input
            id="contact-subject"
            placeholder="Exchange for a bigger size — order #4821"
            className={cn(fieldClass, errors.subject && "border-destructive")}
            aria-invalid={errors.subject ? true : undefined}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            {...register("subject")}
          />
          <FieldError id="contact-subject-error" message={errors.subject?.message} />
        </div>

        <div>
          <Label htmlFor="contact-message" className="text-[0.68rem] tracking-[0.2em] uppercase">
            Message
          </Label>
          <Textarea
            id="contact-message"
            rows={6}
            placeholder="Tell us what you need — order number, size, pincode, anything that helps."
            className={cn(
              "mt-2 min-h-40 rounded-none border-line bg-background text-base placeholder:text-muted-foreground/70",
              errors.message && "border-destructive",
            )}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...register("message")}
          />
          <FieldError id="contact-message-error" message={errors.message?.message} />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <Button type="submit" variant="gold" size="lg" disabled={busy}>
          {busy ? (
            <>
              <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              Send message
              <ArrowRight data-icon="inline-end" className="size-4" />
            </>
          )}
        </Button>
        <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
          By sending you agree to our{" "}
          <Link
            href="/privacy"
            className="text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold-deep"
          >
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
