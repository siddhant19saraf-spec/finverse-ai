import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status" aria-label="Loading page">
      <div className="relative">
        <Image
          src="/brand/logo-icon.png"
          alt="FinVerse AI"
          width={64}
          height={64}
          className="rounded-2xl animate-pulse"
          priority
        />
        <div className="absolute inset-0 rounded-2xl animate-ping bg-primary/20" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
      </div>
      <p className="text-xs text-muted-foreground">Loading FinVerse AI...</p>
    </div>
  );
}
