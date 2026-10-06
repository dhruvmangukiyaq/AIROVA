"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/actions/account";
import { IDLE_STATE, firstError, formError } from "@/actions/state";
import { checkPincode } from "@/lib/commerce";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/account/confirm-dialog";
import { FormField } from "@/components/account/form-fields";
import { cn } from "cn";

export interface AddressDTO {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const LABELS = ["Home", "Work", "Other"];

/* ------------------------------------------------------------------ */
/* The add/edit form, shown inside a dialog                             */
/* ------------------------------------------------------------------ */

function AddressForm({
  address,
  onDone,
}: {
  address: AddressDTO | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveAddress, IDLE_STATE);
  const [pincode, setPincode] = useState(address?.pincode ?? "");
  const handled = useRef(false);

  const delivery = pincode.length === 6 ? checkPincode(pincode) : null;

  useEffect(() => {
    if (handled.current) return;
    const message = formError(state);
    if (state.ok) {
      handled.current = true;
      toast.success(address ? "Address updated" : "Address saved", {
        description: address
          ? "Your changes are live across checkout and orders."
          : "You can pick it the next time you check out.",
      });
      onDone();
      return;
    }
    if (message || state.fieldErrors) {
      document.querySelector<HTMLElement>("#address-form [aria-invalid='true']")?.focus();
    }
  }, [state, address, onDone]);

  const message = formError(state);

  return (
    <form action={formAction} id="address-form" noValidate className="grid gap-5">
      {address && <input type="hidden" name="id" value={address.id} />}
      {message && (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/8 px-4 py-3 text-[0.78rem] leading-relaxed text-destructive"
        >
          {message}
        </p>
      )}

      <fieldset className="grid gap-2">
        <legend className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
          Save as
        </legend>
        <div className="flex gap-2">
          {LABELS.map((label) => (
            <label
              key={label}
              className={cn(
                "flex h-10 cursor-pointer items-center gap-2 border px-4 text-[0.72rem] font-semibold tracking-[0.14em] uppercase transition-colors",
                (address?.label ?? "Home") === label
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-background text-muted-foreground hover:border-gold hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="label"
                value={label}
                defaultChecked={(address?.label ?? "Home") === label}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField
        id="address-name"
        label="Recipient name"
        name="name"
        autoComplete="name"
        placeholder="e.g. Dhruv Mangukiya"
        defaultValue={address?.name ?? ""}
        required
        error={firstError(state, "name")}
      />

      <FormField
        id="address-phone"
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="10-digit mobile number"
        defaultValue={address?.phone ?? ""}
        required
        error={firstError(state, "phone")}
      />

      <FormField
        id="address-line1"
        label="House, street & area"
        name="line1"
        autoComplete="address-line1"
        placeholder="Flat / house no., street, landmark"
        defaultValue={address?.line1 ?? ""}
        required
        error={firstError(state, "line1")}
      />

      <FormField
        id="address-line2"
        label="Area, village (optional)"
        name="line2"
        autoComplete="address-line2"
        placeholder="Neighbourhood, area"
        defaultValue={address?.line2 ?? ""}
        error={firstError(state, "line2")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="address-city"
          label="City"
          name="city"
          autoComplete="address-level2"
          placeholder="City"
          defaultValue={address?.city ?? ""}
          required
          error={firstError(state, "city")}
        />
        <FormField
          id="address-state"
          label="State"
          name="state"
          autoComplete="address-level1"
          placeholder="State"
          defaultValue={address?.state ?? ""}
          required
          error={firstError(state, "state")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="address-pincode"
          label="Pincode"
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          error={firstError(state, "pincode")}
        />
        <div className="grid content-start gap-2">
          <span className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
            Delivery check
          </span>
          <div
            aria-live="polite"
            className="flex min-h-11 items-center border border-line bg-bone px-3 text-[0.75rem] leading-relaxed text-muted-foreground"
          >
            {!delivery ? (
              "Enter a pincode to check serviceability."
            ) : delivery.serviceable ? (
              <span className="text-ink">
                <Check className="mr-1.5 inline size-3.5 text-green-700" aria-hidden />
                Delivers in {delivery.standardDays[0]}–{delivery.standardDays[1]} days
                {delivery.cod ? " · COD available" : " · Prepaid only"}
              </span>
            ) : (
              "We do not deliver to this pincode yet."
            )}
          </div>
        </div>
      </div>

      <label
        htmlFor="address-default"
        className="flex cursor-pointer items-start gap-2.5 text-[0.78rem] leading-relaxed text-muted-foreground"
      >
        <input
          id="address-default"
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="mt-0.5 size-4 shrink-0 accent-[#c8a45d]"
        />
        Make this my default delivery address
      </label>

      <DialogFooter className="gap-2 pt-1 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-none border-line bg-transparent"
          onClick={onDone}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="gold" disabled={pending} className="rounded-none">
          {pending ? <Loader2 data-icon="inline-start" className="size-4 animate-spin" /> : null}
          {address ? "Save changes" : "Save address"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Grid + actions                                                       */
/* ------------------------------------------------------------------ */

export function AddressManager({ addresses }: { addresses: AddressDTO[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AddressDTO | null>(null);
  const [pending, startTransition] = useTransition();

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (address: AddressDTO) => {
    setEditing(address);
    setDialogOpen(true);
  };

  const makeDefault = (address: AddressDTO) => {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (result.ok) toast.success("Default address updated");
      else toast.error(result.error ?? "Could not update the default address.");
    });
  };

  const remove = (address: AddressDTO) => {
    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.ok) toast.success("Address removed");
      else toast.error(result.error ?? "Could not remove that address.");
    });
  };

  if (!addresses.length) {
    return (
      <div className="flex flex-col items-start gap-4 border border-line bg-paper p-8">
        <MapPin className="size-6 text-gold" aria-hidden />
        <div>
          <h2 className="text-xl text-ink">No saved addresses</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Save one now and checkout becomes a two-click affair — no re-typing your
            pincode every time.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openAdd}>
          <Plus data-icon="inline-start" className="size-3.5" /> Add address
        </Button>
        <AddressDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          address={editing}
          onDone={() => setDialogOpen(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {addresses.map((address) => (
          <article
            key={address.id}
            className={cn(
              "relative flex flex-col border bg-paper p-5",
              address.isDefault ? "border-gold" : "border-line",
            )}
          >
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[0.62rem] font-semibold tracking-[0.2em] text-ink uppercase">
                  {address.label}
                </span>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 border border-gold/60 bg-gold/12 px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.16em] text-gold-deep uppercase">
                    <Star className="size-3" aria-hidden /> Default
                  </span>
                )}
              </div>
            </header>

            <address className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground not-italic">
              <span className="block font-medium text-ink">{address.name}</span>
              {address.line1}
              {address.line2 ? <>, {address.line2}</> : null}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              <span className="tabular-nums">+91 {address.phone}</span>
            </address>

            <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => openEdit(address)}
                disabled={pending}
              >
                <Pencil data-icon="inline-start" className="size-3" /> Edit
              </Button>
              {!address.isDefault && (
                <Button
                  type="button"
                  variant="gold-outline"
                  size="xs"
                  onClick={() => makeDefault(address)}
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending ? (
                    <Loader2 data-icon="inline-start" className="size-3 animate-spin" />
                  ) : null}
                  Set as default
                </Button>
              )}
              <ConfirmDialog
                title="Remove this address?"
                description={`${address.label} — ${address.line1}, ${address.city} will be deleted from your account.`}
                confirmLabel="Remove"
                destructive
                onConfirm={() => remove(address)}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={pending}
                  >
                    <Trash2 data-icon="inline-start" className="size-3" /> Remove
                  </Button>
                }
              />
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <Button type="button" variant="gold" size="sm" onClick={openAdd}>
          <Plus data-icon="inline-start" className="size-3.5" /> Add another address
        </Button>
      </div>

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
        onDone={() => setDialogOpen(false)}
      />
    </>
  );
}

function AddressDialog({
  open,
  onOpenChange,
  address,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: AddressDTO | null;
  onDone: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {address ? "Edit address" : "Add an address"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Used for delivery updates and the checkout address line-up.
          </DialogDescription>
        </DialogHeader>
        <AddressForm key={address?.id ?? "new"} address={address} onDone={onDone} />
      </DialogContent>
    </Dialog>
  );
}
