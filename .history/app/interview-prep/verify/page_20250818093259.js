"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import blockchainService from "@/lib/blockchainService";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Line,
  LabelList,
} from "recharts";

export default function VerifyManifestPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [manifest, setManifest] = useState(null);
  const [manifestHash, setManifestHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chain, setChain] = useState(null); // { isValid, registeredAt, message, transactionHash }
  const [connected, setConnected] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  // streamlined UI: no raw records/debug

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const connect = async () => {
    setError(null);
    setLoading(true);
    try {
      const ok = await blockchainService.initialize(CONTRACT_ADDRESS);
      setConnected(!!ok);
      if (!ok) throw new Error("Failed to connect wallet");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifest = async (c) => {
    setError(null);
    setManifest(null);
    setManifestHash("");
    setChain(null);
    if (!c) {
      setError("Please provide a Validation Code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback/manifest/public?code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Not found");
      setManifest(data.manifest);
      setManifestHash(data.manifestHash);
      setFetchedAt(new Date().toISOString());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOnChain = async () => {
    setError(null);
    setChain(null);
    if (!connected) {
      setError("Connect wallet first");
      return;
    }
    if (!manifestHash) {
      setError("No manifest hash to verify");
      return;
    }
    setLoading(true);
    try {
      const res = await blockchainService.verifyDocument(manifestHash);
      setChain(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // derive statistics from manifest.records
  const stats = useMemo(() => {
    const recs = Array.isArray(manifest?.records) ? manifest.records : [];
    if (!recs.length) return null;

    const byType = { session: { count: 0, sum: 0 }, actual: { count: 0, sum: 0 } };
    let total = recs.length;
    let sum = 0;
    let withScore = 0;
    let best = null; // {score, role, type}
    let worst = null;
    const topicsMap = new Map();
    let answeredSum = 0, totalQSum = 0, answeredCount = 0;

    for (const r of recs) {
      const score = Number(r?.feedback?.percentageScore);
      if (!Number.isNaN(score)) {
        sum += score;
        withScore += 1;
        if (r.type === 'session') { byType.session.count++; byType.session.sum += score; }
        else if (r.type === 'actual') { byType.actual.count++; byType.actual.sum += score; }
        if (best === null || score > best.score) best = { score, role: r.role, type: r.type };
        if (worst === null || score < worst.score) worst = { score, role: r.role, type: r.type };
      }
      const topics = (r.topicsToFocus || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const t of topics) topicsMap.set(t, (topicsMap.get(t) || 0) + 1);
      const answered = Number(r?.feedback?.answeredQuestions);
      const totalQ = Number(r?.feedback?.totalQuestions);
      if (!Number.isNaN(answered) && !Number.isNaN(totalQ)) { answeredSum += answered; totalQSum += totalQ; answeredCount += 1; }
    }

    const avg = withScore ? (sum / withScore) : 0;
    const avgSession = byType.session.count ? (byType.session.sum / byType.session.count) : 0;
    const avgActual = byType.actual.count ? (byType.actual.sum / byType.actual.count) : 0;
    const completion = totalQSum ? (answeredSum / totalQSum) * 100 : null;
    const topics = Array.from(topicsMap.entries()).sort((a,b) => b[1]-a[1]).slice(0,8);

    return { total, withScore, avg, byType: { session: { ...byType.session, avg: avgSession }, actual: { ...byType.actual, avg: avgActual } }, best, worst, completion, topics };
  }, [manifest]);

  // chart data derived from stats
  const radarData = useMemo(() => {
    if (!stats?.topics) return [];
    return stats.topics.map(([name, count]) => ({ subject: name, value: count }));
  }, [stats]);

  const trendData = useMemo(() => {
    const recs = Array.isArray(manifest?.records) ? manifest.records : [];
    return recs.map((r, i) => ({
      label: r?.date || r?.createdAt || r?.timestamp || `#${i + 1}`,
      score: Number(r?.feedback?.percentageScore) || 0,
    }));
  }, [manifest]);

  const topicShare = useMemo(() => {
    if (!stats?.topics) return [];
    const total = stats.topics.reduce((sum, [, v]) => sum + (Number(v) || 0), 0) || 1;
    const arr = stats.topics.map(([name, value]) => {
      const v = Number(value) || 0;
      const pct = Math.round((v / total) * 100);
      return { name, value: v, label: `${v} (${pct}%)` };
    });
    arr.sort((a, b) => b.value - a.value);
    return arr;
  }, [stats]);

  const typeAverages = useMemo(() => {
    if (!stats?.byType) return [];
    return [
      { name: "Session", avg: Number(stats.byType.session.avg || 0) },
      { name: "Actual", avg: Number(stats.byType.actual.avg || 0) },
    ];
  }, [stats]);

  useEffect(() => {
    // keep code in sync with URL changes
    const urlCode = searchParams?.get("code") || "";
    setCode(urlCode);
    if (urlCode) fetchManifest(urlCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={process.env.NEXT_PUBLIC_BRAND_LOGO || "/Accounting.png"} alt="Brand" className="w-10 h-10 rounded" />
            <div>
              <h1 className="text-2xl font-semibold">{process.env.NEXT_PUBLIC_BRAND_NAME || 'Key2Career'}</h1>
              <div className="text-xs text-gray-600">Blockchain-Backed Assessment Verification</div>
            </div>

        {/* Account Verification quick access */}
        <div className="mt-4">
          <div className="p-4 border rounded-xl bg-white flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Account Verification</div>
              <div className="text-xs text-gray-600">Verify your email if you haven't completed it yet.</div>
            </div>
            <Link href="/interview-prep/verify-email" className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm">
              Verify Email
            </Link>
          </div>
        </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Validation Code</div>
            <div className="font-mono text-sm break-all">{code || '—'}</div>
          </div>
        </div>

        {/* Validation + Blockchain (top) */}
        <div className="mt-6">
          <div className="text-sm font-medium mb-1">Enter Validation Code</div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchManifest(code);
              }}
            />
            <button
              onClick={() => fetchManifest(code)}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch"}
            </button>
          </div>
          {/* Blockchain Panel - moved to top */}
          <div className="mt-4 p-4 border rounded-xl">
            <div className="font-medium mb-2">Blockchain</div>
            <div className="space-y-2">
              {!connected ? (
                <button onClick={() => connect()} disabled={loading} className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">Connect Wallet</button>
              ) : (
                <div className="text-sm text-emerald-700">Wallet connected</div>
              )}
              <div className="text-xs text-gray-600">Contract: <span className="font-mono break-all">{CONTRACT_ADDRESS}</span></div>
              <div className="text-xs text-gray-600">Manifest Hash: <span className="font-mono break-all">{manifestHash || '-'}</span></div>
              <button onClick={() => verifyOnChain()} disabled={!manifestHash || loading} className="mt-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Verify on Blockchain</button>
              {chain && (
                <div className={`p-3 rounded-lg text-sm ${chain.isValid ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {chain.isValid ? 'On-chain verification passed' : 'On-chain verification not found'}
                  {chain.message && <div className="text-gray-600">{chain.message}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate card (moved between blockchain and charts) */}
        <div className="mt-6 md:col-span-2">
          <div className="p-6 border rounded-xl bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={process.env.NEXT_PUBLIC_BRAND_LOGO || "/Accounting.png"} alt="Brand" className="w-10 h-10 rounded" />
                <div>
                  <div className="text-lg font-semibold">{process.env.NEXT_PUBLIC_BRAND_NAME || 'Key2Career'} Assessment Certificate</div>
                  <div className="text-xs text-gray-600">Backed by on-chain verification</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${chain?.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {chain?.isValid ? 'Verified On-Chain' : 'Awaiting On-Chain Verification'}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-gray-500">Validation Code</div>
                <div className="font-mono break-all">{code || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Manifest Hash</div>
                <div className="font-mono break-all truncate" title={manifestHash}>{manifestHash || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Generated</div>
                <div className="font-mono">{fetchedAt || '—'}</div>
              </div>
            </div>
            {stats && (
              <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Records</div>
                  <div className="font-medium">{stats.total}</div>
                </div>
                <div>
                  <div className="text-gray-500">Average Score</div>
                  <div className="font-medium">{stats.avg.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Completion</div>
                  <div className="font-medium">{stats.completion != null ? `${stats.completion.toFixed(1)}%` : '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Statistics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Summary cards */}
              <div className="p-4 border rounded-xl bg-gray-50">
                <div className="text-xs uppercase text-gray-500">Total Records</div>
                <div className="text-2xl font-semibold">{stats.total}</div>
                <div className="text-xs text-gray-600">Scored: {stats.withScore}</div>
              </div>
              <div className="p-4 border rounded-xl bg-gray-50">
                <div className="text-xs uppercase text-gray-500">Average Score</div>
                <div className="text-2xl font-semibold">{stats.avg.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Session: {stats.byType.session.avg.toFixed(1)}% • Actual: {stats.byType.actual.avg.toFixed(1)}%</div>
              </div>
              <div className="p-4 border rounded-xl bg-gray-50">
                <div className="text-xs uppercase text-gray-500">Completion</div>
                <div className="text-2xl font-semibold">{stats.completion != null ? `${stats.completion.toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-gray-600">Answered/Total across records</div>
              </div>
            </div>

            {/* Best / Worst */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium">Best Score</div>
                {stats.best ? (
                  <div className="mt-1 text-sm">{stats.best.score}% • {stats.best.type.toUpperCase()} • {stats.best.role}</div>
                ) : (
                  <div className="text-sm text-gray-600">No scored records</div>
                )}
              </div>
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium">Lowest Score</div>
                {stats.worst ? (
                  <div className="mt-1 text-sm">{stats.worst.score}% • {stats.worst.type.toUpperCase()} • {stats.worst.role}</div>
                ) : (
                  <div className="text-sm text-gray-600">No scored records</div>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {/* Radar (Spider) chart for topic distribution */}
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium mb-2">Topic Distribution (Radar)</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius={90}>
                      <PolarGrid stroke="rgba(0,0,0,0.15)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#374151", fontSize: 12 }} />
                      <Radar name="Topics" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart for average scores by type */}
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium mb-2">Average Scores by Type</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeAverages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: "#374151", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#374151", fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                      <Bar dataKey="avg" fill="#10b981" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Topic share as horizontal bars */
              }
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium mb-2">Topic Share</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicShare} layout="vertical" margin={{ left: 24, right: 24 }} barSize={18}>
                      <defs>
                        <linearGradient id="topicGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#93c5fd" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                      <XAxis type="number" tick={{ fill: "#374151", fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#374151", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                      <Bar dataKey="value" fill="url(#topicGrad)" radius={[6,6,6,6]}>
                        <LabelList dataKey="label" position="right" className="fill-gray-700 text-xs" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Trend + Completion */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 border rounded-xl md:col-span-2">
                <div className="text-sm font-medium mb-2">Score Trend Over Time</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="label" tick={{ fill: "#374151", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#374151", fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoreFill)" strokeWidth={2} />
                      <Line type="monotone" dataKey="score" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="text-sm font-medium mb-2">Completion</div>
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-3xl font-semibold mb-3">{stats?.completion != null ? `${stats.completion.toFixed(1)}%` : '—'}</div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, stats?.completion || 0)).toFixed(1)}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">Answered questions across all records</div>
                </div>
              </div>
            </div>

            {/* Topic Distribution */}
            <div className="mt-6 p-4 border rounded-xl">
              <div className="text-sm font-medium mb-2">Top Topics</div>
              {(!stats.topics || stats.topics.length === 0) ? (
                <div className="text-sm text-gray-600">No topics found.</div>
              ) : (
                <div className="space-y-2">
                  {stats.topics.map(([name, count]) => {
                    const max = stats.topics[0][1] || 1;
                    const width = Math.max(6, Math.round((count / max) * 100));
                    return (
                      <div key={name} className="text-xs">
                        <div className="flex justify-between mb-1"><span className="font-medium">{name}</span><span className="text-gray-600">{count}</span></div>
                        <div className="w-full bg-gray-100 rounded h-2">
                          <div style={{ width: `${width}%` }} className="h-2 bg-blue-500 rounded"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
