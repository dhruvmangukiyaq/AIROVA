import { PrismaClient, Gender, CategoryType, OrderStatus, PaymentMethod, PaymentStatus, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const IMG = "/images/products";
type C = { name: string; hex: string };

const c = (name: string, hex: string): C => ({ name, hex });
const BLACK = c("Black", "#111111");
const WHITE = c("White", "#f5f5f4");
const NAVY = c("Navy", "#1f2f52");
const SKY = c("Sky Blue", "#8ec5e8");
const PINK = c("Pink", "#e9a9bd");

/** Image galleries, primary shot first (all files are .webp in /public/images/products) */
const G = (...slugs: string[]) => slugs.map((s) => `${IMG}/${s}.webp`);

const SIZES = ["5", "6", "7", "8", "9", "10", "11"];

/** sizes that should show as out of stock for demo realism */
const outOfStock = (pairs: [string, string][]) => new Map(pairs);

type Seed = {
  name: string;
  slug: string;
  gender: Gender;
  category: CategoryType;
  collection: string;
  colorName: string;
  colors: C[];
  price: number;
  mrp: number;
  description: string;
  material: string;
  features: string[];
  images: string[];
  badge?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  oos?: [string, string][];
  rating?: number;
};

const products: Seed[] = [
  {
    name: "Aqua Water Edition Sports Shoe",
    slug: "aqua-water-edition-sports-shoe",
    gender: Gender.UNISEX,
    category: CategoryType.SPORTS,
    collection: "aqua",
    colorName: "Aqua Blue",
    colors: [c("Aqua Blue", "#2f6fd0"), WHITE],
    price: 3999,
    mrp: 6499,
    description:
      "Flow further. Go deeper. The AQUA Water Edition pairs a sculpted wave-moulded midsole with a water-channel outsole built for grip in wet conditions — monsoon commutes, pool decks and everything in between.",
    material: "Breathable engineered mesh upper, moulded TPU wave cage, memory-foam collar, phylon midsole, wet-grip rubber outsole",
    features: [
      "Multi-direction grip pattern — stability on every surface",
      "Water-channel outsole design for enhanced wet traction",
      "Lightweight cushioning with a 12 mm heel-to-toe drop",
      "Eco-friendly recycled mesh upper",
      "Reinforced heel pull tab for easy on/off",
    ],
    images: G(
      "aqua-water-edition-sports-shoe-1",
      "aqua-water-edition-sports-shoe-2",
      "aqua-water-edition-sports-shoe-4-poster",
      "aqua-water-edition-sports-shoe-3-poster",
    ),
    badge: "New",
    featured: true,
    newArrival: true,
    oos: [["5", "0"], ["11", "0"]],
    rating: 4.7,
  },
  {
    name: "Flare Fire Edition Sports Shoe",
    slug: "flare-fire-edition-sports-shoe",
    gender: Gender.UNISEX,
    category: CategoryType.SPORTS,
    collection: "flare",
    colorName: "Black / Red",
    colors: [c("Black / Red", "#c2352b"), BLACK],
    price: 4499,
    mrp: 6999,
    description:
      "Bold energy, powerful steps. FLARE wraps a black knit chassis in molten-red heat lines with gold AIROVA branding — an aggressive trainer built for people who like to be seen.",
    material: "Knit mesh upper with TPU heat-weld overlays, gold-tone metal eyelet stays, dual-density EVA midsole, abrasion rubber outsole",
    features: [
      "Molten heat-line TPU cage for lateral support",
      "Gold-tone AIROVA hardware and tongue badge",
      "Energy-return dual-density foam midsole",
      "Anti-slip herringbone traction pods",
      "Padded Achilles collar",
    ],
    images: G(
      "flare-fire-edition-sports-shoe-1",
      "flare-fire-edition-sports-shoe-4",
      "flare-fire-edition-sports-shoe-2-poster",
      "flare-fire-edition-sports-shoe-3-poster",
    ),
    badge: "Best Seller",
    featured: true,
    bestSeller: true,
    oos: [["5", "2"]],
    rating: 4.8,
  },
  {
    name: "Aero Air Edition Sneaker",
    slug: "aero-air-edition-sneaker",
    gender: Gender.UNISEX,
    category: CategoryType.SPORTS,
    collection: "aero",
    colorName: "Ivory / Gold",
    colors: [c("Ivory / Gold", "#efe6d4"), c("Gum Gold", "#c89a52")],
    price: 4299,
    mrp: 6799,
    description:
      "Lighter steps. Move freely. AERO is our lightest silhouette yet — ivory mesh, brushed gold detailing and a gum outsole that softens every landing.",
    material: "Open-cell breathable mesh, synthetic leather overlays, gold foil branding, AERO-FOAM midsole, natural gum rubber outsole",
    features: [
      "Ultra-lightweight build — under 280 g per shoe",
      "Breathable comfort mesh keeps feet cool all day",
      "All-day arch support footbed",
      "Flex grooves for natural movement",
      "Sustainable, recycled-content materials",
    ],
    images: G(
      "aero-air-edition-sneaker-3",
      "aero-air-edition-sneaker-1",
      "aero-air-edition-sneaker-2-poster",
      "aero-air-edition-sneaker-4-poster",
      "aero-air-edition-sneaker-5-poster",
    ),
    badge: "New",
    featured: true,
    newArrival: true,
    oos: [["10", "0"]],
    rating: 4.6,
  },
  {
    name: "Cinder Ash Edition Sports Shoe",
    slug: "cinder-ash-edition-sports-shoe",
    gender: Gender.UNISEX,
    category: CategoryType.SPORTS,
    collection: "cinder",
    colorName: "Charcoal / Ash",
    colors: [c("Charcoal", "#2b2b2b"), c("Ash Gold", "#b9a489")],
    price: 4199,
    mrp: 6699,
    description:
      "Stronger through it all. CINDER is built from what remains — an ash-washed upper over a rugged all-terrain outsole that swallows tarmac, trail and everything in between.",
    material: "Ash-washed textile upper, welded stone-print overlays, shock-absorption EVA carrier, high-grip carbon rubber outsole",
    features: [
      "All-terrain lug pattern for road and trail",
      "Durable rubber outsole built for longer journeys",
      "Shock-absorption technology at the heel",
      "Long-lasting performance build",
      "Inspired by raw elements",
    ],
    images: G(
      "cinder-ash-edition-sports-shoe-3",
      "cinder-ash-edition-sports-shoe-2-poster",
      "cinder-ash-edition-sports-shoe-1-poster",
      "cinder-ash-edition-sports-shoe-4-poster",
    ),
    badge: "Best Seller",
    featured: true,
    bestSeller: true,
    oos: [["5", "0"], ["6", "0"]],
    rating: 4.5,
  },

  // ---------------- DENIM — Loafers ----------------
  {
    name: "Navy Denim Slip-On Loafer",
    slug: "navy-denim-slip-on-loafer",
    gender: Gender.MEN,
    category: CategoryType.LOAFERS,
    collection: "denim",
    colorName: "Navy",
    colors: [NAVY],
    price: 2299,
    mrp: 3699,
    description:
      "A penny-loafer cut in washed indigo denim with a hand-finished gold AIROVA pin. Dressy enough for the office, relaxed enough for Sunday brunch.",
    material: "Washed denim upper, tan cushioned leatherette lining, memory footbed, stitched whipst detail, EVA wedge with rubber grip pods",
    features: [
      "Gold-tone AIROVA metal bit detail",
      "Slip-on construction with elastic gussets",
      "Cushioned, breathable insole",
      "Stitched whipst detail on the apron",
      "Non-marking durable outsole",
    ],
    images: G("navy-denim-slip-on-loafer-1"),
    rating: 4.4,
    oos: [["5", "0"]],
  },
  {
    name: "Black Denim Slip-On Loafer",
    slug: "black-denim-slip-on-loafer",
    gender: Gender.MEN,
    category: CategoryType.LOAFERS,
    collection: "denim",
    colorName: "Black",
    colors: [BLACK],
    price: 2299,
    mrp: 3699,
    description:
      "Deep-black washed denim over a crisp ivory sole — the quiet flex. Gold hardware keeps it unmistakably AIROVA.",
    material: "Washed black denim upper, tan cushioned lining, memory footbed, EVA wedge with rubber grip pods",
    features: [
      "Gold-tone AIROVA metal bit detail",
      "Slip-on construction with elastic gussets",
      "Cushioned, breathable insole",
      "Ivory contrast midsole",
      "Non-marking durable outsole",
    ],
    images: G("black-denim-slip-on-loafer-1"),
    rating: 4.5,
  },
  {
    name: "White Denim Slip-On Loafer",
    slug: "white-denim-slip-on-loafer",
    gender: Gender.UNISEX,
    category: CategoryType.LOAFERS,
    collection: "denim",
    colorName: "White",
    colors: [WHITE],
    price: 2199,
    mrp: 3499,
    description:
      "Off-white denim with tan lining and gold detailing. The warm-weather loafer that goes with linen, chinos and everything in your summer wardrobe.",
    material: "Washed white denim upper, tan cushioned lining, memory footbed, EVA wedge with rubber grip pods",
    features: [
      "Gold-tone AIROVA metal bit detail",
      "Slip-on construction with elastic gussets",
      "Cushioned, breathable insole",
      "Tonal stitching for a clean finish",
      "Non-marking durable outsole",
    ],
    images: G("white-denim-slip-on-loafer-1"),
    newArrival: true,
    badge: "New",
  },
  {
    name: "Sky Blue Denim Slip-On Loafer",
    slug: "sky-blue-denim-slip-on-loafer",
    gender: Gender.WOMEN,
    category: CategoryType.LOAFERS,
    collection: "denim",
    colorName: "Sky Blue",
    colors: [SKY],
    price: 2199,
    mrp: 3499,
    description:
      "A soft sky-blue wash on our classic penny-loafer last. Light, airy and easy — the shoe for long lunches and longer walks.",
    material: "Washed sky-blue denim upper, tan cushioned lining, memory footbed, EVA wedge with rubber grip pods",
    features: [
      "Gold-tone AIROVA metal bit detail",
      "Slip-on construction with elastic gussets",
      "Cushioned, breathable insole",
      "Lightweight — ideal for all-day wear",
      "Non-marking durable outsole",
    ],
    images: G("sky-blue-denim-slip-on-loafer-1"),
    newArrival: true,
    badge: "New",
  },

  // ---------------- DENIM — Low-top sneakers ----------------
  {
    name: "Black Denim Low-Top Sneaker",
    slug: "black-denim-low-top-sneaker",
    gender: Gender.UNISEX,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Black",
    colors: [BLACK],
    price: 1999,
    mrp: 3299,
    description:
      "Washed black denim, gold eyelets and a chunky ivory cupsole. The everyday low-top that quietly dresses up jeans, tees and everything else.",
    material: "Washed black denim upper, gold-tone metal eyelets, cotton lace, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Everyday style — office to weekend",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("black-denim-low-top-sneaker-1"),
    bestSeller: true,
    badge: "Best Seller",
    rating: 4.6,
    oos: [["11", "0"]],
  },
  {
    name: "White Denim Low-Top Sneaker",
    slug: "white-denim-low-top-sneaker",
    gender: Gender.WOMEN,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "White",
    colors: [WHITE],
    price: 1999,
    mrp: 3299,
    description:
      "Crystal-washed white denim with warm gold hardware — the clean white sneaker, done properly.",
    material: "Washed white denim upper, gold-tone metal eyelets, cotton lace, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Crisp white wash that pairs with everything",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("white-denim-low-top-sneaker-1"),
    rating: 4.7,
    bestSeller: true,
    badge: "Best Seller",
  },
  {
    name: "Indigo Denim Low-Top Sneaker",
    slug: "indigo-denim-low-top-sneaker",
    gender: Gender.MEN,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Indigo",
    colors: [c("Indigo", "#2c4a7c")],
    price: 2099,
    mrp: 3499,
    description:
      "Deep indigo denim with contrast cream stitching — a classic blue that fades beautifully with wear.",
    material: "Rigid indigo denim upper, contrast cream stitching, gold-tone metal eyelets, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Classic blue denim that ages with you",
      "Contrast cream stitching",
      "Gold-tone eyelets and AIROVA lace charm",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("indigo-denim-low-top-sneaker-1"),
  },
  {
    name: "Classic Blue Denim Low-Top Sneaker",
    slug: "classic-blue-denim-low-top-sneaker",
    gender: Gender.MEN,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Classic Blue",
    colors: [c("Classic Blue", "#3f6ea6")],
    price: 2099,
    mrp: 3499,
    description:
      "The signature mid-blue wash from the Denim Edit — worn-in from day one, better with every mile.",
    material: "Mid-wash denim upper, gold-tone metal eyelets, cotton lace, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Signature mid-blue wash",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("classic-blue-denim-low-top-sneaker-1"),
  },
  {
    name: "Light Blue Denim Low-Top Sneaker",
    slug: "light-blue-denim-low-top-sneaker",
    gender: Gender.UNISEX,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Sky Blue",
    colors: [SKY],
    price: 1999,
    mrp: 3299,
    description:
      "A pale, sun-faded blue that reads summer all year. Lightweight, breathable and impossibly easy to wear.",
    material: "Light-wash denim upper, gold-tone metal eyelets, cotton lace, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Sun-faded light wash",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("light-blue-denim-low-top-sneaker-1"),
    newArrival: true,
    badge: "New",
    rating: 4.3,
  },
  {
    name: "Pink Denim Low-Top Sneaker",
    slug: "pink-denim-low-top-sneaker",
    gender: Gender.WOMEN,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Pink",
    colors: [PINK],
    price: 1999,
    mrp: 3299,
    description:
      "A dusty rose denim wash with gold hardware and a cream sole. Sweet, but with an edge.",
    material: "Washed pink denim upper, gold-tone metal eyelets, cotton lace, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Dusty rose wash",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("pink-denim-low-top-sneaker-1"),
    newArrival: true,
    badge: "New",
    rating: 4.6,
  },
  {
    name: "Charcoal Denim Low-Top Sneaker",
    slug: "charcoal-denim-low-top-sneaker",
    gender: Gender.MEN,
    category: CategoryType.SNEAKERS,
    collection: "denim",
    colorName: "Charcoal",
    colors: [c("Charcoal", "#3a3a3c")],
    price: 2099,
    mrp: 3499,
    description:
      "Charcoal-washed denim with tonal stitching — the darkest shoe in the Denim Edit and the easiest to keep clean.",
    material: "Charcoal-washed denim upper, tonal stitching, gold-tone metal eyelets, cushioned EVA midsole, vulcanised rubber outsole",
    features: [
      "Dark charcoal wash — hides everyday wear",
      "Gold-tone eyelets and AIROVA lace charm",
      "Padded collar and tongue",
      "Cushioned EVA footbed",
      "Durable vulcanised rubber sole",
    ],
    images: G("charcoal-denim-low-top-sneaker-1"),
  },
];

const collections = [
  {
    slug: "aqua",
    name: "Aqua",
    tagline: "Water Edition — Flow further. Go deeper.",
    story:
      "The first drop of the Elements Edition. AQUA takes its cue from moving water: wave-moulded sidewalls, a channelled outsole that clears water on contact, and a blue that shifts with the light.",
    image: `${IMG}/aqua-water-edition-sports-shoe-2.webp`,
    sortOrder: 1,
  },
  {
    slug: "flare",
    name: "Flare",
    tagline: "Fire Edition — Bold energy. Powerful steps.",
    story:
      "Black knit wrapped in molten heat lines. FLARE is the loudest thing we make, and the most comfortable — a dual-density foam core keeps the noise on the outside.",
    image: `${IMG}/flare-fire-edition-sports-shoe-1.webp`,
    sortOrder: 2,
  },
  {
    slug: "aero",
    name: "Aero",
    tagline: "Air Edition — Lighter steps. Move freely.",
    story:
      "Our lightest silhouette. Open-cell mesh, a foam midsole tuned for daily miles and a gum outsole that grips without the weight.",
    image: `${IMG}/aero-air-edition-sneaker-3.webp`,
    sortOrder: 3,
  },
  {
    slug: "cinder",
    name: "Cinder",
    tagline: "Ash Edition — Stronger through it all.",
    story:
      "Built from what remains. CINDER is the all-terrain member of the family — an ash-washed upper over a lug pattern that handles monsoon tarmac as happily as dry trail.",
    image: `${IMG}/cinder-ash-edition-sports-shoe-3.webp`,
    sortOrder: 4,
  },
  {
    slug: "denim",
    name: "Denim",
    tagline: "The Denim Edit — Worn in, never worn out.",
    story:
      "Washed denim on our everyday lasts, finished with gold-tone hardware. Loafers and low-tops in eight washes, cut for Indian streets and Indian weather.",
    image: `${IMG}/navy-denim-slip-on-loafer-1.webp`,
    sortOrder: 5,
  },
];

const categories = [
  { name: "Sports Shoes", slug: "sports", description: "Running, training and all-terrain performance shoes.", image: `${IMG}/flare-fire-edition-sports-shoe-1.webp` },
  { name: "Sneakers", slug: "sneakers", description: "Everyday low-tops in canvas, denim and knit.", image: `${IMG}/white-denim-low-top-sneaker-1.webp` },
  { name: "Loafers", slug: "loafers", description: "Slip-on loafers and drivers for smart-casual days.", image: `${IMG}/navy-denim-slip-on-loafer-1.webp` },
];

const reviewsBySlug: Record<string, { name: string; rating: number; title: string; body: string }[]> = {
  "aqua-water-edition-sports-shoe": [
    { name: "Rohit Sharma", rating: 5, title: "Grip is unreal in the rain", body: "Bought these for the monsoon commute in Mumbai. Zero slips on wet platform tiles and they dried fast. Sizing is true to UK 9." },
    { name: "Ananya Iyer", rating: 4, title: "Very light", body: "Comfortable from the first wear, no break-in needed. Only wish it came in more colours." },
    { name: "Karan Mehta", rating: 5, title: "Box and packaging feel premium", body: "Presentation is top-notch. Wore them for a 12k step day and my feet were fine." },
  ],
  "flare-fire-edition-sports-shoe": [
    { name: "Vikram Singh", rating: 5, title: "Head-turner", body: "Everyone at the gym asks about these. The red actually glows in photos. True to size." },
    { name: "Sneha Rao", rating: 5, title: "Comfort + drama", body: "Was worried they'd be stiff because of the design but the midsole is soft. Love them." },
    { name: "Aditya Kulkarni", rating: 4, title: "Great trainer", body: "Slightly narrow if you have wide feet — go half size up. Otherwise perfect." },
  ],
  "aero-air-edition-sneaker": [
    { name: "Priya Nair", rating: 5, title: "Feels like nothing on foot", body: "Lightest shoes I own. The ivory does pick up dust but wipes clean with a damp cloth." },
    { name: "Arjun Deshpande", rating: 4, title: "Excellent daily beater", body: "Three months in, foam has held up well. Gold detailing hasn't flaked." },
  ],
  "cinder-ash-edition-sports-shoe": [
    { name: "Manish Verma", rating: 5, title: "Trail-ready", body: "Took these to Lonavala — grip on loose rock is genuinely good. Ankle support is solid." },
    { name: "Divya Menon", rating: 4, title: "Runs slightly chunky", body: "Big silhouette, so size accordingly. Very cushioned for long walking days." },
    { name: "Sameer Joshi", rating: 4, title: "Tough build", body: "Outsole shows barely any wear after a month. Ash wash looks better in person." },
  ],
  "navy-denim-slip-on-loafer": [
    { name: "Rahul Bhatia", rating: 5, title: "Office to dinner", body: "Wears well with chinos and also with jeans. The gold bit detail is subtle and classy." },
    { name: "Neha Agarwal", rating: 4, title: "Bought for my husband", body: "He lives in them now. Break-in took about a day." },
  ],
  "black-denim-slip-on-loafer": [
    { name: "Imran Qureshi", rating: 5, title: "Versatile", body: "Goes with literally everything in my wardrobe. Comfortable straight out of the box." },
  ],
  "white-denim-slip-on-loafer": [
    { name: "Tanya Bose", rating: 5, title: "Summer staple", body: "Perfect with linen. Sizing true to size, cushioning is better than expected." },
    { name: "Suresh Pillai", rating: 4, title: "Clean look", body: "Needs a protective spray before first wear, otherwise great." },
  ],
  "sky-blue-denim-slip-on-loafer": [
    { name: "Meera Krishnan", rating: 5, title: "So pretty", body: "Colour is exactly like the photos. Lightweight and breathable." },
  ],
  "black-denim-low-top-sneaker": [
    { name: "Aditi Shetty", rating: 5, title: "Best everyday sneaker", body: "Gold eyelets make it look far more expensive than it is. Comfortable for full days." },
    { name: "Gaurav Malhotra", rating: 4, title: "Solid value", body: "Stitching is clean, sole is grippy. Slightly narrow." },
    { name: "Farhan Ali", rating: 5, title: "Repeat purchase", body: "Second pair. Colour hasn't faded after multiple washes of the laces." },
  ],
  "white-denim-low-top-sneaker": [
    { name: "Riya Kapoor", rating: 5, title: "White sneaker done right", body: "Doesn't crease easily and the wash gives it character. Runs true to size." },
    { name: "Nikhil Jain", rating: 4, title: "Very clean", body: "Gets dirty as white shoes do, but wipes down easily." },
  ],
  "indigo-denim-low-top-sneaker": [
    { name: "Harsh Vora", rating: 4, title: "Great denim", body: "Rigid at first but softens after a week. The fade is starting to look fantastic." },
  ],
  "classic-blue-denim-low-top-sneaker": [
    { name: "Aman Gupta", rating: 5, title: "Exactly as pictured", body: "Mid-blue wash is spot on. Lace charm is a nice touch." },
  ],
  "light-blue-denim-low-top-sneaker": [
    { name: "Kavya Reddy", rating: 4, title: "Colour is lovely", body: "Pale blue pairs with everything. Wish the insole was a bit thicker." },
  ],
  "pink-denim-low-top-sneaker": [
    { name: "Shruti Patel", rating: 5, title: "Obsessed", body: "The dusty pink is so flattering and not too girly. Compliments every time." },
    { name: "Anjali Desai", rating: 4, title: "Comfortable", body: "Walked around Surat all day with no blisters." },
  ],
  "charcoal-denim-low-top-sneaker": [
    { name: "Deepak Chauhan", rating: 5, title: "Low maintenance", body: "Dark wash hides everything. Looks sharp with black jeans." },
  ],
};

const coupons = [
  { code: "WELCOME10", description: "10% off your first order", type: DiscountType.PERCENT, value: 10, minOrder: 1499, maxDiscount: 500 },
  { code: "FLAT500", description: "₹500 off on orders above ₹3,499", type: DiscountType.FIXED, value: 500, minOrder: 3499 },
  { code: "FIRST20", description: "20% off for new customers", type: DiscountType.PERCENT, value: 20, minOrder: 2499, maxDiscount: 800, expiresAt: new Date("2027-03-31T18:30:00.000Z") },
  { code: "FREESHIP", description: "Free shipping on any order", type: DiscountType.FREE_SHIPPING, value: 0, minOrder: 0 },
];

async function main() {
  console.log("Seeding AIROVA FOOTWEAR…");

  // verify image files exist
  for (const p of products) {
    for (const img of p.images) {
      const file = path.join(process.cwd(), "public", img);
      await readFile(file).catch(() => {
        throw new Error(`Missing image file: ${file}`);
      });
    }
  }

  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  for (const cat of categories) {
    await prisma.category.create({ data: { ...cat, active: true } });
  }
  for (const col of collections) {
    await prisma.collection.create({ data: { ...col, active: true } });
  }
  for (const cp of coupons) {
    await prisma.coupon.create({ data: { ...cp, active: true } });
  }

  // users
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const custHash = await bcrypt.hash("Customer@123", 10);
  await prisma.user.create({
    data: { email: "admin@airova.in", name: "AIROVA Admin", phone: "9999999999", passwordHash: adminHash, role: "ADMIN" },
  });
  const customer = await prisma.user.create({
    data: { email: "customer@airova.in", name: "Demo Customer", phone: "9876543210", passwordHash: custHash, role: "CUSTOMER" },
  });
  await prisma.address.create({
    data: {
      userId: customer.id, label: "Home", name: "Demo Customer", phone: "9876543210",
      line1: "14, Palm Grove Residency", line2: "Indiranagar, 100 Feet Road",
      city: "Bengaluru", state: "Karnataka", pincode: "560038", isDefault: true,
    },
  });

  let totalStock = 0;
  const createdProducts = [];
  for (const p of products) {
    const oos = outOfStock(p.oos ?? []);
    const product = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, gender: p.gender,
        categorySlug: p.category.toLowerCase(), collectionSlug: p.collection,
        description: p.description, material: p.material,
        features: JSON.stringify(p.features),
        price: p.price, mrp: p.mrp, colorName: p.colorName,
        colors: JSON.stringify(p.colors),
        images: JSON.stringify(p.images),
        badge: p.badge ?? (p.mrp > p.price ? `${discountPct(p.price, p.mrp)}% OFF` : null),
        featured: p.featured ?? false, bestSeller: p.bestSeller ?? false,
        newArrival: p.newArrival ?? false, active: true,
        rating: p.rating ?? 0, reviewCount: 0,
        variants: {
          create: SIZES.map((size) => {
            const stock = oos.has(size) ? 0 : 12 + ((size.charCodeAt(0) + p.slug.length) % 9);
            totalStock += stock;
            return {
              color: p.colorName, size, stock,
              sku: `AIV-${p.slug.split("-").map((w) => w[0]).join("").toUpperCase().slice(0, 4)}-${p.colorName.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3)}-${size}`,
            };
          }),
        },
      },
      include: { variants: true },
    });
    createdProducts.push(product);

    const revs = reviewsBySlug[p.slug] ?? [];
    for (const r of revs) {
      await prisma.review.create({
        data: { productId: product.id, name: r.name, rating: r.rating, title: r.title, body: r.body, verified: true, status: "published" },
      });
    }
    if (revs.length) {
      const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
      await prisma.product.update({
        where: { id: product.id },
        data: { rating: Math.round(avg * 10) / 10, reviewCount: revs.length },
      });
    }
  }

  // ---- demo orders so the admin dashboard isn't empty ----
  const demoOrders: { slug: string; qty: number; size: string; status: OrderStatus; method: PaymentMethod }[] = [
    { slug: "flare-fire-edition-sports-shoe", qty: 1, size: "9", status: OrderStatus.DELIVERED, method: PaymentMethod.RAZORPAY },
    { slug: "aqua-water-edition-sports-shoe", qty: 1, size: "8", status: OrderStatus.SHIPPED, method: PaymentMethod.COD },
    { slug: "black-denim-low-top-sneaker", qty: 2, size: "10", status: OrderStatus.PACKED, method: PaymentMethod.RAZORPAY },
    { slug: "white-denim-low-top-sneaker", qty: 1, size: "6", status: OrderStatus.PLACED, method: PaymentMethod.COD },
    { slug: "aero-air-edition-sneaker", qty: 1, size: "9", status: OrderStatus.DELIVERED, method: PaymentMethod.RAZORPAY },
    { slug: "navy-denim-slip-on-loafer", qty: 1, size: "8", status: OrderStatus.PLACED, method: PaymentMethod.RAZORPAY },
  ];

  const pincodePool = [
    ["Aarav Sharma", "Bandra West", "Mumbai", "Maharashtra", "400050"],
    ["Diya Nair", "Koramangala", "Bengaluru", "Karnataka", "560034"],
    ["Ishaan Gupta", "Hauz Khas", "New Delhi", "Delhi", "110016"],
    ["Meera Patel", "Satellite", "Ahmedabad", "Gujarat", "380015"],
    ["Rohan Reddy", "Banjara Hills", "Hyderabad", "Telangana", "500034"],
    ["Ananya Das", "Salt Lake", "Kolkata", "West Bengal", "700091"],
  ];

  let revenue = 0;
  for (let i = 0; i < demoOrders.length; i++) {
    const d = demoOrders[i];
    const prod = createdProducts.find((p) => p.slug === d.slug)!;
    const img = JSON.parse(prod.images)[0] as string;
    const line = prod.price * d.qty;
    const shipping = line >= 2999 ? 0 : 99;
    const addr = pincodePool[i % pincodePool.length];
    const placedAt = new Date(Date.now() - (i + 1) * 36 * 3600 * 1000);
    if (d.status !== OrderStatus.CANCELLED) revenue += line + shipping;
    await prisma.order.create({
      data: {
        number: makeOrderNumber(placedAt, i + 1),
        userId: i === 0 ? customer.id : null,
        email: `customer${i + 1}@example.com`,
        phone: `98${String(70000000 + i * 1234567).slice(0, 8)}`,
        status: d.status,
        paymentMethod: d.method,
        paymentStatus: d.method === PaymentMethod.COD
          ? (d.status === OrderStatus.DELIVERED ? PaymentStatus.PAID : PaymentStatus.COD_PENDING)
          : PaymentStatus.PAID,
        paymentId: d.method === PaymentMethod.RAZORPAY ? `pay_demo${i + 1}airova` : null,
        subtotal: line, discount: 0, shipping, total: line + shipping,
        couponCode: i === 1 ? "WELCOME10" : null,
        addrName: addr[0], addrPhone: `98${String(70000000 + i * 1234567).slice(0, 8)}`,
        addrLine1: `Flat ${12 + i}, Skyline Apartments`, addrLine2: addr[1],
        addrCity: addr[2], addrState: addr[3], addrPincode: addr[4],
        placedAt,
        items: {
          create: [{
            productId: prod.id, name: prod.name, slug: prod.slug, image: img,
            color: prod.colorName, size: d.size, price: prod.price, mrp: prod.mrp, qty: d.qty,
          }],
        },
      },
    });
  }

  for (const e of ["aarav@example.com", "diya@example.com", "ishaan@example.com", "meera@example.com"]) {
    await prisma.newsletter.upsert({ where: { email: e }, update: {}, create: { email: e } });
  }

  const counts = {
    products: await prisma.product.count(),
    variants: await prisma.variant.count(),
    reviews: await prisma.review.count(),
    orders: await prisma.order.count(),
    totalStock,
    demoRevenue: revenue,
  };
  console.table(counts);
  console.log("Done. Admin login: admin@airova.in / Admin@123");
  console.log("Customer login: customer@airova.in / Customer@123");
}

function discountPct(price: number, mrp: number) { return Math.round(((mrp - price) / mrp) * 100); }
function makeOrderNumber(d: Date, seq: number) {
  const y = d.getFullYear();
  const md = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `AIV-${y}${md}-${String(seq).padStart(4, "0")}`;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
