import { AuthSplit } from "@/components/account/auth-split";

/** Skeleton for `/account/register` — mirrors the split shell. */
export default function RegisterLoading() {
  return (
    <AuthSplit>
      <div className="grid gap-5" aria-hidden>
        <div className="h-3 w-32 shimmer" />
        <div className="h-9 w-56 shimmer" />
        <div className="h-4 w-full max-w-sm shimmer" />
        <div className="mt-3 h-16 shimmer" />
        <div className="h-16 shimmer" />
        <div className="h-16 shimmer" />
        <div className="h-16 shimmer" />
        <div className="h-16 shimmer" />
        <div className="h-4 w-3/4 shimmer" />
        <div className="h-12 shimmer" />
        <div className="h-4 w-2/3 shimmer" />
      </div>
    </AuthSplit>
  );
}
