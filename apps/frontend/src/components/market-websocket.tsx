"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/components/toast";

interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume?: number;
}

interface WebSocketContextType {
  quotes: Map<string, MarketQuote>;
  connected: boolean;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useMarketWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useMarketWebSocket must be used within MarketWebSocketProvider");
  return ctx;
}

export function MarketWebSocketProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<Map<string, MarketQuote>>(new Map());
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { addToast } = useToast();
  const subscribedRef = useRef<Set<string>>(new Set());

  const generateMockQuote = useCallback((symbol: string): MarketQuote => {
    const basePrices: Record<string, number> = {
      "NIFTY50": 24567, "SENSEX": 81234, "BANKNIFTY": 51234,
      "RELIANCE": 2850, "TCS": 3920, "INFY": 1680, "HDFCBANK": 1720,
    };
    const base = basePrices[symbol] ?? 1000;
    const change = (Math.random() - 0.48) * base * 0.02;
    return {
      symbol,
      price: Math.round((base + change) * 100) / 100,
      change: Math.round(change * 100) / 100,
      change_pct: Math.round((change / base) * 10000) / 100,
      volume: Math.floor(Math.random() * 1000000),
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiBase.replace("http", "ws") + "/v1/market/ws";

    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    let mockInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          if (subscribedRef.current.size > 0) {
            ws.send(JSON.stringify({ type: "subscribe", symbols: Array.from(subscribedRef.current) }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "quote") {
              setQuotes((prev) => {
                const next = new Map(prev);
                const q = data.quote as MarketQuote;
                const prevQ = next.get(q.symbol);
                if (prevQ && q.price !== prevQ.price) {
                  if (Math.abs(q.change_pct) > 2) {
                    addToast({
                      type: q.change_pct > 0 ? "success" : "warning",
                      title: `${q.symbol} moved ${q.change_pct > 0 ? "+" : ""}${q.change_pct}%`,
                      message: `Price: ₹${q.price.toLocaleString("en-IN")}`,
                      duration: 3000,
                    });
                  }
                }
                next.set(q.symbol, q);
                return next;
              });
            }
          } catch {}
        };

        ws.onerror = () => { setConnected(false); };
        ws.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        setConnected(false);
      }
    };

    connect();

    mockInterval = setInterval(() => {
      if (subscribedRef.current.size > 0) {
        const updates = Array.from(subscribedRef.current).map((s) => generateMockQuote(s));
        setQuotes((prev) => {
          const next = new Map(prev);
          updates.forEach((q) => next.set(q.symbol, q));
          return next;
        });
      }
    }, 3000);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(mockInterval);
      ws?.close();
    };
  }, [generateMockQuote, addToast]);

  const subscribe = useCallback((symbols: string[]) => {
    symbols.forEach((s) => subscribedRef.current.add(s));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", symbols }));
    }
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    symbols.forEach((s) => subscribedRef.current.delete(s));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbols }));
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ quotes, connected, subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}
