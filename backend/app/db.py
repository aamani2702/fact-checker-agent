import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def create_initial_report(query: str) -> str:
    url = f"{SUPABASE_URL}/rest/v1/research_reports"
    payload = {
        "query": query,
        "status": "in_progress"
    }
    with httpx.Client() as client:
        res = client.post(url, headers=HEADERS, json=payload)
        res.raise_for_status()
        data = res.json()
        return data[0]["id"]

def save_completed_report(report_id: str, state: dict):
    update_url = f"{SUPABASE_URL}/rest/v1/research_reports?id=eq.{report_id}"
    update_payload = {
        "status": "completed",
        "consensus": state.get("consensus", ""),
        "proponent_argument": state.get("proponent_argument", ""),
        "opponent_argument": state.get("opponent_argument", ""),
        "overall_confidence_score": float(state.get("confidence_score", 0.8))
    }
    with httpx.Client() as client:
        client.patch(update_url, headers=HEADERS, json=update_payload)

        sources_payload = [
            {
                "report_id": report_id,
                "url": s["url"],
                "domain": s["domain"],
                "title": s["title"],
                "snippet": s["snippet"],
                "credibility_score": float(s["credibility_score"]),
                "bias_category": s["bias_category"]
            }
            for s in state.get("vetted_sources", [])
        ]
        if sources_payload:
            client.post(f"{SUPABASE_URL}/rest/v1/sources", headers=HEADERS, json=sources_payload)