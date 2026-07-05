"use client";
import { Loader2, AlertCircle } from "lucide-react";

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-[50vh]" role="status" aria-label="Loading">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export function CardSpinner() {
  return (
    <div className="flex items-center justify-center h-40" role="status" aria-label="Loading">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

export function InlineSpinner() {
  return <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />;
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4" role="alert" aria-live="assertive">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm glass rounded-lg hover:bg-white/10 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-4 rounded-xl glass border border-red-500/20 bg-red-500/5 flex items-center justify-between" role="alert" aria-live="assertive">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-400 hover:text-red-300 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const shimmerStyle = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
};

export function StatSkeleton() {
  return (
    <div className="rounded-xl glass-card p-5 space-y-3">
      <div
        className="h-3 w-1/2 rounded bg-white/5"
        style={shimmerStyle}
      />
      <div
        className="h-6 w-2/3 rounded bg-white/5"
        style={shimmerStyle}
      />
      <div
        className="h-3 w-1/3 rounded bg-white/5"
        style={shimmerStyle}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl glass-card p-5 space-y-3">
      <div
        className="h-4 w-1/3 rounded bg-white/5"
        style={shimmerStyle}
      />
      <div
        className="h-3 w-full rounded bg-white/5"
        style={shimmerStyle}
      />
      <div
        className="h-3 w-5/6 rounded bg-white/5"
        style={shimmerStyle}
      />
      <div
        className="h-3 w-4/6 rounded bg-white/5"
        style={shimmerStyle}
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero stat cards */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
