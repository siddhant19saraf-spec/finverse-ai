"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Bell, Palette, Globe, Brain, TrendingUp, FileText,
  Info, Save, CheckCircle2, ChevronDown, ChevronRight, Lock, Eye,
  Download, Trash2, Cookie, Moon, Sun, Monitor, Sparkles, Mic,
  Languages, Settings as SettingsIcon, Smartphone, Laptop, Key,
  Clock, AlertTriangle, ShieldCheck, ExternalLink, Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore, type Theme, type AccentColor, type AnimationLevel, type UILanguage, type TypeAILanguage } from "@/stores/app";
import { cn } from "@/lib/utils";

const languages: { code: UILanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
];

const aiLanguages: { code: TypeAILanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
];

const themes: { value: Theme; label: string; icon: any }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

const accentColors: { value: AccentColor; label: string; color: string }[] = [
  { value: "blue", label: "Blue", color: "#3B82F6" },
  { value: "purple", label: "Purple", color: "#8B5CF6" },
  { value: "emerald", label: "Emerald", color: "#10B981" },
];

const animLevels: { value: AnimationLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const assetClasses = ["Stocks", "ETF", "Mutual Funds", "Gold", "Bonds"];

function Toggle({ checked, onChange, label, id, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; id: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
          checked ? "bg-primary" : "bg-white/10"
        )}>
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-5"
        )} />
      </button>
    </div>
  );
}

