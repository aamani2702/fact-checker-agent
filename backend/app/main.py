import os
import json
import asyncio
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

load_dotenv()

from app.graph import research_graph
from app.db import create_initial_report, save_completed_report

app = FastAPI(title="Fact-Checking Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    query: str

@app.get("/api/reports")
def get_recent_reports():
    """Fetch the latest 8 completed reports for the history drawer."""
    try:
        url = f"{os.getenv('SUPABASE_URL', '').rstrip('/')}/rest/v1/research_reports?select=*&status=eq.completed&order=created_at.desc&limit=8"
        headers = {
            "apikey": os.getenv("SUPABASE_KEY", ""),
            "Authorization": f"Bearer {os.getenv('SUPABASE_KEY', '')}",
        }
        with httpx.Client() as client:
            res = client.get(url, headers=headers)
            if res.is_success:
                return res.json()
    except Exception as e:
        print(f"Error fetching history: {e}")
    return []

@app.post("/api/research")
async def start_research(payload: ResearchRequest):
    report_id = create_initial_report(payload.query)
    return {"report_id": report_id}

@app.get("/api/research/{report_id}/stream")
async def stream_research(report_id: str, query: str):
    async def event_generator():
        initial_state = {
            "report_id": report_id,
            "query": query,
            "search_queries": [],
            "raw_results": [],
            "vetted_sources": [],
            "needs_more_data": False,
            "iteration": 0,
            "critic_notes": "",
            "consensus": "",
            "proponent_argument": "",
            "opponent_argument": "",
            "confidence_score": 0.0,
            "metrics": {
                "domain_authority": 0.85,
                "consensus_alignment": 0.80,
                "evidence_recency": 0.85,
                "final_score": 0.84
            },
            "status_message": "Initializing LangGraph workflow..."
        }

        current_state = dict(initial_state)

        for event in research_graph.stream(initial_state):
            for node_name, node_update in event.items():
                current_state.update(node_update)
                yield {
                    "event": "step",
                    "data": json.dumps({
                        "node": node_name,
                        "status": current_state.get("status_message", f"Step: {node_name}"),
                    })
                }
                await asyncio.sleep(0.2)

        save_completed_report(report_id, current_state)

        yield {
            "event": "complete",
            "data": json.dumps({
                "consensus": current_state.get("consensus", ""),
                "proponent_argument": current_state.get("proponent_argument", ""),
                "opponent_argument": current_state.get("opponent_argument", ""),
                "confidence_score": current_state.get("confidence_score", 0.84),
                "metrics": current_state.get("metrics", {
                    "domain_authority": 0.85,
                    "consensus_alignment": 0.80,
                    "evidence_recency": 0.85,
                    "final_score": 0.84
                }),
                "critic_notes": current_state.get("critic_notes", ""),
                "sources": current_state.get("vetted_sources", [])
            })
        }

    return EventSourceResponse(event_generator())