import { z } from "zod";

/** UK/India sizes stocked by the brand. */
export const SIZES = ["5", "6", "7", "8", "9", "10", "11"] as const;
export type Size = (typeof SIZES)[number];

export const GENDERS = ["MEN", "WOMEN", "UNISEX"] as const;
export const CATEGORIES = ["sports", "sneakers", "loafers"] as const;

/* ------------------------------- auth ------------------------------- */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(60, "Name is too long"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

/* ------------------------------ address ----------------------------- */

export const addressSchema = z.object({
  label: z.string().min(1).max(20).default("Home"),
  name: z.string().trim().min(2, "Enter the recipient's name").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(4, "Enter house / street details").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().trim().min(2, "Enter state").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

/* ------------------------------ checkout ---------------------------- */

export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: addressSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  shipping: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  couponCode: z.string().trim().max(20).optional(),
  note: z.string().trim().max(240).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  color: z.string().min(1),
  size: z.string().min(1),
  qty: z.number().int().min(1).max(10),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

/* ------------------------------- review ----------------------------- */

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1, "Pick a rating").max(5),
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(800),
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/* ------------------------------- contact ---------------------------- */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(3).max(100),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(1500),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

/* -------------------------------- admin ----------------------------- */

export const productSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  gender: z.enum(GENDERS),
  categorySlug: z.enum(CATEGORIES),
  collectionSlug: z.string().optional().or(z.literal("")),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  material: z.string().trim().max(400).optional().or(z.literal("")),
  features: z.string().optional(),
  price: z.number().int().min(1, "Price is required").max(100000),
  mrp: z.number().int().min(1, "MRP is required").max(200000),
  colorName: z.string().trim().min(1, "Colour is required").max(40),
  colors: z.string().optional(),
  images: z.string().optional(),
  badge: z.string().max(20).optional().or(z.literal("")),
  active: z.boolean(),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  newArrival: z.boolean(),
  variants: z
    .array(
      z.object({
        color: z.string().min(1),
        size: z.string().min(1),
        stock: z.number().int().min(0).max(9999),
        sku: z.string().min(1).max(40),
      }),
    )
    .default([]),
});
export type ProductInput = z.infer<typeof productSchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/, "3–20 letters or numbers, no spaces"),
  description: z.string().trim().max(140).optional().or(z.literal("")),
  type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
  value: z.number().int().min(0).max(100),
  minOrder: z.number().int().min(0).max(100000),
  maxDiscount: z.number().int().min(0).max(100000).optional().nullable(),
  active: z.boolean(),
  expiresAt: z.string().optional().nullable(),
  usageLimit: z.number().int().min(0).optional().nullable(),
});
export type CouponInput = z.infer<typeof couponSchema>;

export const orderStatusSchema = z.enum([
  "PLACED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);

/** Loose sanitiser for free text that ends up in HTML attributes or emails. */
export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}
