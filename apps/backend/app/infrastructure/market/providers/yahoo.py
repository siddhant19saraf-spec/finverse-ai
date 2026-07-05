from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Optional

from app.domain.market.entities import (
    CorporateAction,
    HistoricalData,
    IndexData,
    OHLCV,
    Quote,
    SearchResult,
    SectorData,
    Symbol,
)
from app.domain.market.enums import AssetType, Exchange, Interval
from app.infrastructure.market.providers.base import MarketDataProvider

logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=4)

NSE_INDICES = {
    "^NSEI": ("NIFTY 50", "NIFTY50.NS"),
    "^NSEBANK": ("NIFTY Bank", "BANKNIFTY.NS"),
    "^BSESN": ("SENSEX", "SENSEX.BO"),
}

NSE_SECTOR_ETFS = {
    "NIFTY IT": "^CNXIT",
    "NIFTY Bank": "^NSEBANK",
    "NIFTY Pharma": "^CNXPHARMA",
    "NIFTY Auto": "^CNXAUTO",
    "NIFTY FMCG": "^CNXFMCG",
    "NIFTY Metal": "^CNXMETAL",
    "NIFTY Energy": "^CNXENERGY",
    "NIFTY Realty": "^CNXREALTY",
    "NIFTY Infra": "^CNXINFRA",
    "NIFTY Media": "^CNXMEDIA",
}

BSE_SECTOR_MAP = {
    "Technology": ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS"],
    "Financial Services": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS"],
    "Energy": ["RELIANCE.NS", "ONGC.NS", "BPCL.NS", "IOC.NS"],
    "Consumer Goods": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS"],
    "Automobiles": ["MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS"],
    "Pharmaceuticals": ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS"],
    "Metals": ["TATASTEEL.NS", "HINDALCO.NS", "JSWSTEEL.NS", "VEDL.NS"],
}


def _to_decimal(value) -> Decimal:
    if value is None:
        return Decimal("0")
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return Decimal("0")


def _safe_int(value) -> int:
    if value is None:
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0


def _run_sync(func, *args):
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(_executor, func, *args)


