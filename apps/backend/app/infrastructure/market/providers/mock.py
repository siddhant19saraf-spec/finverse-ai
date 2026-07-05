from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
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


MOCK_SYMBOLS: dict[str, Symbol] = {
    "RELIANCE.NS": Symbol(
        ticker="RELIANCE.NS", name="Reliance Industries Ltd", asset_type=AssetType.EQUITY,
        exchange=Exchange.NSE, sector="Energy", industry="Oil & Gas",
    ),
    "TCS.NS": Symbol(
        ticker="TCS.NS", name="Tata Consultancy Services", asset_type=AssetType.EQUITY,
        exchange=Exchange.NSE, sector="Technology", industry="IT Services",
    ),
    "HDFCBANK.NS": Symbol(
        ticker="HDFCBANK.NS", name="HDFC Bank Ltd", asset_type=AssetType.EQUITY,
        exchange=Exchange.NSE, sector="Financial Services", industry="Banking",
    ),
    "NIFTY50.NS": Symbol(
        ticker="NIFTY50.NS", name="Nifty 50 Index", asset_type=AssetType.INDEX,
        exchange=Exchange.NSE, sector="Index",
    ),
    "NIFTYBEES.NS": Symbol(
        ticker="NIFTYBEES.NS", name="Nippon India ETF Nifty BeES", asset_type=AssetType.ETF,
        exchange=Exchange.NSE, sector="ETF",
    ),
}


class MockMarketDataProvider(MarketDataProvider):
    async def get_quote(self, symbol: str) -> Optional[Quote]:
        if symbol not in MOCK_SYMBOLS:
            return None
        base = Decimal("2500")
        return Quote(
            symbol=symbol, price=base, change=Decimal("25.50"),
            change_pct=Decimal("1.03"), open=base - Decimal("10"),
            high=base + Decimal("30"), low=base - Decimal("15"),
            previous_close=base - Decimal("25.50"), volume=1500000,
            avg_volume=1200000, market_cap=Decimal("1700000000000"),
            pe_ratio=Decimal("28.5"), eps=Decimal("87.72"),
            week_52_high=Decimal("2850"), week_52_low=Decimal("2100"),
            dividend_yield=Decimal("0.35"),
            timestamp=datetime.now(timezone.utc), provider="mock",
        )

    async def get_quotes(self, symbols: list[str]) -> list[Quote]:
        results = []
        for s in symbols:
            q = await self.get_quote(s)
            if q:
                results.append(q)
        return results

    async def get_historical(
        self, symbol: str, interval: Interval, period: str = "1y"
    ) -> HistoricalData:
        now = datetime.now(timezone.utc)
        days = {"1m": 30, "5m": 60, "15m": 90, "30m": 180, "1h": 365, "1d": 365, "1w": 730, "1M": 1825}
        num_days = days.get(period, 365)
        data = []
        price = Decimal("2000")
        for i in range(min(num_days, 365)):
            ts = now - timedelta(days=num_days - i)
            change = Decimal(str(((i * 7 + 13) % 100) - 50)) / Decimal("100")
            price = price + change * Decimal("10")
            if price < Decimal("500"):
                price = Decimal("500")
            data.append(OHLCV(
                timestamp=ts, open=price - Decimal("5"),
                high=price + Decimal("20"), low=price - Decimal("15"),
                close=price, volume=1000000 + (i * 5000),
            ))
        return HistoricalData(symbol=symbol, interval=interval, data=data)

    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]:
        q = query.upper()
        results = []
        for sym in MOCK_SYMBOLS.values():
            if q in sym.ticker.upper() or q in sym.name.upper():
                if asset_type is None or sym.asset_type == asset_type:
                    results.append(SearchResult(
                        ticker=sym.ticker, name=sym.name,
                        asset_type=sym.asset_type, exchange=sym.exchange,
                        sector=sym.sector,
                    ))
        return results

    async def get_symbol(self, ticker: str) -> Optional[Symbol]:
        return MOCK_SYMBOLS.get(ticker)

    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]:
        results = list(MOCK_SYMBOLS.values())
        if exchange:
            results = [s for s in results if s.exchange == exchange]
        if asset_type:
            results = [s for s in results if s.asset_type == asset_type]
        return results

    async def get_sector(self, sector: str) -> Optional[SectorData]:
        symbols = [s for s in MOCK_SYMBOLS.values() if s.sector == sector]
        if not symbols:
            return None
        return SectorData(
            sector=sector, change_pct=Decimal("0.85"),
            market_cap=Decimal("5000000000000"),
            top_gainers=[s.ticker for s in symbols[:2]],
            top_losers=[],
        )

    async def list_sectors(self) -> list[SectorData]:
        sectors = set(s.sector for s in MOCK_SYMBOLS.values() if s.sector)
        return [await self.get_sector(sec) for sec in sectors if await self.get_sector(sec)]

    async def get_index(self, symbol: str) -> Optional[IndexData]:
        sym = MOCK_SYMBOLS.get(symbol)
        if not sym or sym.asset_type != AssetType.INDEX:
            return None
        return IndexData(
            symbol=symbol, name=sym.name, value=Decimal("22500"),
            change=Decimal("150"), change_pct=Decimal("0.67"),
            components=["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"],
            timestamp=datetime.now(timezone.utc),
        )

    async def list_indices(self) -> list[IndexData]:
        indices = [s for s in MOCK_SYMBOLS.values() if s.asset_type == AssetType.INDEX]
        results = []
        for idx in indices:
            data = await self.get_index(idx.ticker)
            if data:
                results.append(data)
        return results

    async def get_corporate_actions(self, symbol: str) -> list[CorporateAction]:
        if symbol not in MOCK_SYMBOLS:
            return []
        return [
            CorporateAction(
                symbol=symbol, action_type="dividend",
                ex_date=datetime(2026, 3, 15, tzinfo=timezone.utc),
                record_date=datetime(2026, 3, 16, tzinfo=timezone.utc),
                value=Decimal("8.00"), description="Final Dividend FY2025",
            ),
            CorporateAction(
                symbol=symbol, action_type="split",
                ex_date=datetime(2025, 12, 1, tzinfo=timezone.utc),
                ratio="1:2", description="Stock Split 2:1",
            ),
        ]
