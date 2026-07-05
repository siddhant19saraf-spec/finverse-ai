"use client";
import { useQuery, useMutation, UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

function useApi<T>(
  key: (string | number)[],
  fn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    ...options,
  });
}

export function useDashboard(userId: number) {
  return useApi(["dashboard", userId], () => api.dashboard(userId), {
    enabled: !!userId,
  });
}

export function useDashboardWidget(userId: number, widget: string) {
  return useApi(
    ["dashboard", userId, widget],
    () => api.dashboardWidget(userId, widget),
    { enabled: !!userId && !!widget }
  );
}

export function useMarketIndices() {
  return useApi(["market", "indices"], () => api.market.indices(), {
    refetchInterval: 60_000,
  });
}

export function useMarketQuote(symbol: string) {
  return useApi(
    ["market", "quote", symbol],
    () => api.market.quote(symbol),
    { enabled: !!symbol, refetchInterval: 30_000 }
  );
}

export function useMarketHistorical(symbol: string, interval = "1d", period = "1y") {
  return useApi(
    ["market", "historical", symbol, interval, period],
    () => api.market.historical(symbol, interval, period),
    { enabled: !!symbol }
  );
}

export function useMarketSearch(query: string) {
  return useApi(
    ["market", "search", query],
    () => api.market.search(query),
    { enabled: query.length > 0 }
  );
}

export function useMarketSectors() {
  return useApi(["market", "sectors"], () => api.market.sectors(), {
    refetchInterval: 120_000,
  });
}

export function useMarketGainers(limit = 10) {
  return useApi(["market", "gainers", limit], () => api.market.gainers(limit), {
    refetchInterval: 60_000,
  });
}

export function useMarketLosers(limit = 10) {
  return useApi(["market", "losers", limit], () => api.market.losers(limit), {
    refetchInterval: 60_000,
  });
}

export function useMarketWatchlist(userId = 1) {
  return useApi(
    ["market", "watchlist", userId],
    () => api.market.watchlist(userId),
    { refetchInterval: 30_000 }
  );
}

export function useMarketStatus() {
  return useApi(["market", "status"], () => api.market.status());
}

export function useMarketQuotes(symbols: string[]) {
  return useApi(
    ["market", "quotes", ...symbols],
    () => api.market.quotes(symbols),
    { enabled: symbols.length > 0, refetchInterval: 30_000 }
  );
}

export function useMarketCommodities() {
  return useApi(["market", "commodities"], () => api.market.commodities(), {
    refetchInterval: 120_000,
  });
}

export function useMarketBankRates() {
  return useApi(["market", "bank-rates"], () => api.market.bankRates(), {
    refetchInterval: 300_000,
  });
}

export function useMarketNews() {
  return useApi(["market", "news"], () => api.market.news(), {
    refetchInterval: 120_000,
  });
}

export function usePortfolioSummary(id: number) {
  return useApi(
    ["portfolio", id, "summary"],
    () => api.portfolio.summary(id),
    { enabled: !!id }
  );
}

export function usePortfolioAllocation(id: number) {
  return useApi(
    ["portfolio", id, "allocation"],
    () => api.portfolio.allocation(id),
    { enabled: !!id }
  );
}

export function usePortfolioRisk(id: number) {
  return useApi(
    ["portfolio", id, "risk"],
    () => api.portfolio.risk(id),
    { enabled: !!id }
  );
}

export function usePortfolioPerformance(id: number) {
  return useApi(
    ["portfolio", id, "performance"],
    () => api.portfolio.performance(id),
    { enabled: !!id }
  );
}

export function useDigitalTwinProfile(userId: number) {
  return useApi(
    ["digitalTwin", userId, "profile"],
    () => api.digitalTwin.profile(userId),
    { enabled: !!userId }
  );
}

export function useDigitalTwinScenarios() {
  return useApi(["digitalTwin", "scenarios"], () => api.digitalTwin.scenarios());
}

export function useDigitalTwinSimulate(userId: number) {
  return useMutation({
    mutationFn: (body: any) => api.digitalTwin.simulate(userId, body),
  });
}

export function useDigitalTwinNamedScenario(userId: number) {
  return useMutation({
    mutationFn: ({ type, iterations }: { type: string; iterations?: number }) =>
      api.digitalTwin.namedScenario(userId, type, iterations),
  });
}

export function useDigitalTwinGoalAchievement(userId: number) {
  return useMutation({
    mutationFn: (body: any) => api.digitalTwin.goalAchievement(userId, body),
  });
}

export function useCopilotChat(userId: number) {
  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      api.copilot.chat(userId, message, context),
  });
}

export function useCopilotCapabilities() {
  return useApi(["copilot", "capabilities"], () => api.copilot.capabilities());
}

export function useXaiExplain() {
  return useMutation({
    mutationFn: (body: any) => api.xai.explain(body),
  });
}

export function useComplianceCheck(userId: number) {
  return useMutation({
    mutationFn: (context: any) => api.compliance.check(userId, context),
  });
}

export function useComplianceRegulations() {
  return useApi(
    ["compliance", "regulations"],
    () => api.compliance.regulations()
  );
}

export function useResponsibleAiReport(userId: number) {
  return useMutation({
    mutationFn: ({ action, context }: { action: string; context: any }) =>
      api.responsibleAi.report(userId, action, context),
  });
}