class YahooFinanceProvider(MarketDataProvider):

    def _import_yf(self):
        import yfinance as yf
        return yf

    async def get_quote(self, symbol: str) -> Optional[Quote]:
        try:
            yf = self._import_yf()
            ticker = await _run_sync(yf.Ticker, symbol)
            info = await _run_sync(lambda t: t.info, ticker)

            price_raw = info.get("currentPrice") or info.get("regularMarketPrice")
            if price_raw is None or _to_decimal(price_raw) == 0:
                return None

            price = _to_decimal(info.get("currentPrice") or info.get("regularMarketPrice"))
            prev_close = _to_decimal(info.get("previousClose") or info.get("regularMarketPreviousClose"))
            change = price - prev_close if prev_close else Decimal("0")
            change_pct = (change / prev_close * 100) if prev_close else Decimal("0")

            return Quote(
                symbol=symbol,
                price=price,
                change=change.quantize(Decimal("0.01")),
                change_pct=change_pct.quantize(Decimal("0.01")),
                open=_to_decimal(info.get("open") or info.get("regularMarketOpen")),
                high=_to_decimal(info.get("dayHigh") or info.get("regularMarketDayHigh")),
                low=_to_decimal(info.get("dayLow") or info.get("regularMarketDayLow")),
                previous_close=prev_close,
                volume=_safe_int(info.get("volume") or info.get("regularMarketVolume")),
                avg_volume=_safe_int(info.get("averageVolume")),
                market_cap=_to_decimal(info.get("marketCap")),
                pe_ratio=_to_decimal(info.get("trailingPE")),
                eps=_to_decimal(info.get("trailingEps")),
                week_52_high=_to_decimal(info.get("fiftyTwoWeekHigh")),
                week_52_low=_to_decimal(info.get("fiftyTwoWeekLow")),
                dividend_yield=_to_decimal(info.get("dividendYield")),
                timestamp=datetime.now(timezone.utc),
                provider="yahoo",
            )
        except Exception as e:
            logger.warning("Yahoo quote failed for %s: %s", symbol, e)
            return None

    async def get_quotes(self, symbols: list[str]) -> list[Quote]:
        try:
            yf = self._import_yf()
            tickers_str = " ".join(symbols)
            tickers = await _run_sync(yf.Tickers, tickers_str)

            results = []
            for symbol in symbols:
                try:
                    info = await _run_sync(lambda t, s=s: getattr(t, s).info, tickers)
                    if not info or info.get("currentPrice") is None:
                        continue
                    if _to_decimal(info.get("currentPrice")) == 0:
                        continue

                    price = _to_decimal(info.get("currentPrice"))
                    prev_close = _to_decimal(info.get("previousClose"))
                    change = price - prev_close if prev_close else Decimal("0")
                    change_pct = (change / prev_close * 100) if prev_close else Decimal("0")

                    results.append(Quote(
                        symbol=symbol,
                        price=price,
                        change=change.quantize(Decimal("0.01")),
                        change_pct=change_pct.quantize(Decimal("0.01")),
                        open=_to_decimal(info.get("open")),
                        high=_to_decimal(info.get("dayHigh")),
                        low=_to_decimal(info.get("dayLow")),
                        previous_close=prev_close,
                        volume=_safe_int(info.get("volume")),
                        market_cap=_to_decimal(info.get("marketCap")),
                        pe_ratio=_to_decimal(info.get("trailingPE")),
                        week_52_high=_to_decimal(info.get("fiftyTwoWeekHigh")),
                        week_52_low=_to_decimal(info.get("fiftyTwoWeekLow")),
                        timestamp=datetime.now(timezone.utc),
                        provider="yahoo",
                    ))
                except Exception as e:
                    logger.debug("Yahoo quote skip %s: %s", symbol, e)
            return results
        except Exception as e:
            logger.warning("Yahoo batch quotes failed: %s", e)
            return []

    async def get_historical(
        self, symbol: str, interval: Interval, period: str = "1y"
    ) -> HistoricalData:
        try:
            yf = self._import_yf()
            ticker = await _run_sync(yf.Ticker, symbol)

            yf_interval_map = {
                Interval.ONE_MIN: "1m",
                Interval.FIVE_MIN: "5m",
                Interval.FIFTEEN_MIN: "15m",
                Interval.THIRTY_MIN: "30m",
                Interval.ONE_HOUR: "1h",
                Interval.ONE_DAY: "1d",
                Interval.ONE_WEEK: "1wk",
                Interval.ONE_MONTH: "1mo",
            }
            yf_period_map = {
                "1d": "1d", "5d": "5d", "1mo": "1mo", "3mo": "3mo",
                "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y", "max": "max",
            }

            yf_interval = yf_interval_map.get(interval, "1d")
            yf_period = yf_period_map.get(period, "1y")

            df = await _run_sync(
                lambda t, i, p: t.history(period=p, interval=i),
                ticker, yf_interval, yf_period,
            )

            if df is None or df.empty:
                return HistoricalData(symbol=symbol, interval=interval, data=[])

            data = []
            for idx, row in df.iterrows():
                ts = idx.to_pydatetime()
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                data.append(OHLCV(
                    timestamp=ts,
                    open=_to_decimal(row.get("Open")),
                    high=_to_decimal(row.get("High")),
                    low=_to_decimal(row.get("Low")),
                    close=_to_decimal(row.get("Close")),
                    volume=_safe_int(row.get("Volume")),
                ))

            return HistoricalData(symbol=symbol, interval=interval, data=data)
        except Exception as e:
            logger.warning("Yahoo historical failed for %s: %s", symbol, e)
            return HistoricalData(symbol=symbol, interval=interval, data=[])

    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]:
        try:
            yf = self._import_yf()
            results_raw = await _run_sync(
                lambda q: yf.Search(q).quotes if hasattr(yf.Search(q), "quotes") else [],
                query,
            )

            results = []
            for item in (results_raw or []):
                symbol = item.get("symbol", "")
                name = item.get("shortname") or item.get("longname", "")
                quote_type = item.get("quoteType", "").upper()

                at = AssetType.EQUITY
                if quote_type == "ETF":
                    at = AssetType.ETF
                elif quote_type == "INDEX":
                    at = AssetType.INDEX

                if asset_type and at != asset_type:
                    continue

                exchange_str = item.get("exchange", "")
                ex = Exchange.NSE
                if "BSE" in exchange_str.upper():
                    ex = Exchange.BSE

                results.append(SearchResult(
                    ticker=symbol, name=name,
                    asset_type=at, exchange=ex,
                    sector=item.get("sector"),
                ))

            return results[:20]
        except Exception as e:
            logger.warning("Yahoo search failed for %s: %s", query, e)
            return []

    async def get_symbol(self, ticker: str) -> Optional[Symbol]:
        try:
            yf = self._import_yf()
            t = await _run_sync(yf.Ticker, ticker)
            info = await _run_sync(lambda t: t.info, t)

            if not info or not info.get("shortName"):
                return None

            quote_type = info.get("quoteType", "").upper()
            at = AssetType.EQUITY
            if quote_type == "ETF":
                at = AssetType.ETF
            elif quote_type == "INDEX":
                at = AssetType.INDEX

            exchange_str = info.get("exchange", "")
            ex = Exchange.NSE
            if "BSE" in exchange_str.upper():
                ex = Exchange.BSE

            return Symbol(
                ticker=ticker,
                name=info.get("shortName", info.get("longName", ticker)),
                asset_type=at,
                exchange=ex,
                sector=info.get("sector"),
                industry=info.get("industry"),
                isin=info.get("isin"),
                currency=info.get("currency", "INR"),
            )
        except Exception as e:
            logger.warning("Yahoo symbol info failed for %s: %s", ticker, e)
            return None

    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]:
        popular = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
            "HINDUNILVR.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "KOTAKBANK.NS",
            "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "MARUTI.NS", "SUNPHARMA.NS",
            "TITAN.NS", "TATAMOTORS.NS", "WIPRO.NS", "HCLTECH.NS", "ADANIENT.NS",
        ]
        results = []
        for ticker in popular:
            sym = await self.get_symbol(ticker)
            if sym:
                if exchange and sym.exchange != exchange:
                    continue
                if asset_type and sym.asset_type != asset_type:
                    continue
                results.append(sym)
        return results

    async def get_sector(self, sector: str) -> Optional[SectorData]:
        try:
            sector_tickers = BSE_SECTOR_MAP.get(sector, [])
            if not sector_tickers:
                return None

            quotes = await self.get_quotes(sector_tickers)
            if not quotes:
                return None

            total_cap = sum(q.market_cap or Decimal("0") for q in quotes)
            avg_change = sum(q.change_pct for q in quotes) / Decimal(str(len(quotes)))

            sorted_q = sorted(quotes, key=lambda q: q.change_pct, reverse=True)
            gainers = [q.symbol for q in sorted_q if q.change_pct > 0][:3]
            losers = [q.symbol for q in sorted_q if q.change_pct < 0][:3]

            return SectorData(
                sector=sector,
                change_pct=avg_change.quantize(Decimal("0.01")),
                market_cap=total_cap,
                top_gainers=gainers,
                top_losers=losers,
            )
        except Exception as e:
            logger.warning("Yahoo sector failed for %s: %s", sector, e)
            return None

    async def list_sectors(self) -> list[SectorData]:
        results = []
        for sector_name in BSE_SECTOR_MAP:
            data = await self.get_sector(sector_name)
            if data:
                results.append(data)
        return results

    async def get_index(self, symbol: str) -> Optional[IndexData]:
        try:
            yf = self._import_yf()
            t = await _run_sync(yf.Ticker, symbol)
            info = await _run_sync(lambda t: t.info, t)

            if not info:
                return None

            price = _to_decimal(info.get("previousClose") or info.get("regularMarketPrice"))
            if price == 0:
                return None

            name = NSE_INDICES.get(symbol, (symbol,))[0] if symbol in NSE_INDICES else info.get("shortName", symbol)

            hist = await _run_sync(lambda t: t.history(period="5d"), t)
            if hist is not None and len(hist) >= 2:
                prev = _to_decimal(hist["Close"].iloc[-2])
                curr = _to_decimal(hist["Close"].iloc[-1])
                change = curr - prev
                change_pct = (change / prev * 100) if prev else Decimal("0")
            else:
                change = Decimal("0")
                change_pct = Decimal("0")

            return IndexData(
                symbol=symbol,
                name=name,
                value=price,
                change=change.quantize(Decimal("0.01")),
                change_pct=change_pct.quantize(Decimal("0.01")),
                components=[],
                timestamp=datetime.now(timezone.utc),
            )
        except Exception as e:
            logger.warning("Yahoo index failed for %s: %s", symbol, e)
            return None

    async def list_indices(self) -> list[IndexData]:
        results = []
        for yahoo_sym, (name, _) in NSE_INDICES.items():
            data = await self.get_index(yahoo_sym)
            if data:
                results.append(data)
        return results

    async def get_corporate_actions(self, symbol: str) -> list[CorporateAction]:
        try:
            yf = self._import_yf()
            t = await _run_sync(yf.Ticker, symbol)
            dividends = await _run_sync(lambda t: t.dividends, t)
            splits = await _run_sync(lambda t: t.splits, t)

            actions = []
            if dividends is not None and not dividends.empty:
                for dt, val in dividends.items():
                    ts = dt.to_pydatetime()
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    actions.append(CorporateAction(
                        symbol=symbol, action_type="dividend",
                        ex_date=ts, value=_to_decimal(val),
                        description=f"Dividend: ₹{val}",
                    ))

            if splits is not None and not splits.empty:
                for dt, val in splits.items():
                    ts = dt.to_pydatetime()
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    actions.append(CorporateAction(
                        symbol=symbol, action_type="split",
                        ex_date=ts, ratio=str(val),
                        description=f"Stock split: {val}",
                    ))

            return actions
        except Exception as e:
            logger.warning("Yahoo corporate actions failed for %s: %s", symbol, e)
            return []
