const ITEMS = [
  "Free shipping over ₹2,999",
  "Cash on delivery across India",
  "7-day easy returns",
  "New: Elements Edition",
  "Made for Indian streets",
];

/** Ink-black marquee strip pinned above the header. */
export function AnnouncementBar() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-b border-ink-line bg-ink py-2 text-gold">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
            {row.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center gap-10 text-[0.62rem] font-medium tracking-[0.26em] uppercase"
              >
                {item}
                <span className="text-gold/45">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">
        Free shipping over ₹2,999. Cash on delivery across India. 7-day easy returns.
      </span>
    </div>
  );
}
