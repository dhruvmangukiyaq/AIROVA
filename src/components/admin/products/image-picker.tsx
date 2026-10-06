"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronDown, ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTROL_CLASS } from "@/components/admin/fields";
import { MicroLabel } from "@/components/admin/panel";

/** Current gallery + an on-demand browser for files in /public/images/products. */
export function ImagePicker({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<string[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/images");
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { images?: string[] };
      setFiles(data.images ?? []);
    } catch {
      setError("Could not list the image folder. Check your session and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && files === null && !loading) void load();
  };

  const add = (src: string) => {
    if (images.includes(src)) return;
    onChange([...images, src]);
  };

  const remove = (src: string) => onChange(images.filter((i) => i !== src));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <MicroLabel>Gallery · {images.length}</MicroLabel>
        <Button type="button" variant="outline" size="xs" onClick={toggle}>
          <ImagePlus className="size-3.5" aria-hidden />
          {open ? "Hide files" : "Browse files"}
          <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="border border-dashed border-white/12 px-3 py-4 text-center text-xs text-cream/40">
          No images yet — paste paths below or browse the folder.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <li
              key={src}
              className="group relative size-16 overflow-hidden border border-white/12 bg-white/[0.04]"
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain p-1.5" />
              {i === 0 ? (
                <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-0.5 text-center text-[0.5rem] tracking-[0.14em] text-gold uppercase">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(src)}
                aria-label={`Remove ${src}`}
                className="absolute top-0.5 right-0.5 grid size-5 place-content-center bg-ink/85 text-cream/70 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-[#e78a82]"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="border border-ink-line bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <MicroLabel>public/images/products</MicroLabel>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-1.5 text-[0.62rem] tracking-[0.14em] text-cream/45 uppercase transition-colors hover:text-gold"
            >
              <RefreshCw className="size-3" aria-hidden />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="flex items-center gap-2 py-6 text-xs text-cream/50">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Reading the image folder…
            </p>
          ) : error ? (
            <p className="py-6 text-xs text-[#e78a82]">{error}</p>
          ) : files && files.length > 0 ? (
            <ul className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
              {files.map((src) => {
                const added = images.includes(src);
                return (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => add(src)}
                      title={src}
                      aria-label={`Add ${src}`}
                      className={`relative aspect-square w-full overflow-hidden border bg-white/[0.04] transition-colors ${
                        added ? "border-gold/60" : "border-white/10 hover:border-gold/50"
                      }`}
                    >
                      <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
                      {added ? (
                        <span className="absolute inset-0 grid place-content-center bg-ink/70 text-gold">
                          <Check className="size-5" aria-hidden />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-xs text-cream/40">No supported images found in that folder.</p>
          )}
        </div>
      ) : null}

      <label className="sr-only" htmlFor="image-paths">
        Image paths, one per line
      </label>
      <textarea
        id="image-paths"
        rows={3}
        value={images.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        className={`${CONTROL_CLASS} min-h-20 w-full border px-3 py-2 font-mono text-xs leading-relaxed`}
        placeholder="/images/products/your-image.webp"
      />
    </div>
  );
}
