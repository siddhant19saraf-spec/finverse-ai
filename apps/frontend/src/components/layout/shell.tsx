"use client";
import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ToastProvider } from "@/components/toast";
import { MarketWebSocketProvider } from "@/components/market-websocket";
import { DemoBanner } from "@/components/demo-banner";
import { useAppStore } from "@/stores/app";

export const SIDEBAR_OPEN = 260;
export const SIDEBAR_CLOSED = 72;

function AppShellInner({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const demoBannerVisible = useAppStore((s) => s.demoBannerVisible);
  const setDemoBannerVisible = useAppStore((s) => s.setDemoBannerVisible);

  return (
    <div className="min-h-screen">
      {isDemoMode && demoBannerVisible && (
        <DemoBanner onDismiss={() => setDemoBannerVisible(false)} />
      )}
      <Sidebar />
      <CommandPalette />
      <KeyboardShortcuts />

      <div
        className="relative z-10 min-h-screen flex flex-col transition-[margin] duration-300 ease-linear"
        style={{ marginLeft: sidebarOpen ? SIDEBAR_OPEN : SIDEBAR_CLOSED }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MarketWebSocketProvider>
        <AppShellInner>{children}</AppShellInner>
      </MarketWebSocketProvider>
    </ToastProvider>
  );
}
