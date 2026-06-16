"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/api/axios";
import {
  Database, Cloud, Mail, Shield, CreditCard, FileText, Globe,
  Timer, Bot, Activity, AlertCircle, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Layers, Clock, Cpu, HardDrive, Server, LayoutGrid, List,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntegrationEntry {
  id?: string;
  name: string;
  type?: string;
  status: string;
  // flat connection fields (new API shape)
  host?: string;
  port?: string | number;
  database?: string;
  from?: string;
  url?: string;
  endpoint?: string;
  platform?: string;
  hostname?: string;
  usedStorage?: string;
  storageUsed?: string;
  disk?: { total?: string; used?: string; available?: string; usedPercent?: string };
  links?: Record<string, unknown>;
  // legacy nested (kept for backwards compat)
  config?: Record<string, unknown>;
  liveCheck?: Record<string, unknown>;
  stats?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ApiSummary {
  total?: number;
  connected?: number;
  disconnected?: number;
  inactive?: number;
  [key: string]: unknown;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  mongodb:    Database,
  redis:      Layers,
  bullmq:     Layers,
  cloudflare: Cloud,
  r2:         Cloud,
  brevo:      Mail,
  jwt:        Shield,
  puppeteer:  Bot,
  razorpay:   CreditCard,
  swagger:    FileText,
  cors:       Globe,
  ratelimiter:Timer,
  server:     Cpu,
  vps:        Cpu,
};

const TYPE_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  database: Database,
  cache:    Layers,
  storage:  HardDrive,
  email:    Mail,
  payment:  CreditCard,
  server:   Cpu,
  docs:     FileText,
};

function ServiceIcon({ name, type, size, className }: { name: string; type?: string; size?: number; className?: string }) {
  const key = (name ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return <Icon size={size} className={className} />;
  }
  if (type && TYPE_ICON_MAP[type.toLowerCase()]) {
    const Icon = TYPE_ICON_MAP[type.toLowerCase()];
    return <Icon size={size} className={className} />;
  }
  return <Activity size={size} className={className} />;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const HEALTHY = ["connected", "active", "ok", "healthy", "running", "enabled", "up", "true", "online"];
const WARN    = ["degraded", "warning", "slow", "partial", "limited"];
const DOWN    = ["disconnected", "error", "down", "failed", "offline", "disabled", "false", "inactive"];

function getStatusStyle(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "inactive" || s.startsWith("inactive"))
    return { color: "text-red-600",    bg: "bg-red-50 border-red-200",       dot: "bg-red-500",    pulse: false };
  if (HEALTHY.some((v) => s === v || s.startsWith(v)))
    return { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", pulse: true };
  if (WARN.some((v) => s.includes(v)))
    return { color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-500",  pulse: false };
  if (DOWN.some((v) => s.includes(v)))
    return { color: "text-red-600",    bg: "bg-red-50 border-red-200",       dot: "bg-red-500",    pulse: false };
  return   { color: "text-slate-500",  bg: "bg-slate-100 border-slate-200",  dot: "bg-slate-400",  pulse: false };
}

function StatusIndicatorIcon({ status, size }: { status: string; size?: number }) {
  const s = (status ?? "").toLowerCase();
  if (s === "inactive" || s.startsWith("inactive")) return <AlertTriangle size={size} />;
  if (HEALTHY.some((v) => s === v || s.startsWith(v))) return <CheckCircle2 size={size} />;
  if (WARN.some((v) => s.includes(v)))                 return <AlertCircle  size={size} />;
  if (DOWN.some((v) => s.includes(v)))                 return <XCircle      size={size} />;
  return <Activity size={size} />;
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, string> = {
  database: "bg-blue-50 text-blue-700 border-blue-200",
  cache:    "bg-purple-50 text-purple-700 border-purple-200",
  queue:    "bg-orange-50 text-orange-700 border-orange-200",
  storage:  "bg-teal-50 text-teal-700 border-teal-200",
  email:    "bg-pink-50 text-pink-700 border-pink-200",
  payment:  "bg-green-50 text-green-700 border-green-200",
  security: "bg-red-50 text-red-700 border-red-200",
};

function getTypeStyle(type?: string) {
  if (!type) return "bg-slate-50 text-slate-600 border-slate-200";
  return TYPE_STYLE[type.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200";
}

// ─── Value formatting ─────────────────────────────────────────────────────────

function formatValue(value: unknown): { text: string; isTrue?: boolean; isFalse?: boolean; isUrl?: boolean } {
  if (value === null || value === undefined) return { text: "—" };
  if (typeof value === "boolean")
    return value ? { text: "Yes", isTrue: true } : { text: "No", isFalse: true };
  if (typeof value === "number") return { text: value.toLocaleString() };
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime()))
        return { text: d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) };
    }
    if (/^https?:\/\//.test(value)) return { text: value, isUrl: true };
    if (value === "true")  return { text: "Yes", isTrue: true };
    if (value === "false") return { text: "No",  isFalse: true };
    return { text: value };
  }
  if (Array.isArray(value)) return { text: `${value.length} items` };
  return { text: String(value) };
}

function formatCheckedAt(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ─── Parse API response ───────────────────────────────────────────────────────

function parseApiResponse(raw: unknown): {
  integrations: IntegrationEntry[];
  summary: ApiSummary | null;
  checkedAt: string | null;
} {
  if (!raw) return { integrations: [], summary: null, checkedAt: null };

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.integrations)) {
      return {
        integrations: obj.integrations as IntegrationEntry[],
        summary: (obj.summary as ApiSummary) ?? null,
        checkedAt: (obj.checkedAt as string) ?? null,
      };
    }
    // Fallback: each key is an integration
    return {
      integrations: Object.entries(obj).map(([key, value]) => {
        const val = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : { value };
        return { name: key, status: (val.status as string) ?? "unknown", ...val } as IntegrationEntry;
      }),
      summary: null,
      checkedAt: null,
    };
  }

  if (Array.isArray(raw)) {
    return {
      integrations: (raw as IntegrationEntry[]).map((item) => ({
        ...item,
        name:   item.name   ?? (item as Record<string,unknown>).service ?? "Unknown",
        status: item.status ?? "unknown",
      })),
      summary: null,
      checkedAt: null,
    };
  }

  return { integrations: [], summary: null, checkedAt: null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return u.hostname + (path ? path : "");
  } catch {
    return url;
  }
}

function splitLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

// ─── MetricCell ───────────────────────────────────────────────────────────────

function MetricCell({ label, val }: { label: string; val: unknown }) {
  const { text, isTrue, isFalse, isUrl } = formatValue(val);

  const valueEl = isUrl ? (
    <a
      href={text}
      target="_blank"
      rel="noreferrer"
      className="text-[13px] font-semibold text-blue-600 underline underline-offset-2 truncate block"
    >
      {displayUrl(text)}
    </a>
  ) : (
    <span
      className={`text-[13px] font-bold truncate block ${
        isTrue  ? "text-emerald-600" :
        isFalse ? "text-red-500"     :
                  "text-slate-800"
      }`}
    >
      {text}
    </span>
  );

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
        {splitLabel(label)}
      </span>
      {valueEl}
    </div>
  );
}


// ─── Status category ─────────────────────────────────────────────────────────

type StatusCategory = "active" | "inactive" | "issue";

function getStatusCategory(status: string): StatusCategory {
  const s = (status ?? "").toLowerCase();
  if (s.includes("inactive")) return "inactive";
  if (HEALTHY.some((v) => s.includes(v))) return "active";
  if (WARN.some((v) => s.includes(v)) || DOWN.some((v) => s.includes(v))) return "issue";
  return "inactive";
}

const CARD_THEME: Record<StatusCategory, { card: string; iconBg: string; iconColor: string; divider: string }> = {
  active:   { card: "bg-white border-slate-200",   iconBg: "bg-amber-50 border-amber-100", iconColor: "text-[#f5c448]", divider: "border-slate-100" },
  inactive: { card: "bg-red-50/30 border-red-200", iconBg: "bg-red-50 border-red-100",     iconColor: "text-red-400",   divider: "border-red-100"   },
  issue:    { card: "bg-red-50/50 border-red-300", iconBg: "bg-red-100 border-red-200",    iconColor: "text-red-500",   divider: "border-red-200"   },
};

// ─── Highlight extractor ──────────────────────────────────────────────────────

interface Highlight { label: string; val: unknown }

function getHighlights(entry: IntegrationEntry): Highlight[] {
  const out: Array<Highlight & { pri: number }> = [];
  const push = (label: string, val: unknown, pri: number) => {
    if (val !== undefined && val !== null && val !== "") out.push({ label, val, pri });
  };

  // ── Flat fields (new API shape) ──────────────────────────────────────────
  const hostVal = entry.host
    ? (entry.port ? `${entry.host}:${entry.port}` : String(entry.host))
    : undefined;
  push("Host",     hostVal,              1);
  push("Database", entry.database,       2);
  push("From",     entry.from,           2);
  push("Platform", entry.platform,       2);
  push("Hostname", entry.hostname,       3);
  push("Storage",  entry.usedStorage ?? entry.storageUsed, 3);

  if (entry.disk) {
    const d = entry.disk;
    push("Disk",      d.used && d.total ? `${d.used} / ${d.total}` : d.used, 3);
    push("Disk Used", d.usedPercent,  4);
    push("Available", d.available,    5);
  }

  push("URL", entry.url, 4);

  // ── Legacy nested fields (backwards compat) ──────────────────────────────
  const lc    = entry.liveCheck;
  const stats = entry.stats;
  const meta  = entry.meta;
  if (lc) {
    push("Latency",  lc.latencyMs !== undefined ? `${lc.latencyMs}ms` : undefined, 1);
    push("Response", lc.response, 2);
  }
  if (stats) {
    push("Documents",   stats.totalDocuments, 5);
    push("Collections", stats.collections,    6);
    push("Keys",        stats.totalKeys,      5);
    push("Memory",      stats.usedMemory,     6);
  }
  if (meta?.version) {
    push("Version", meta.library ? `${meta.library} ${meta.version}` : meta.version, 7);
  }

  push("Docs", entry.links?.docs, 8);

  return out
    .sort((a, b) => a.pri - b.pri)
    .slice(0, 6)
    .map(({ label, val }) => ({ label, val }));
}

