from typing import TypedDict, List, Dict, Any

class SourceItem(TypedDict):
    url: str
    domain: str
    title: str
    snippet: str
    credibility_score: float
    bias_category: str

class AgentState(TypedDict):
    report_id: str
    query: str
    status_message: str
    search_queries: List[str]
    raw_results: List[Dict[str, Any]]
    vetted_sources: List[SourceItem]
    needs_more_data: bool
    iteration: int
    consensus: str
    proponent_argument: str
    opponent_argument: str
    confidence_score: float