"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useMarketWebSocket } from "@/components/market-websocket";
import { NewsTicker } from "./news-ticker";
import { useTranslation } from "@/i18n/context";

export function Header() {
  const { connected } = useMarketWebSocket();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 glass-nav flex flex-col">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4 flex-1 pl-12 lg:pl-0">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden" aria-label="FinVerse AI home">
            <Image
              src="/brand/logo-icon.png"
              alt="FinVerse AI"
              width={28}
              height={28}
              className="rounded-lg"
            />
          </Link>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="global-search" className="sr-only">{t("common.search")}</label>
            <input
              id="global-search"
              type="search"
              placeholder={t("common.searchPlaceholder")}
              onFocus={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
              }}
              readOnly
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs" title={connected ? "Live data connected" : "Using mock data"}>
            {connected ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 hidden sm:inline">{t("common.live")}</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400 hidden sm:inline">{t("common.mock")}</span>
              </>
            )}
          </div>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all relative"
            aria-label={t("settings.notifications")}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
          </button>
        </div>
      </div>
      <NewsTicker />
    </header>
  );
}
