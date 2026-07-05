from enum import Enum


class AssetType(str, Enum):
    EQUITY = "EQUITY"
    ETF = "ETF"
    INDEX = "INDEX"
    MUTUAL_FUND = "MUTUAL_FUND"
    BOND = "BOND"
    COMMODITY = "COMMODITY"


class Exchange(str, Enum):
    NSE = "NSE"
    BSE = "BSE"
    NYSE = "NYSE"
    NASDAQ = "NASDAQ"
    LSE = "LSE"


class Interval(str, Enum):
    ONE_MIN = "1m"
    FIVE_MIN = "5m"
    FIFTEEN_MIN = "15m"
    THIRTY_MIN = "30m"
    ONE_HOUR = "1h"
    ONE_DAY = "1d"
    ONE_WEEK = "1w"
    ONE_MONTH = "1M"


class DataProvider(str, Enum):
    MOCK = "mock"
    YAHOO = "yahoo"
    ALPHA_VANTAGE = "alpha_vantage"


class MarketStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    PRE_MARKET = "pre_market"
    AFTER_HOURS = "after_hours"


class CorporateActionType(str, Enum):
    DIVIDEND = "dividend"
    SPLIT = "split"
    BONUS = "bonus"
    MERGER = "merger"
    DEMERGER = "demerger"
    RIGHTS = "rights"
