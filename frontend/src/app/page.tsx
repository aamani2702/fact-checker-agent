"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  History,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Printer,
} from "lucide-react";

interface SourceItem {
  url: string;
  domain: string;
  title: string;
  snippet: string;
  credibility_score: number;
  bias_category: string;
}

interface Metrics {
  domain_authority: number;
  consensus_alignment: number;
  evidence_recency: number;
  final_score: number;
}

interface ReportData {
  consensus: string;
  proponent_argument: string;
  opponent_argument: string;
  confidence_score: number;
  metrics: Metrics;
  critic_notes: string;
  sources: SourceItem[];
}

interface HistoryItem {
  id: string;
  query: string;
  status: string;
  overall_confidence_score: number;
  created_at: string;
}

const PRESET_TOPICS = [
  "Is nuclear energy safer than solar and wind?",
  "Does intermittent fasting extend human lifespan?",
  "Are electric vehicles cleaner than hybrid cars over lifecycle?",
  "Does coffee consumption lower all-cause mortality?",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const loadHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const targetQuery = directQuery || query;
    if (!targetQuery.trim() || loading) return;

    if (directQuery) setQuery(directQuery);
    setLoading(true);
    setSteps([]);
    setReport(null);
    setActiveCitation(null);

    try {
      const res = await fetch(`${backendUrl}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery }),
      });

      if (!res.ok) throw new Error("Research launch failed");
      const { report_id } = await res.json();

      const eventSource = new EventSource(
        `${backendUrl}/api/research/${report_id}/stream?query=${encodeURIComponent(targetQuery)}`,
      );

      eventSource.addEventListener("step", (event) => {
        const payload = JSON.parse(event.data);
        setSteps((prev) => [...prev, payload.status]);
      });

      eventSource.addEventListener("complete", (event) => {
        const payload: ReportData = JSON.parse(event.data);
        setReport(payload);
        setLoading(false);
        eventSource.close();
        loadHistory();
      });

      eventSource.onerror = () => {
        setLoading(false);
        eventSource.close();
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const copyDossier = () => {
    if (!report) return;
    const markdown = `# Empirical Fact-Check: ${query}
Composite Trust Score: ${Math.round((report.confidence_score || 0.85) * 100)}%

### Dialectical Auditor Critique
${report.critic_notes}

### Empirical Consensus
${report.consensus}

### Proponent Arguments & Data
${report.proponent_argument}

### Counterarguments & Constraints
${report.opponent_argument}

### Sources
${report.sources.map((s, i) => `[${i + 1}] ${s.title} (${s.url})`).join("\n")}`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderInteractiveText = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        return (
          <button
            key={idx}
            onClick={() => {
              setActiveCitation(citationNum);
              document
                .getElementById(`source-${citationNum}`)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-xs font-mono font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer border border-blue-500/30"
          >
            {part}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-transparent blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto py-14 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LangGraph + Critic Auditor + Gemini
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Empirical Truth Engine
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
            Multi-node autonomous verification agent assessing bias, dialectical
            nuances, and verified web citations.
          </p>
        </div>

        {/* Search */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-500 absolute left-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Submit any claim or scientific debate..."
                className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Investigating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  Verify Claim
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Try asking:</span>
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(undefined, preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Live Execution Trace */}
        {steps.length > 0 && (
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-800/60 pb-3">
              <span>Agent Execution Graph Trace</span>
              <span className="text-blue-400 font-mono">Running live</span>
            </div>
            <div className="space-y-2.5 pt-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-blue-400 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>
                    Critic auditing bias vectors & computing composite
                    confidence matrix...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Output */}
        {report && (
          <div className="space-y-6 pt-4 animate-in fade-in-50 duration-500">
            {/* Header & Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Investigation Dossier
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button
                  onClick={copyDossier}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy Dossier"}
                </button>
              </div>
            </div>

            {/* Dialectical Critic Review Banner */}
            {report.critic_notes && (
              <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-4 flex items-start gap-3 text-amber-200/90 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                    Dialectical Critic Audit
                  </div>
                  <p className="leading-relaxed text-amber-300/80">
                    {report.critic_notes}
                  </p>
                </div>
              </div>
            )}

            {/* Primary Finding & Composite Metrics */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
                    Primary Finding
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    Empirical Consensus
                  </h3>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 w-fit">
                  <div className="text-right">
                    <div className="text-[10px] tracking-wider uppercase text-emerald-400/80 font-bold">
                      Composite Trust
                    </div>
                    <div className="text-lg font-black font-mono leading-none">
                      {Math.round(report.confidence_score * 100)}%
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {renderInteractiveText(report.consensus)}
              </p>

              {/* Decomposed Metrics Grid */}
              {report.metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/60">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Domain Authority (40%)</span>
                      <span className="font-mono text-blue-400">
                        {Math.round(
                          (report.metrics.domain_authority || 0.85) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(report.metrics.domain_authority || 0.85) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Consensus Alignment (35%)</span>
                      <span className="font-mono text-emerald-400">
                        {Math.round(
                          (report.metrics.consensus_alignment || 0.8) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(report.metrics.consensus_alignment || 0.8) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Evidence Recency (25%)</span>
                      <span className="font-mono text-indigo-400">
                        {Math.round(
                          (report.metrics.evidence_recency || 0.85) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${(report.metrics.evidence_recency || 0.85) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Supporting vs Counterevidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-slate-900/60 border border-emerald-900/30 p-6 space-y-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">
                    Supporting Evidence
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {renderInteractiveText(report.proponent_argument)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-rose-900/30 p-6 space-y-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <h4 className="font-bold text-rose-400 text-sm uppercase tracking-wider">
                    Counter-Arguments & Limits
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {renderInteractiveText(report.opponent_argument)}
                </p>
              </div>
            </div>

            {/* Vetted Cited Sources */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">
                  Verified Citations & Domain Trust
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {report.sources.length} sources vetted
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {report.sources.map((s, idx) => {
                  const citationIndex = idx + 1;
                  const isHighlighted = activeCitation === citationIndex;
                  return (
                    <a
                      id={`source-${citationIndex}`}
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-4 rounded-xl border transition-all duration-300 flex items-start justify-between gap-4 group ${
                        isHighlighted
                          ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950"
                          : "bg-slate-950/40 border-slate-800/70 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            [{citationIndex}]
                          </span>
                          <span className="font-semibold text-blue-400 group-hover:underline text-sm flex items-center gap-1">
                            {s.title || s.domain}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                            {s.bias_category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            Trust: {Math.round(s.credibility_score * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {s.snippet}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0 mt-1" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && !report && !loading && (
          <div className="max-w-3xl mx-auto pt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
              <History className="w-4 h-4 text-slate-500" />
              <span>Recent Public Fact-Checks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearch(undefined, item.query)}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 text-left transition-colors flex items-center justify-between gap-3 group"
                >
                  <span className="text-xs text-slate-300 group-hover:text-white line-clamp-1">
                    {item.query}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-bold">
                    {Math.round((item.overall_confidence_score || 0.8) * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
