# 🔍 Empirical Truth Engine

[![Live Application](https://img.shields.io/badge/Demo-Live_on_Vercel-blue?style=for-the-badge&logo=vercel)](https://fact-checker-agent-psi.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render_Live-success?style=for-the-badge&logo=render)](https://fact-checker-api-66ke.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An autonomous, multi-node fact-checking and epistemological auditing agent built with **LangGraph**, **Google Gemini 1.5 Flash**, **Tavily Search**, and **Next.js**.

The engine deconstructs contentious claims into dialectical search trajectories, scrapes primary evidence using `BeautifulSoup`, evaluates domain reliability, audits bias through an adversarial critic node, and compiles structured dossiers backed by verified citations.

---

## 🌐 Live Deployments

- **Web Application**: [https://fact-checker-agent-psi.vercel.app](https://fact-checker-agent-psi.vercel.app)
- **API Backend**: [https://fact-checker-api-66ke.onrender.com](https://fact-checker-api-66ke.onrender.com)
- **GitHub Repository**: [https://github.com/aamani2702/fact-checker-agent](https://github.com/aamani2702/fact-checker-agent)

---

## ⚡ Architecture & Pipeline

- **Multi-Node Agent State Machine (`LangGraph`)**:
  - `Planner`: Breaks down claims into opposing, dialectical search queries.
  - `Searcher + Deep Scraper`: Queries Tavily and dynamically scrapes full paragraphs from authoritative sources when snippets are brief.
  - `Evaluator`: Ranks domain trust (.edu, .gov, peer-reviewed vs. unverified) and conditionally routes for additional data if confidence is low.
  - `Critic Node (Adversarial Auditor)`: Scans extracted evidence for confirmation bias and logical gaps prior to synthesis.
  - `Synthesizer`: Produces consensus briefs, opponent/proponent arguments, and verified numerical source citations.
- **Decomposed Trust Metric**:
  $$\text{Confidence} = 0.40(\text{Domain Authority}) + 0.35(\text{Consensus Alignment}) + 0.25(\text{Evidence Recency})$$
- **Claim Verdict Classification**: Categorizes claims into `Supported`, `Mixed`, `Refuted`, or `Inconclusive`.
- **Interactive Citations**: Clickable `[1]`, `[2]` citation tags scroll directly to corresponding source cards.
- **Real-Time Streaming**: Live execution traces delivered via Server-Sent Events (SSE).
- **Persistent Storage**: Instant report lookups and history storage powered by **Supabase PostgreSQL**.
- **Export Ready**: Built-in Markdown dossier export and print-to-PDF formatting.

---

## 🛠️ Tech Stack

- **Agent Framework**: LangGraph, Python 3.11, Google Gemini 1.5 Flash
- **Search & Retrieval**: Tavily Search API, HTTPX, BeautifulSoup4
- **Backend API**: FastAPI, Uvicorn, SSE-Starlette
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Database**: Supabase PostgreSQL
- **Hosting**: Render (API), Vercel (Frontend)

---

## 🚀 Local Development Setup

### 1. Prerequisites

- Python 3.11+
- Node.js 18+
- API Keys: Google AI Studio (Gemini), Tavily, and Supabase

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
