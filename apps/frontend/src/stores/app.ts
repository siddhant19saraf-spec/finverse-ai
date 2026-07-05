import { create } from "zustand";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  pan: string;
  kycStatus: string;
  age: number;
  income: number;
  monthlySip: number;
  riskProfile: string;
  goal: string;
}

const demoUser: UserProfile = {
  name: "Siddhant Saraf",
  email: "siddhant@finverse.ai",
  phone: "+91 98765 43210",
  pan: "ABCDE1234F",
  kycStatus: "Verified",
  age: 28,
  income: 1200000,
  monthlySip: 10000,
  riskProfile: "Moderate",
  goal: "Buy Home in 8 Years",
};

export type Theme = "dark" | "light" | "system";
export type AccentColor = "blue" | "purple" | "emerald";
export type AnimationLevel = "low" | "medium" | "high";
export type UILanguage = "en" | "hi" | "mr" | "ta" | "te" | "kn" | "bn" | "gu";
export type TypeAILanguage = "en" | "hi";

interface SettingsState {
  theme: Theme;
  accentColor: AccentColor;
  animationLevel: AnimationLevel;
  uiLanguage: UILanguage;
  aiLanguage: TypeAILanguage;
  aiPersonality: string;
  aiDetailLevel: string;
  responseLength: string;
  glassEffects: boolean;
  educationalMode: boolean;
  autoRebalancing: boolean;
  riskAppetite: string;
  preferredAssets: string[];
  notifications: {
    market: boolean;
    goals: boolean;
    news: boolean;
    portfolio: boolean;
    email: boolean;
    push: boolean;
  };
}

const defaultSettings: SettingsState = {
  theme: "dark",
  accentColor: "blue",
  animationLevel: "medium",
  uiLanguage: "en",
  aiLanguage: "en",
  aiPersonality: "Professional",
  aiDetailLevel: "Intermediate",
  responseLength: "Detailed",
  glassEffects: true,
  educationalMode: true,
  autoRebalancing: false,
  riskAppetite: "Moderate",
  preferredAssets: ["Stocks", "Mutual Funds", "ETF", "Gold"],
  notifications: {
    market: true,
    goals: true,
    news: true,
    portfolio: true,
    email: false,
    push: false,
  },
};

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  userId: number;
  setUserId: (id: number) => void;
  profile: UserProfile;
  isDemoMode: boolean;
  setDemoMode: (demo: boolean) => void;
  demoBannerVisible: boolean;
  setDemoBannerVisible: (visible: boolean) => void;
  settings: SettingsState;
  updateSettings: (patch: Partial<SettingsState>) => void;
  updateNotifications: (patch: Partial<SettingsState["notifications"]>) => void;
}

function loadSettings(): Partial<SettingsState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("finverse_settings");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(s: SettingsState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("finverse_settings", JSON.stringify(s)); } catch {}
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  userId: 1,
  setUserId: (id) => set({ userId: id }),
  profile: demoUser,
  isDemoMode: false,
  setDemoMode: (demo) => set({ isDemoMode: demo }),
  demoBannerVisible: true,
  setDemoBannerVisible: (visible) => set({ demoBannerVisible: visible }),
  settings: { ...defaultSettings, ...loadSettings() },
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    set({ settings: next });
  },
  updateNotifications: (patch) => {
    const next = { ...get().settings, notifications: { ...get().settings.notifications, ...patch } };
    saveSettings(next);
    set({ settings: next });
  },
}));
