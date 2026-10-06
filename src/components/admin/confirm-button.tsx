"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "cn";

type ButtonVariant = NonNullable<React.ComponentProps<typeof Button>["variant"]>;
type ButtonSize = NonNullable<React.ComponentProps<typeof Button>["size"]>;

/**
 * Destructive / irreversible action behind an explicit confirmation dialog.
 * `onConfirm` may be async (server action); the button shows a busy state.
 */
export function ConfirmButton({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "destructive",
  size = "sm",
  className,
  children,
  disabled,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || busy}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none border-ink-line bg-[#131317] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">{title}</DialogTitle>
            <DialogDescription className="text-cream/55">{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm" disabled={busy}>
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={variant}
              size="sm"
              disabled={busy}
              onClick={run}
              className={cn(busy && "opacity-70")}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