// ─── IntegrationCard ──────────────────────────────────────────────────────────

function IntegrationCard({ entry, index }: { entry: IntegrationEntry; index: number }) {
  const statusStyle = getStatusStyle(entry.status);
  const category    = getStatusCategory(entry.status);
  const theme       = CARD_THEME[category];
  const highlights  = getHighlights(entry);

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden
                  hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300
                  opacity-0 animate-[fadeSlideIn_0.4s_ease_forwards] ${theme.card}`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.iconBg}`}>
            <ServiceIcon name={entry.name} type={entry.type} size={19} className={theme.iconColor} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{entry.name}</h3>
            {entry.type && (
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getTypeStyle(entry.type)}`}>
                {entry.type}
              </span>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
          <span className={`w-2 h-2 rounded-full ${statusStyle.dot} ${category === "active" ? "animate-pulse" : ""}`} />
          <StatusIndicatorIcon status={entry.status} size={12} />
          <span className="capitalize">{entry.status ?? "unknown"}</span>
        </span>
      </div>

      {/* Key metrics — flat 3-col grid */}
      {highlights.length > 0 && (
        <div className={`px-4 pb-4 pt-3 border-t ${theme.divider} grid grid-cols-3 gap-x-3 gap-y-3`}>
          {highlights.map((h) => <MetricCell key={h.label} label={h.label} val={h.val} />)}
        </div>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, color, accent, index,
}: {
  label: string; value: number; color: string; accent?: string; index: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:shadow-md transition-all duration-200
                 opacity-0 animate-[fadeSlideIn_0.4s_ease_forwards] relative overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {accent && <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />}
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1.5 ${color}`}>{value}</p>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabKey = "all" | "active" | "inactive" | "issue";

interface Tab { key: TabKey; label: string; dot?: string }

const TABS: Tab[] = [
  { key: "all",      label: "All" },
  { key: "active",   label: "Active",   dot: "bg-emerald-500" },
  { key: "inactive", label: "Inactive", dot: "bg-red-400" },
  { key: "issue",    label: "Issues",   dot: "bg-red-600" },
];

// ─── List row (compact horizontal layout) ────────────────────────────────────

