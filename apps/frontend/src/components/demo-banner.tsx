"use client";
import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoBannerProps {
  onDismiss?: () => void;
}

export function DemoBanner({ onDismiss }: DemoBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-sm border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Image
              src="/brand/logo-icon.png"
              alt=""
              width={16}
              height={16}
              className="rounded"
            />
            <span className="text-sm font-semibold text-white">Demo Mode</span>
          </div>
          <span className="text-xs text-blue-100 hidden sm:inline">
            Exploring as Siddhant Saraf · Data is simulated for demonstration
          </span>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Dismiss demo banner"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
