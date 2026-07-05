const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse<T> {
  data: T;
  status: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; env: string; version: string }>("/health"),
  root: () => request<{ name: string; modules: string[] }>("/v1"),

  dashboard: (userId: number) => request<any>(`/v1/dashboard/${userId}`),
  dashboardWidget: (userId: number, widget: string) => request<any>(`/v1/dashboard/${userId}/${widget}`),

  copilot: {
    chat: (userId: number, message: string, context?: any) =>
      request<any>(`/v1/copilot/chat/${userId}`, {
        method: "POST",
        body: JSON.stringify({ message, context: context || {} }),
      }),
    capabilities: () => request<any>("/v1/copilot/capabilities"),
  },

  market: {
    indices: () => request<any[]>("/v1/market/indices"),
    index: (symbol: string) => request<any>(`/v1/market/indices/${symbol}`),
    quote: (symbol: string) => request<any>(`/v1/market/quote/${symbol}`),
    quotes: (symbols: string[]) =>
      request<any[]>("/v1/market/quotes", {
        method: "POST",
        body: JSON.stringify({ symbols }),
      }),
    historical: (symbol: string, interval = "1d", period = "1y") =>
      request<any>(`/v1/market/historical/${symbol}?interval=${interval}&period=${period}`),
    search: (q: string) => request<any[]>(`/v1/market/search?q=${encodeURIComponent(q)}`),
    sectors: () => request<any[]>("/v1/market/sectors"),
    sector: (name: string) => request<any>(`/v1/market/sectors/${name}`),
    gainers: (limit = 10) => request<any[]>(`/v1/market/gainers?limit=${limit}`),
    losers: (limit = 10) => request<any[]>(`/v1/market/losers?limit=${limit}`),
    watchlist: (userId = 1) => request<any>(`/v1/market/watchlist?user_id=${userId}`),
    status: () => request<any>("/v1/market/status"),
    symbols: (exchange?: string) =>
      request<any[]>(`/v1/market/symbols${exchange ? `?exchange=${exchange}` : ""}`),
    commodities: () => request<any[]>("/v1/market/commodities"),
    bankRates: () => request<any[]>("/v1/market/bank-rates"),
    news: () => request<any[]>("/v1/market/news"),
  },

  portfolio: {
    summary: (id: number) => request<any>(`/v1/portfolios/${id}/summary`),
    allocation: (id: number) => request<any>(`/v1/portfolios/${id}/allocation`),
    risk: (id: number) => request<any>(`/v1/portfolios/${id}/risk`),
    performance: (id: number) => request<any>(`/v1/portfolios/${id}/performance`),
  },

  digitalTwin: {
    profile: (userId: number) => request<any>(`/v1/digital-twin/profile/${userId}`),
    scenario: (userId: number, body: any) =>
      request<any>(`/v1/digital-twin/scenario/${userId}`, {
        method: "POST", body: JSON.stringify(body),
      }),
    namedScenario: (userId: number, type: string, iterations = 1000) =>
      request<any>(`/v1/digital-twin/named-scenario/${userId}/${type}?iterations=${iterations}`, {
        method: "POST",
      }),
    whatIf: (userId: number, body: any) =>
      request<any>(`/v1/digital-twin/what-if/${userId}`, {
        method: "POST", body: JSON.stringify(body),
      }),
    health: (userId: number) => request<any>(`/v1/digital-twin/health/${userId}`),
    scenarios: () => request<any>("/v1/digital-twin/scenarios"),
    simulate: (userId: number, body: any) =>
      request<any>(`/v1/digital-twin/simulate/${userId}`, {
        method: "POST", body: JSON.stringify(body),
      }),
    goalAchievement: (userId: number, body: any) =>
      request<any>(`/v1/digital-twin/goal-achievement/${userId}`, {
        method: "POST", body: JSON.stringify(body),
      }),
  },

  xai: {
    explain: (body: any) =>
      request<any>("/v1/xai/explain", {
        method: "POST", body: JSON.stringify(body),
      }),
  },

  compliance: {
    check: (userId: number, context: any) =>
      request<any>(`/v1/compliance/check/${userId}`, {
        method: "POST", body: JSON.stringify({ context }),
      }),
    regulations: () => request<any>("/v1/compliance/regulations"),
  },

  responsibleAi: {
    report: (userId: number, action: string, context: any) =>
      request<any>(`/v1/responsible-ai/report/${userId}`, {
        method: "POST", body: JSON.stringify({ action, context }),
      }),
  },
};
