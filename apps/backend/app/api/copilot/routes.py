from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter

from app.api.copilot.engine import CopilotEngine
from app.api.copilot.schemas import CopilotChatRequest, CopilotChatResponse, CopilotResponse

router = APIRouter(prefix="/v1/copilot", tags=["copilot"])

_engine = CopilotEngine()


@router.post("/chat/{user_id}", response_model=CopilotChatResponse)
async def copilot_chat(user_id: int, payload: CopilotChatRequest):
    context = payload.context
    context.setdefault("user_id", user_id)

    response = await _engine.process(payload.message, context)

    return CopilotChatResponse(
        response=response,
        conversation_id=str(uuid4()),
    )


@router.post("/query", response_model=CopilotResponse)
async def copilot_query(payload: CopilotChatRequest):
    return await _engine.process(payload.message, payload.context)


@router.get("/capabilities")
async def copilot_capabilities():
    return {
        "capabilities": [
            {
                "category": "Portfolio Intelligence",
                "description": "Analyze portfolio risk, returns, and allocation",
                "example_queries": ["Analyze my portfolio", "What's my risk level?"],
            },
            {
                "category": "Scenario Simulation",
                "description": "Run what-if scenarios with Monte Carlo simulation",
                "example_queries": ["What if inflation rises to 8%?", "Simulate market crash"],
            },
            {
                "category": "Goal Planning",
                "description": "Track and project goal achievement",
                "example_queries": ["Am I on track for retirement?", "Goal progress"],
            },
            {
                "category": "Risk Assessment",
                "description": "Comprehensive risk metrics and analysis",
                "example_queries": ["What's my VaR?", "How volatile is my portfolio?"],
            },
            {
                "category": "Compliance Check",
                "description": "SEBI, RBI, and DPDP compliance verification",
                "example_queries": ["Check my compliance status", "SEBI violations?"],
            },
            {
                "category": "Market Intelligence",
                "description": "Live market data and analysis",
                "example_queries": ["How is NIFTY today?", "Market overview"],
            },
        ],
        "modules_connected": [
            "Portfolio Engine",
            "Financial Digital Twin",
            "Risk Engine",
            "Market Intelligence",
            "Compliance Layer",
            "Explainable AI",
        ],
        "disclaimer": "All responses are educational decision support. Not financial advice.",
    }
