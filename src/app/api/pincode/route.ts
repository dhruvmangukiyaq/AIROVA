import { NextRequest } from "next/server";
import { z } from "zod";
import { checkPincode } from "@/lib/commerce";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({ pincode: z.string().trim().regex(/^[1-9]\d{5}$/) });

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "pincode"), 60, 60_000);
  if (!limit.ok) return Response.json({ ok: false, error: "Too many checks." }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Enter a valid 6-digit pincode." }, { status: 400 });
  }

  const result = checkPincode(parsed.data.pincode);
  return Response.json({ ok: true, ...result });
}