function SelectGroup({ value, onChange, options, label, id }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium mb-2 block">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, updateNotifications, profile } = useAppStore();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "+91 98765 43210");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("account");

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleAsset = (asset: string) => {
    const current = settings.preferredAssets;
    const next = current.includes(asset) ? current.filter((a) => a !== asset) : [...current, asset];
    updateSettings({ preferredAssets: next });
  };

  const sections = [
    { id: "account", icon: User, title: "Account", color: "from-blue-500 to-cyan-400", content: renderAccount },
    { id: "language", icon: Globe, title: "Language & Region", color: "from-emerald-500 to-teal-400", content: renderLanguage },
    { id: "ai", icon: Brain, title: "AI Preferences", color: "from-purple-500 to-pink-400", content: renderAI },
    { id: "notifications", icon: Bell, title: "Notifications", color: "from-amber-500 to-orange-400", content: renderNotifications },
    { id: "security", icon: Shield, title: "Security", color: "from-red-500 to-pink-400", content: renderSecurity },
    { id: "appearance", icon: Palette, title: "Appearance", color: "from-violet-500 to-purple-400", content: renderAppearance },
    { id: "investment", icon: TrendingUp, title: "Investment Preferences", color: "from-cyan-500 to-blue-400", content: renderInvestment },
    { id: "privacy", icon: Lock, title: "Privacy", color: "from-rose-500 to-red-400", content: renderPrivacy },
    { id: "about", icon: Info, title: "About", color: "from-slate-500 to-gray-400", content: renderAbout },
  ];

  function renderAccount() {
    return (
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">PAN Number</label>
            <input value="ABCDE1234F" disabled
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div>
              <p className="text-sm font-medium">KYC Status</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div>
              <p className="text-sm font-medium">Linked Brokers</p>
              <p className="text-xs text-muted-foreground">1 broker connected</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </CardContent>
    );
  }

  function renderLanguage() {
    return (
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">UI Language</label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => updateSettings({ uiLanguage: lang.code })}
                className={cn("flex items-center gap-2 p-3 rounded-lg border text-sm transition-all text-left",
                  settings.uiLanguage === lang.code
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {settings.uiLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectGroup id="region" label="Region" value="in" onChange={() => { }}
            options={[{ value: "in", label: "India" }]} />
          <SelectGroup id="currency" label="Currency" value="INR" onChange={() => { }}
            options={[{ value: "INR", label: "INR ₹" }, { value: "USD", label: "USD $" }]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectGroup id="dateformat" label="Date Format" value="DD/MM/YYYY" onChange={() => { }}
            options={[{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" }, { value: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }]} />
          <SelectGroup id="timezone" label="Timezone" value="Asia/Kolkata" onChange={() => { }}
            options={[{ value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" }]} />
        </div>
      </CardContent>
    );
  }

  function renderAI() {
    return (
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectGroup id="ai-personality" label="AI Personality" value={settings.aiPersonality}
            onChange={(v) => updateSettings({ aiPersonality: v })}
            options={["Professional", "Friendly", "Concise", "Detailed"].map((p) => ({ value: p, label: p }))} />
          <SelectGroup id="ai-detail" label="AI Detail Level" value={settings.aiDetailLevel}
            onChange={(v) => updateSettings({ aiDetailLevel: v })}
            options={["Beginner", "Intermediate", "Expert"].map((d) => ({ value: d, label: d }))} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">AI Response Language</label>
          <div className="flex gap-2">
            {aiLanguages.map((lang) => (
              <button key={lang.code} onClick={() => updateSettings({ aiLanguage: lang.code })}
                className={cn("px-4 py-2 rounded-lg border text-sm transition-all",
                  settings.aiLanguage === lang.code
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">Independent from UI language. AI will respond in this language regardless of interface language.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Response Length</label>
          <div className="flex gap-2">
            {["Short", "Medium", "Detailed"].map((len) => (
              <button key={len} onClick={() => updateSettings({ responseLength: len })}
                className={cn("px-4 py-2 rounded-lg border text-sm transition-all",
                  settings.responseLength === len
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                {len}
              </button>
            ))}
          </div>
        </div>
        <Toggle id="edu-mode" label="Educational Mode" description="Show explanations and disclaimers with AI responses"
          checked={settings.educationalMode} onChange={(v) => updateSettings({ educationalMode: v })} />
      </CardContent>
    );
  }

  function renderNotifications() {
    const n = settings.notifications;
    return (
      <CardContent className="space-y-0">
        <Toggle id="notif-market" label="Market Alerts" description="Price movements, index changes, sector shifts"
          checked={n.market} onChange={(v) => updateNotifications({ market: v })} />
        <Toggle id="notif-goals" label="Goal Reminders" description="SIP due dates, goal milestones, progress updates"
          checked={n.goals} onChange={(v) => updateNotifications({ goals: v })} />
        <Toggle id="notif-news" label="News Alerts" description="Breaking news that impacts your portfolio"
          checked={n.news} onChange={(v) => updateNotifications({ news: v })} />
        <Toggle id="notif-portfolio" label="Portfolio Alerts" description="P&L updates, rebalancing needs, allocation changes"
          checked={n.portfolio} onChange={(v) => updateNotifications({ portfolio: v })} />
        <Toggle id="notif-email" label="Email Notifications" description="Weekly summary and important alerts via email"
          checked={n.email} onChange={(v) => updateNotifications({ email: v })} />
        <Toggle id="notif-push" label="Push Notifications" description="Real-time browser notifications"
          checked={n.push} onChange={(v) => updateNotifications({ push: v })} />
      </CardContent>
    );
  }

  function renderSecurity() {
    return (
      <CardContent className="space-y-1">
        {[
          { title: "Password", desc: "Last changed 30 days ago", action: "Change", variant: "outline" as const },
          { title: "Two-Factor Authentication", desc: "Add an extra layer of security", action: "Enable", variant: "outline" as const },
          { title: "Passkeys", desc: "Sign in with biometrics or security key", action: "Setup", variant: "outline" as const },
          { title: "Devices", desc: "2 devices currently signed in", action: "Manage", variant: "outline" as const },
          { title: "Active Sessions", desc: "Chrome on Windows · Last active 2h ago", action: "Revoke All", variant: "ghost" as const, danger: true },
          { title: "Login History", desc: "Last login: Today 09:15 AM from Mumbai", action: "View", variant: "outline" as const },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Button variant={item.variant} size="sm" className={item.danger ? "text-red-400 hover:text-red-300" : ""}>
              {item.action}
            </Button>
          </div>
        ))}
      </CardContent>
    );
  }

  function renderAppearance() {
    return (
      <CardContent className="space-y-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button key={t.value} onClick={() => updateSettings({ theme: t.value })}
                className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  settings.theme === t.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                <t.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Accent Color</label>
          <div className="flex gap-3">
            {accentColors.map((c) => (
              <button key={c.value} onClick={() => updateSettings({ accentColor: c.value })}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                  settings.accentColor === c.value
                    ? "border-white/20 bg-white/[0.05]"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                )}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm">{c.label}</span>
                {settings.accentColor === c.value && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Animation Level</label>
          <div className="flex gap-2">
            {animLevels.map((a) => (
              <button key={a.value} onClick={() => updateSettings({ animationLevel: a.value })}
                className={cn("px-4 py-2 rounded-lg border text-sm transition-all",
                  settings.animationLevel === a.value
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <Toggle id="glass-effects" label="Glass Effects" description="Enable glassmorphism blur and transparency effects"
          checked={settings.glassEffects} onChange={(v) => updateSettings({ glassEffects: v })} />
      </CardContent>
    );
  }

  function renderInvestment() {
    return (
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Risk Appetite</label>
          <div className="grid grid-cols-3 gap-2">
            {["Conservative", "Moderate", "Aggressive"].map((r) => (
              <button key={r} onClick={() => updateSettings({ riskAppetite: r })}
                className={cn("p-3 rounded-xl border text-sm text-center transition-all",
                  settings.riskAppetite === r
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Preferred Asset Classes</label>
          <div className="flex flex-wrap gap-2">
            {assetClasses.map((asset) => (
              <button key={asset} onClick={() => toggleAsset(asset)}
                className={cn("px-3 py-1.5 rounded-lg border text-xs transition-all",
                  settings.preferredAssets.includes(asset)
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04]"
                )}>
                {asset}
              </button>
            ))}
          </div>
        </div>
        <Toggle id="auto-rebalance" label="Auto Rebalancing" description="Automatically rebalance portfolio when allocation drifts >5%"
          checked={settings.autoRebalancing} onChange={(v) => updateSettings({ autoRebalancing: v })} />
      </CardContent>
    );
  }

  function renderPrivacy() {
    return (
      <CardContent className="space-y-1">
        {[
          { icon: Download, title: "Download My Data", desc: "Export all your portfolio and account data", action: "Export", color: "text-blue-400" },
          { icon: Trash2, title: "Delete Account", desc: "Permanently delete your account and all data", action: "Delete", color: "text-red-400", danger: true },
          { icon: ShieldCheck, title: "Consent Management", desc: "Manage data processing and AI training consent", action: "Manage", color: "text-emerald-400" },
          { icon: Cookie, title: "Cookie Preferences", desc: "Control cookie and tracking preferences", action: "Configure", color: "text-amber-400" },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Button variant={item.danger ? "destructive" : "outline"} size="sm">{item.action}</Button>
          </div>
        ))}
      </CardContent>
    );
  }

  function renderAbout() {
    return (
      <CardContent className="space-y-3">
        {[
          { label: "Version", value: "1.0.0-beta" },
          { label: "API Status", value: "Connected", badge: "success" as const },
          { label: "Market Provider", value: "Yahoo Finance" },
          { label: "Backend", value: "Connected", badge: "success" as const },
          { label: "Build", value: "Next.js 15 + FastAPI" },
          { label: "License", value: "MIT" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            {item.badge ? (
              <Badge variant={item.badge} className="text-[10px]">{item.value}</Badge>
            ) : (
              <span className="text-sm font-medium">{item.value}</span>
            )}
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
          FINVERSE AI — India&apos;s Responsible AI Wealth Operating System
        </p>
      </CardContent>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account, preferences, and AI experience</p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving} className="gap-2">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}>
            <Card className="overflow-hidden">
              <button onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                aria-expanded={expandedSection === section.id}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", section.color)}>
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200",
                  expandedSection === section.id && "rotate-180"
                )} />
              </button>
              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-white/5">
                      {section.content()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
