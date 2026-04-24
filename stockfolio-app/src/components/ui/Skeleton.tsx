export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <SkeletonPulse className="h-3 w-24" />
      <SkeletonPulse className="h-8 w-32" />
      <SkeletonPulse className="h-3 w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.03]">
        <SkeletonPulse className="h-5 w-40" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonPulse
                key={j}
                className={`h-4 ${j === 0 ? 'w-28' : 'w-16'} ${j > 0 ? 'ml-auto' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <SkeletonPulse className="h-5 w-48 mb-4" />
      <SkeletonPulse className="h-[200px] w-full rounded-xl" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
