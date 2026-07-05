from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CopilotMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    timestamp: datetime


class CopilotCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    card_type: str
    title: str
    data: dict
    confidence: Optional[Decimal] = None


class CopilotSource(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    module: str
    endpoint: str
    description: str


class CopilotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    answer: str
    reasoning: str
    sources: list[CopilotSource]
    cards: list[CopilotCard]
    assumptions: list[str]
    limitations: list[str]
    confidence: Decimal
    disclaimer: str
    timestamp: datetime


class CopilotChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    context: dict = Field(default_factory=dict)
    history: list[CopilotMessage] = Field(default_factory=list)


class CopilotChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    response: CopilotResponse
    conversation_id: str
