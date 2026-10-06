export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

/** Every number here mirrors STORE in src/lib/commerce.ts. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "orders",
    label: "Orders & payment",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "All payments run through Razorpay, so you can pay with UPI (GPay, PhonePe, Paytm), credit and debit cards, net banking and popular wallets. Everything is billed in Indian rupees (₹).",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes — COD is available across India on serviceable pincodes at checkout, with no extra COD fee. Enter your pincode in the cart to confirm eligibility before you pay.",
      },
      {
        q: "Is it safe to enter my card details?",
        a: "Card data is captured and processed by Razorpay, a PCI-DSS Level 1 certified gateway. AIROVA never sees, receives or stores your card number, CVV or banking password — our server only ever gets a payment confirmation.",
      },
      {
        q: "Can I change or cancel an order after placing it?",
        a: "If the order has not been packed, message us on WhatsApp with your order number and we will amend or cancel it. Once it has shipped, the order has to be delivered and then raised as a return or exchange.",
      },
      {
        q: "Do you provide a GST invoice?",
        a: "Yes. Every order includes a tax invoice with our GSTIN 27AAECA1234F1Z5. Send us your company name and GSTIN within 24 hours of ordering and we will reissue it with your details.",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    items: [
      {
        q: "How much does shipping cost?",
        a: "Standard shipping is ₹99 and is free on orders above ₹2,999. Express shipping is a flat ₹199 to metros and major cities. You will see the exact charge in your cart before you pay.",
      },
      {
        q: "How long will my order take to arrive?",
        a: "Orders placed before 2pm on a working day are packed the same day. Standard delivery takes 3–7 working days pan-India — metros land at the lower end, smaller cities and towns around 4–7 days, and remote pincodes 5–9.",
      },
      {
        q: "Do you ship to my city?",
        a: "We ship across India, including north-eastern states, J&K, Ladakh and the Andaman & Nicobar Islands. Remote pincodes take 5–9 days. Drop your pincode in the cart to check serviceability and COD availability instantly.",
      },
      {
        q: "How do I track my order?",
        a: "As soon as your parcel is picked up you get a tracking link by email and WhatsApp, and the same tracking is live under Account → Orders. You can also simply reply to your order confirmation on WhatsApp.",
      },
      {
        q: "Do you ship internationally?",
        a: "Not yet. We currently ship within India only — international delivery, including GCC and South-East Asia, is on the roadmap for next year.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & exchanges",
    items: [
      {
        q: "What is the return window?",
        a: "You have 7 days from the date of delivery to raise a return or exchange. The request has to be logged within that window, even if the courier pickup happens a day later.",
      },
      {
        q: "How do I raise a return or exchange?",
        a: "Message us on WhatsApp with your order number and the reason, or use the Return/Exchange button under Account → Orders. We schedule a free reverse pickup within 48 hours in most serviceable pincodes.",
      },
      {
        q: "What condition do the shoes need to be in?",
        a: "Unworn except for an indoor trial, in the original box with tags, dust bag and spare laces. Soles must be clean and free of scuffs — if they have been worn outdoors we cannot accept them back.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Yes. One size exchange per order is free if the replacement size is in stock, and we hold it for you while the original pair travels back. If the size is out of stock we will refund instead.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are initiated the same day your pair passes our quality check: UPI in 3–5 working days, credit/debit cards and net banking in 5–7 working days, and COD orders by bank transfer or NEFT in 5–7 working days. Store credit is instant.",
      },
      {
        q: "Which items cannot be returned?",
        a: "Pairs worn outdoors or altered in any way, items marked 'Final sale' on the product page, gift cards, and socks or insoles (hygiene). Exchanges and returns are also not applicable on international or bulk corporate orders.",
      },
    ],
  },
  {
    id: "sizing",
    label: "Product & sizing",
    items: [
      {
        q: "What size should I order?",
        a: "We stock UK (India) sizes 5 to 11 and our lasts run true to size. Measure your foot heel to toe and match it to the size guide — if you sit between two sizes, take the larger one. Still unsure? Send us your foot length on WhatsApp and we will pick the size for you.",
      },
      {
        q: "Do your shoes run small or large?",
        a: "Neither — they run true to size with about 1 cm of room built in. If you have wide feet or high insteps, or if you are between sizes, go half to one size up.",
      },
      {
        q: "Are they suitable for wide or flat feet?",
        a: "The knit and denim uppers give slightly after a day of wear, and the sports silhouettes have the roomiest toe box. For flat feet we recommend the sports styles with their moulded, arch-supporting footbed.",
      },
      {
        q: "What is the difference between the four collections?",
        a: "Aqua is water-resistant with a wet-grip outsole for monsoons. Flare is our boldest street colourway. Aero is the lightweight, breathable everyday sneaker. Cinder is the rugged all-terrain build with a chunkier sole.",
      },
      {
        q: "Do you have shoes for women?",
        a: "Yes — most styles are unisex and every collection is cut for both. Filter by Women on the shop page to see the fits and colourways shot on women, all listed in the same UK sizing.",
      },
    ],
  },
  {
    id: "care",
    label: "Care",
    items: [
      {
        q: "How do I clean my shoes?",
        a: "Dry-brush the dust off first, then use a soft cloth with lukewarm water and a drop of mild soap. Air dry at room temperature, away from direct sun and heaters. Never put them in a washing machine, and never use bleach.",
      },
      {
        q: "Are they monsoon ready?",
        a: "The Aqua collection is treated to shed light rain and all our outsoles are siped for wet grip. After a wet day, remove the insoles and let the pair dry naturally overnight — that is what keeps them fresh through the season.",
      },
      {
        q: "How do I store them between uses?",
        a: "Keep them in the supplied dust bag or box, away from direct sunlight, with the paper stuffing back inside so the toe keeps its shape. Rotate pairs so each gets a full day to breathe.",
      },
    ],
  },
];

export const FAQ_COUNT = FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0);
