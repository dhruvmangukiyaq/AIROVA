import { cn } from "cn";
import { formatPrice } from "@/lib/format";

export interface SalesPoint {
  /** ISO date (yyyy-mm-dd) — used for the `<title>` tooltip. */
  iso: string;
  /** Short axis label, e.g. "6 Oct". */
  label: string;
  value: number;
}

const W = 720;
const H = 236;
const PLOT_H = 176;
const GAP = 8;

function axisTick(value: number): string {
  if (value >= 1000) return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return `₹${value}`;
}

/** Lightweight hand-rolled SVG bar chart — no chart dependency. */
export function SalesChart({ data, className }: { data: SalesPoint[]; className?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const count = Math.max(1, data.length);
  const barW = (W - GAP * (count - 1)) / count;
  const gridValues = [max, max / 2, 0];

  return (
    <div className={cn("px-5 pt-5 pb-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-cream/45 uppercase">
            Last 14 days
          </p>
          <p className="mt-1 text-xl font-medium text-cream tabular-nums">{formatPrice(total)}</p>
        </div>
        <p className="text-xs text-cream/40">
          {total === 0 ? "No paid orders in this window" : `Peak day ${formatPrice(max)}`}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Daily revenue for the last 14 days, totalling ${formatPrice(total)}`}
        className="mt-4 h-56 w-full"
      >
        <defs>
          <linearGradient id="salesBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7ce97" />
            <stop offset="100%" stopColor="#a8823c" />
          </linearGradient>
        </defs>

        {gridValues.map((gv, i) => {
          const y = 12 + PLOT_H - (gv / max) * PLOT_H;
          return (
            <g key={i}>
              <line
                x1="0"
                x2={W}
                y1={y}
                y2={y}
                stroke={gv === 0 ? "#33333a" : "#26262c"}
                strokeDasharray={gv === 0 ? undefined : "3 5"}
              />
              <text x="2" y={y - 5} fontSize="10" fill="#9d998f" letterSpacing="0.5">
                {axisTick(Math.round(gv))}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const height = d.value > 0 ? Math.max(2, (d.value / max) * PLOT_H) : 0;
          const x = i * (barW + GAP);
          const y = 12 + PLOT_H - height;
          return (
            <g key={d.iso}>
              {height > 0 ? (
                <rect x={x} y={y} width={barW} height={height} fill="url(#salesBar)">
                  <title>{`${d.label}: ${formatPrice(d.value)}`}</title>
                </rect>
              ) : (
                <rect
                  x={x}
                  y={12 + PLOT_H - 1}
                  width={barW}
                  height={1}
                  fill="#33333a"
                  aria-hidden
                />
              )}
              <text
                x={x + barW / 2}
                y={12 + PLOT_H + 18}
                fontSize="10"
                textAnchor="middle"
                fill="#6f6b64"
              >
                {d.label.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex items-center justify-between text-[0.6rem] tracking-[0.18em] text-cream/35 uppercase">
        <span>{data[0]?.label ?? ""}</span>
        <span>Revenue by day</span>
        <span>{data[data.length - 1]?.label ?? ""}</span>
      </div>
    </div>
  );
}
