import { AuthSplit } from "@/components/account/auth-split";

/** Skeleton for `/account/login` — mirrors the split shell. */
export default function LoginLoading() {
  return (
    <AuthSplit>
      <div className="grid gap-5" aria-hidden>
        <div className="h-3 w-28 shimmer" />
        <div className="h-9 w-44 shimmer" />
        <div className="h-4 w-full max-w-sm shimmer" />
        <div className="mt-3 h-16 shimmer" />
        <div className="h-16 shimmer" />
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-32 shimmer" />
          <div className="h-4 w-36 shimmer" />
        </div>
        <div className="h-12 shimmer" />
        <div className="h-4 w-2/3 shimmer" />
      </div>
    </AuthSplit>
  );
}
