"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Briefcase, Brain, MessageSquare, TrendingUp,
  Target, FileText, Settings, Moon, Sun, LogOut, Zap, BarChart3,
  ArrowRight, CornerDownLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  shortcut?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleSidebar } = useAppStore();

  const items: CommandItem[] = [
    { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: () => router.push("/dashboard"), category: "Navigation", shortcut: "G D" },
    { id: "portfolio", label: "Go to Portfolio", icon: Briefcase, action: () => router.push("/portfolio"), category: "Navigation", shortcut: "G P" },
    { id: "digital-twin", label: "Go to Digital Twin", icon: Brain, action: () => router.push("/digital-twin"), category: "Navigation", shortcut: "G T" },
    { id: "copilot", label: "Open AI Copilot", icon: MessageSquare, action: () => router.push("/copilot"), category: "Navigation", shortcut: "G C" },
    { id: "market", label: "Go to Market", icon: TrendingUp, action: () => router.push("/market"), category: "Navigation", shortcut: "G M" },
    { id: "goals", label: "Go to Goals", icon: Target, action: () => router.push("/goals"), category: "Navigation", shortcut: "G G" },
    { id: "reports", label: "Go to Reports", icon: FileText, action: () => router.push("/reports"), category: "Navigation", shortcut: "G R" },
    { id: "settings", label: "Go to Settings", icon: Settings, action: () => router.push("/settings"), category: "Navigation", shortcut: "G S" },
    { id: "sidebar", label: "Toggle Sidebar", icon: BarChart3, action: () => { toggleSidebar(); setOpen(false); }, category: "Actions" },
    { id: "theme", label: "Toggle Theme", icon: Moon, action: () => setOpen(false), category: "Actions" },
    { id: "home", label: "Back to Home", icon: Zap, action: () => router.push("/"), category: "Navigation" },
  ];

  const filtered = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setOpen(false);
    }
  };

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  aria-label="Search commands"
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <kbd className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">ESC</kbd>
              </div>
              <div className="max-h-[300px] overflow-y-auto py-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="px-4 py-1.5 text-xs text-muted-foreground font-medium">{category}</p>
                    {items.map((item) => {
                      const idx = filtered.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { item.action(); setOpen(false); }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            idx === selectedIndex ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.shortcut && (
                            <kbd className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
                          )}
                          <CornerDownLeft className="w-3 h-3 opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</p>
                )}
              </div>
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">↵</kbd> select</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
