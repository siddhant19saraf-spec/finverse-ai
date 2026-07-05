"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FINVERSE ERROR]", error?.message, error?.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md w-full text-center" role="alert" aria-live="assertive">
        <Image
          src="/brand/logo-icon.png"
          alt="FinVerse AI"
          width={48}
          height={48}
          className="rounded-2xl mx-auto mb-4"
        />
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">
          An unexpected error occurred. Your data is safe.
        </p>
        {error?.message && (
          <p className="text-xs text-red-400/80 mb-4 font-mono break-all max-h-20 overflow-y-auto">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
