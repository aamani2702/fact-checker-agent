from typing import TypedDict, List

class SourceItem(TypedDict):
    url: str
    domain: str
    title: str
    snippet: str
    credibility_score: float
    bias_category: str

class ConfidenceMetrics(TypedDict):
    domain_authority: float
    consensus_alignment: float
    evidence_recency: float
    final_score: float

class AgentState(TypedDict):
    report_id: str
    query: str
    search_queries: List[str]
    raw_results: List[dict]
    vetted_sources: List[SourceItem]
    needs_more_data: bool
    iteration: int
    critic_notes: str
    consensus: str
    proponent_argument: str
    opponent_argument: str
    metrics: ConfidenceMetrics
    confidence_score: float
    status_message: str