function IntegrationRow({ entry, index }: { entry: IntegrationEntry; index: number }) {
  const statusStyle = getStatusStyle(entry.status);
  const category    = getStatusCategory(entry.status);
  const theme       = CARD_THEME[category];
  const highlights  = getHighlights(entry);

  return (
    <div
      className={`rounded-xl border shadow-sm flex items-center gap-4 px-4 py-3
                  hover:shadow-md transition-all duration-200
                  opacity-0 animate-[fadeSlideIn_0.35s_ease_forwards] ${theme.card}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${theme.iconBg}`}>
        <ServiceIcon name={entry.name} type={entry.type} size={17} className={theme.iconColor} />
      </div>

      {/* Name + type */}
      <div className="w-36 shrink-0 min-w-0">
        <p className="font-bold text-slate-900 text-sm truncate">{entry.name}</p>
        {entry.type && (
          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${getTypeStyle(entry.type)}`}>
            {entry.type}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-1 min-w-0">
        {highlights.map((h) => {
          const { text, isTrue, isFalse, isUrl } = formatValue(h.val);
          return (
            <div key={h.label} className="flex flex-col gap-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{h.label}</span>
              {isUrl ? (
                <a href={text} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 underline underline-offset-1 truncate">{displayUrl(text)}</a>
              ) : (
                <span className={`text-xs font-bold ${isTrue ? "text-emerald-600" : isFalse ? "text-red-500" : "text-slate-800"}`}>{text}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status badge */}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${category === "active" ? "animate-pulse" : ""}`} />
        <StatusIndicatorIcon status={entry.status} size={11} />
        <span className="capitalize">{entry.status ?? "unknown"}</span>
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationEntry[]>([]);
  const [summary, setSummary]           = useState<ApiSummary | null>(null);
  const [checkedAt, setCheckedAt]       = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [lastFetched, setLastFetched]   = useState<Date | null>(null);
  const [activeTab, setActiveTab]       = useState<TabKey>("all");
  const [viewMode, setViewMode]         = useState<"grid" | "list">("list");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/v1/admin/integrations/");
      const raw = res.data?.data ?? res.data;
      const parsed = parseApiResponse(raw);
      setIntegrations(parsed.integrations);
      setSummary(parsed.summary);
      setCheckedAt(parsed.checkedAt);
      setLastFetched(new Date());
    } catch (err: unknown) {
      const e = err as { response?: { status: number; data?: { message?: string } }; message?: string };
      if (e.response?.status === 401)      setError("Unauthorized — admin access required.");
      else if (e.response?.status === 403) setError("Forbidden — insufficient permissions.");
      else setError(e.response?.data?.message ?? e.message ?? "Failed to load integrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Counts
  const activeCount   = integrations.filter((d) => getStatusCategory(d.status) === "active").length;
  const inactiveCount = integrations.filter((d) => getStatusCategory(d.status) === "inactive").length;
  const issueCount    = integrations.filter((d) => getStatusCategory(d.status) === "issue").length;
  const total         = Number(summary?.total ?? integrations.length);
  const connected     = Number(summary?.connected ?? activeCount);
  const disconnected  = Number(summary?.disconnected ?? issueCount);
  const inactive      = Number(summary?.inactive ?? inactiveCount);

  // Tab counts
  const tabCounts: Record<TabKey, number> = {
    all:      integrations.length,
    active:   activeCount,
    inactive: inactiveCount,
    issue:    issueCount,
  };

  // Filtered list
  const filtered = activeTab === "all"
    ? integrations
    : integrations.filter((d) => getStatusCategory(d.status) === activeTab);

  const statCards = [
    { label: "Total",        value: total,       color: "text-slate-800",   accent: "bg-slate-300" },
    { label: "Connected",    value: connected,   color: "text-emerald-600", accent: "bg-emerald-400" },
    { label: "Disconnected", value: disconnected,color: disconnected > 0 ? "text-red-500" : "text-slate-400", accent: disconnected > 0 ? "bg-red-400" : "bg-slate-200" },
    { label: "Inactive",     value: inactive,    color: inactive > 0 ? "text-amber-500" : "text-slate-400",   accent: inactive > 0 ? "bg-amber-400" : "bg-slate-200" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f8f7f6]">
        {/* Page header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#f5c448] inline-block animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Live status, config &amp; metrics for all connected services
              </p>
            </div>

            <div className="flex items-center gap-3">
              {checkedAt ? (
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-xs text-slate-600 font-semibold">
                    {formatCheckedAt(checkedAt)}
                  </span>
                </div>
              ) : lastFetched ? (
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Fetched {lastFetched.toLocaleTimeString()}
                </span>
              ) : null}

              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5c448] text-[#171612] text-sm font-bold
                           hover:bg-[#e5b538] active:scale-95 transition-all shadow-sm
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

          {/* Summary stat cards */}
          {!loading && !error && integrations.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((s, i) => (
                <StatCard key={s.label} label={s.label} value={s.value} color={s.color} accent={s.accent} index={i} />
              ))}
            </div>
          )}

          {/* Tabs + view toggle */}
          {!loading && !error && integrations.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Tab bar */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-[#f5c448] text-[#171612] shadow-sm"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tab.dot && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#171612]/40" : tab.dot}`} />
                      )}
                      {tab.label}
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? "bg-[#171612]/10 text-[#171612]" : "bg-slate-100 text-slate-500"
                      }`}>
                        {tabCounts[tab.key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-[#f5c448] text-[#171612] shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List view"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-[#f5c448] text-[#171612] shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#f5c448]/30 border-t-[#f5c448] animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Fetching integration status…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-12 text-center max-w-md mx-auto">
              <XCircle size={36} className="text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-red-700 mb-5">{error}</p>
              <button
                onClick={fetchData}
                className="px-5 py-2.5 rounded-xl bg-[#f5c448] text-[#171612] text-sm font-bold hover:bg-[#e5b538] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && integrations.length === 0 && (
            <div className="text-center py-32 text-slate-400 text-sm">
              No integration data returned from the API.
            </div>
          )}

          {/* Empty tab */}
          {!loading && !error && integrations.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-sm">
              No services in this category.
            </div>
          )}

          {/* Grid view */}
          {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((entry, i) => (
                <IntegrationCard key={entry.id ?? entry.name ?? i} entry={entry} index={i} />
              ))}
            </div>
          )}

          {/* List view */}
          {!loading && !error && filtered.length > 0 && viewMode === "list" && (
            <div className="flex flex-col gap-2">
              {filtered.map((entry, i) => (
                <IntegrationRow key={entry.id ?? entry.name ?? i} entry={entry} index={i} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
