from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class CommodityRate(BaseModel):
    name: str
    price: Decimal
    change: Decimal
    change_pct: Decimal
    unit: str
    timestamp: str


class BankRate(BaseModel):
    bank: str
    savings_rate: Decimal
    fixed_1y: Decimal
    fixed_2y: Decimal
    fixed_5y: Decimal
    home_loan: Decimal
    personal_loan: Decimal


class MarketNews(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    published: str
    sentiment: str
    tags: list[str]


def _commodity_rates() -> list[CommodityRate]:
    now = datetime.now().isoformat()
    return [
        CommodityRate(name="Gold (24K)", price=Decimal("74250"), change=Decimal("350"), change_pct=Decimal("0.47"), unit="₹/10g", timestamp=now),
        CommodityRate(name="Gold (22K)", price=Decimal("68100"), change=Decimal("300"), change_pct=Decimal("0.44"), unit="₹/10g", timestamp=now),
        CommodityRate(name="Silver", price=Decimal("92500"), change=Decimal("-800"), change_pct=Decimal("-0.86"), unit="₹/kg", timestamp=now),
        CommodityRate(name="Platinum", price=Decimal("32800"), change=Decimal("150"), change_pct=Decimal("0.46"), unit="₹/10g", timestamp=now),
    ]


def _bank_rates() -> list[BankRate]:
    return [
        BankRate(bank="SBI", savings_rate=Decimal("2.70"), fixed_1y=Decimal("6.80"), fixed_2y=Decimal("6.90"), fixed_5y=Decimal("6.50"), home_loan=Decimal("8.50"), personal_loan=Decimal("11.15")),
        BankRate(bank="HDFC Bank", savings_rate=Decimal("3.00"), fixed_1y=Decimal("6.60"), fixed_2y=Decimal("6.70"), fixed_5y=Decimal("6.50"), home_loan=Decimal("8.75"), personal_loan=Decimal("10.50")),
        BankRate(bank="ICICI Bank", savings_rate=Decimal("3.00"), fixed_1y=Decimal("6.70"), fixed_2y=Decimal("6.80"), fixed_5y=Decimal("6.60"), home_loan=Decimal("8.75"), personal_loan=Decimal("10.75")),
        BankRate(bank="Axis Bank", savings_rate=Decimal("3.00"), fixed_1y=Decimal("6.70"), fixed_2y=Decimal("6.75"), fixed_5y=Decimal("6.50"), home_loan=Decimal("8.75"), personal_loan=Decimal("10.50")),
        BankRate(bank="Punjab National Bank", savings_rate=Decimal("2.70"), fixed_1y=Decimal("6.60"), fixed_2y=Decimal("6.70"), fixed_5y=Decimal("6.40"), home_loan=Decimal("8.45"), personal_loan=Decimal("10.90")),
        BankRate(bank="Bank of Baroda", savings_rate=Decimal("2.75"), fixed_1y=Decimal("6.60"), fixed_2y=Decimal("6.70"), fixed_5y=Decimal("6.40"), home_loan=Decimal("8.50"), personal_loan=Decimal("10.60")),
        BankRate(bank="Kotak Mahindra", savings_rate=Decimal("3.00"), fixed_1y=Decimal("6.70"), fixed_2y=Decimal("6.80"), fixed_5y=Decimal("6.50"), home_loan=Decimal("8.75"), personal_loan=Decimal("10.50")),
        BankRate(bank="IDBI Bank", savings_rate=Decimal("2.70"), fixed_1y=Decimal("6.60"), fixed_2y=Decimal("6.70"), fixed_5y=Decimal("6.40"), home_loan=Decimal("8.55"), personal_loan=Decimal("10.80")),
        BankRate(bank="Canara Bank", savings_rate=Decimal("2.75"), fixed_1y=Decimal("6.65"), fixed_2y=Decimal("6.75"), fixed_5y=Decimal("6.45"), home_loan=Decimal("8.50"), personal_loan=Decimal("10.75")),
        BankRate(bank="Union Bank", savings_rate=Decimal("2.75"), fixed_1y=Decimal("6.60"), fixed_2y=Decimal("6.70"), fixed_5y=Decimal("6.40"), home_loan=Decimal("8.50"), personal_loan=Decimal("10.80")),
    ]


def _market_news() -> list[MarketNews]:
    return [
        MarketNews(id="n1", title="NIFTY 50 Crosses 24,500 Amid Strong FII Buying", summary="Foreign institutional investors pumped ₹3,200 crore into Indian equities today, pushing major indices to new highs.", source="Economic Times", url="#", published="2h ago", sentiment="positive", tags=["NIFTY", "FII", "Bullish"]),
        MarketNews(id="n2", title="RBI Holds Repo Rate Steady at 6.5%", summary="Reserve Bank of India maintains status quo on rates for the eighth consecutive meeting, citing inflation concerns.", source="Moneycontrol", url="#", published="4h ago", sentiment="neutral", tags=["RBI", "Rates", "Inflation"]),
        MarketNews(id="n3", title="Reliance Industries Q1 Profit Surges 12%", summary="Reliance reported consolidated net profit of ₹15,138 crore, beating street estimates on strong O2C and digital business.", source="LiveMint", url="#", published="5h ago", sentiment="positive", tags=["Reliance", "Results", "Earnings"]),
        MarketNews(id="n4", title="IT Sector Faces Headwinds as US Demand Weakens", summary="TCS, Infosys, and Wipro see deal pipeline slowdown as US clients postpone tech spending amid recession fears.", source="Business Standard", url="#", published="6h ago", sentiment="negative", tags=["IT", "TCS", "Infosys"]),
        MarketNews(id="n5", title="Gold Prices Hit Record ₹74,250/10g", summary="Gold prices surge to all-time highs globally as geopolitical tensions and rate cut expectations drive safe-haven demand.", source="Reuters", url="#", published="1h ago", sentiment="positive", tags=["Gold", "Commodities"]),
        MarketNews(id="n6", title="SEBI Tightens F&O Rules to Curb Speculation", summary="New margin requirements and position limits aim to reduce excessive retail speculation in derivatives market.", source="CNBC TV18", url="#", published="3h ago", sentiment="neutral", tags=["SEBI", "F&O", "Regulation"]),
        MarketNews(id="n7", title="Tata Motors Launches New EV SUV at ₹12 Lakh", summary="Affordable electric vehicle aims to capture mass market segment, boosting EV adoption in India.", source="NDTV Profit", url="#", published="7h ago", sentiment="positive", tags=["Tata", "EV", "Auto"]),
        MarketNews(id="n8", title="Rupee Falls 15 Paise to 83.45 Against Dollar", summary="Indian rupee weakens on strong US dollar and rising crude oil prices, putting pressure on import-dependent sectors.", source="ForexLive", url="#", published="30m ago", sentiment="negative", tags=["Rupee", "USD", "Forex"]),
    ]
