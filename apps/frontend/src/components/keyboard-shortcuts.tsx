"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

function getModKey() {
  if (typeof navigator === "undefined") return "Ctrl";
  return navigator.platform?.includes("Mac") || navigator.userAgent?.includes("Mac") ? "⌘" : "Ctrl";
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const modKey = getModKey();

  const shortcuts = [
    { keys: [modKey, "K"], desc: "Open command palette" },
    { keys: [modKey, "D"], desc: "Go to Dashboard" },
    { keys: [modKey, "P"], desc: "Go to Portfolio" },
    { keys: [modKey, "T"], desc: "Go to Digital Twin" },
    { keys: [modKey, "C"], desc: "Open AI Copilot" },
    { keys: [modKey, "M"], desc: "Go to Market" },
    { keys: [modKey, "G"], desc: "Go to Goals" },
    { keys: [modKey, "R"], desc: "Go to Reports" },
    { keys: [modKey, "S"], desc: "Go to Settings" },
    { keys: ["?"], desc: "Show keyboard shortcuts" },
    { keys: ["ESC"], desc: "Close overlays" },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="glass-card rounded-2xl border border-white/10 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close keyboard shortcuts" className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {shortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded font-mono min-w-[24px] text-center">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
