"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/context";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl border border-white/10 p-8 max-w-md w-full text-center" role="alert" aria-live="polite">
        <Image
          src="/brand/logo-icon.png"
          alt="FinVerse AI Logo"
          width={56}
          height={56}
          className="rounded-2xl mx-auto mb-4"
        />
        <p className="text-6xl font-bold text-primary/20 mb-4" aria-hidden="true">404</p>
        <h2 className="text-xl font-bold mb-2">{t("errors.notFound")}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("errors.notFoundDesc")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t("errors.goToDashboard")}
        </Link>
      </div>
    </div>
  );
}
