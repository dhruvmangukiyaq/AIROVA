/** Shared, JSON-serialisable domain types (Prisma models → plain objects). */

export type Gender = "MEN" | "WOMEN" | "UNISEX";
export type CategorySlug = "sports" | "sneakers" | "loafers";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  src: string;
  card?: string;
  thumb?: string;
  alt: string;
}

export interface VariantDTO {
  id: string;
  color: string;
  size: string;
  stock: number;
  sku: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  categorySlug: CategorySlug;
  category?: { name: string; slug: string };
  collectionSlug?: string | null;
  collection?: { name: string; slug: string; tagline?: string | null } | null;
  description: string;
  material?: string | null;
  features: string[];
  price: number;
  mrp: number;
  colorName: string;
  colors: ProductColor[];
  images: string[];
  badge?: string | null;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string | Date;
  variants?: VariantDTO[];
}

export interface ReviewDTO {
  id: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string | Date;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  mrp: number;
  qty: number;
}

export interface AppliedCoupon {
  code: string;
  description?: string | null;
  discount: number;
  freeShipping: boolean;
}

export interface PriceSummary {
  subtotal: number;
  mrpTotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  shippingFee: number;
  total: number;
  savings: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  freeShippingUnlocked: boolean;
}

export type OrderStatus =
  | "PLACED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
}
