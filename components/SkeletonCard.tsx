/**
 * Loading placeholder that mirrors the dimensions and layout of a real
 * TaskCard so the board doesn't shift when data arrives.
 */
export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-3 shadow-sm">
      {/* title line */}
      <div className="h-4 w-3/4 rounded bg-white/10" />
      {/* meta row: priority badge + due date */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-5 w-14 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/5" />
      </div>
      {/* label chips */}
      <div className="mt-3 flex gap-1.5">
        <div className="h-4 w-10 rounded-full bg-white/5" />
        <div className="h-4 w-12 rounded-full bg-white/5" />
      </div>
    </div>
  );
}
