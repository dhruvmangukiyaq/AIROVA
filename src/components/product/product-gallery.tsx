"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product gallery with a hover/move zoom lens. The zoom is a scaled copy of
 * the active image, so it costs no extra network requests.
 */
export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zooming, setZooming] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const safeImages = images.length ? images : ["/images/products/aqua-water-edition-sports-shoe-1.webp"];
  const src = safeImages[Math.min(active, safeImages.length - 1)];

  const onMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }, []);

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-6">
      {/* Thumbnails */}
      <div
        className="flex gap-3 overflow-x-auto hide-scrollbar lg:w-20 lg:flex-col lg:overflow-visible"
        role="tablist"
        aria-label={`${alt} images`}
      >
        {safeImages.map((image, i) => (
          <button
            key={image}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${safeImages.length}`}
            onClick={() => {
              setActive(i);
              setZooming(false);
            }}
            className={cn(
              "relative aspect-square w-16 shrink-0 overflow-hidden border transition-all lg:w-full",
              i === active
                ? "border-ink ring-1 ring-gold"
                : "border-line opacity-70 hover:border-ink/40 hover:opacity-100",
            )}
          >
            <Image
              src={image.replace(/\.webp$/, "-thumb.webp")}
              alt=""
              aria-hidden
              fill
              sizes="80px"
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>

      {/* Main frame */}
      <div className="relative flex-1">
        <div
          ref={frameRef}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={onMove}
          className="img-well bg-bone"
        >
          {badge && (
            <span className="absolute top-4 left-4 z-10 bg-ink px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.16em] text-gold uppercase">
              {badge}
            </span>
          )}

          <Image
            key={src}
            src={src}
            alt={`${alt} — view ${active + 1}`}
            fill
            priority={active === 0}
            loading={active === 0 ? "eager" : "lazy"}
            fetchPriority={active === 0 ? "high" : "auto"}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className={cn(
              "object-contain p-6 transition-transform duration-300 ease-out sm:p-10",
              zooming && "scale-[1.9]",
            )}
            style={{ transformOrigin: origin }}
          />

          {/* gold hairline */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gold/40" />
        </div>

        <p className="mt-3 text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
          Hover to zoom · {active + 1} / {safeImages.length}
        </p>
      </div>
    </div>
  );
}
