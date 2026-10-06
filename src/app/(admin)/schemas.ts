import { z } from "zod";
import { couponSchema } from "@/lib/validators";

/** Slugs are optional on input — the server derives them from the name. */
const slugField = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
  .optional()
  .or(z.literal(""));

export const collectionSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(40),
  slug: slugField,
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  story: z.string().trim().max(1200).optional().or(z.literal("")),
  image: z.string().trim().max(240).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0, "Cannot be negative").max(999),
  active: z.boolean(),
});
export type CollectionInput = z.infer<typeof collectionSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(40),
  slug: slugField,
  description: z.string().trim().max(300).optional().or(z.literal("")),
  image: z.string().trim().max(240).optional().or(z.literal("")),
  active: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

/**
 * `couponSchema` with a widened `value` ceiling so FIXED discounts can exceed
 * ₹100 — the shared schema caps at 100, which is right for PERCENT only.
 */
export const adminCouponSchema = couponSchema
  .extend({ value: z.number().int().min(0, "Cannot be negative").max(100000) })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, {
    message: "Percentage discounts cannot exceed 100%",
    path: ["value"],
  });

/** Every admin action resolves to one of these — client code branches on `ok`. */
export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
}

/** State shape returned by `loginAdmin` when used with `useActionState`. */
export interface LoginState {
  error?: string;
}
