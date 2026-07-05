from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    currency: str = "INR"
    is_default: bool = False


class PortfolioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    currency: str
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class HoldingCreate(BaseModel):
    symbol: str
    asset_type: str = "EQUITY"
    quantity: Decimal
    avg_buy_price: Decimal


class HoldingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    portfolio_id: int
    symbol: str
    asset_type: str
    quantity: Decimal
    avg_buy_price: Decimal
    current_price: Optional[Decimal] = None
    last_updated: Optional[datetime] = None


class TransactionCreate(BaseModel):
    symbol: str
    asset_type: str = "EQUITY"
    side: str = Field(..., pattern="^(BUY|SELL)$")
    quantity: Decimal
    price: Decimal
    fees: Decimal = Decimal("0")
    notes: Optional[str] = None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    portfolio_id: int
    symbol: str
    asset_type: str
    side: str
    quantity: Decimal
    price: Decimal
    fees: Decimal
    total_amount: Decimal
    notes: Optional[str] = None
    executed_at: datetime
    created_at: datetime


class Quote(BaseModel):
    symbol: str
    price: Decimal
    change: Optional[Decimal] = None
    change_pct: Optional[Decimal] = None
    volume: int = 0
    timestamp: Optional[datetime] = None


class WatchlistCreate(BaseModel):
    name: str = "Default"
    symbols: str = ""


class WatchlistRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    symbols: str
    created_at: datetime
