"use client";
import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useAppStore, type UILanguage } from "@/stores/app";
import en from "./en.json";
import hi from "./hi.json";

const translations: Partial<Record<UILanguage, Record<string, any>>> = { en, hi };

interface I18nContextValue {
  lang: UILanguage;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string) => string;
  formatCurrency: (value: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) as string | undefined;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in params ? String(params[key]) : `{${key}}`));
}

const dateFormats: Partial<Record<UILanguage, Intl.DateTimeFormatOptions>> = {
  en: { day: "numeric", month: "long", year: "numeric" },
  hi: { day: "numeric", month: "long", year: "numeric" },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const lang = useAppStore((s) => s.settings.uiLanguage);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[lang] || translations.en;
      const value = getNestedValue(dict, key);
      if (value === undefined) {
        const fallback = getNestedValue(translations.en, key);
        if (fallback === undefined) return key;
        return params ? interpolate(fallback, params) : fallback;
      }
      return params ? interpolate(value, params) : value;
    },
    [lang]
  );

  const formatDate = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      try {
        return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", dateFormats[lang]).format(d);
      } catch {
        return d.toLocaleDateString("en-IN");
      }
    },
    [lang]
  );

  const formatCurrency = useCallback(
    (value: number): string => {
      try {
        return new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `₹${value.toLocaleString("en-IN")}`;
      }
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, t, formatDate, formatCurrency }), [lang, t, formatDate, formatCurrency]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      lang: "en" as UILanguage,
      t: (key: string) => key,
      formatDate: (d: Date | string) => new Date(d).toLocaleDateString("en-IN"),
      formatCurrency: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    };
  }
  return ctx;
}
