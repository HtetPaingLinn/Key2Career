"use client";
import React, { useState, useEffect } from "react";
import blockchainService from "@/lib/blockchainService";

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function ValidationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { publicId, manifestHash, version }
  const [txInfo, setTxInfo] = useState(null);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const jwt = localStorage.getItem("jwt");
      const payload = parseJwt(jwt);
      if (payload) {
        // Try common fields from your JWT payload
        const id = payload._id || payload.id || payload.userId || payload.sub || "";
        if (id) setUserId(id);
        const em = payload.email || payload.userEmail || payload.mail || "";
        if (em) setEmail(em);
      }
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      const ok = await blockchainService.initialize(CONTRACT_ADDRESS);
      setIsConnected(!!ok);
      if (!ok) throw new Error("Failed to connect wallet");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateValidationCode = async () => {
    setError(null);
    setResult(null);
    setTxInfo(null);
    // normalize: if userId looks like an email, prefer email param
    let uid = (userId || '').trim();
    let eml = (email || '').trim();
    if (!eml && uid.includes('@')) {
      eml = uid;
      uid = '';
    }
    if (!uid && !eml) {
      setError("Missing user info (no userId/email in JWT). Please login again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback/manifest/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, email: eml }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate manifest");
      setResult({ publicId: data.publicId, manifestHash: data.manifestHash, version: data.version });
      if (data.counts) {
        // Attach counts for quick debug in UI (non-intrusive)
        setTxInfo((prev) => ({ ...(prev || {}), counts: data.counts }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const registerOnChain = async () => {
    setError(null);
    setTxInfo(null);
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    if (!result?.manifestHash) {
      setError("Generate the Validation Code first");
      return;
    }
    setLoading(true);
    try {
      const reg = await blockchainService.registerDocument(result.manifestHash);
      setTxInfo(reg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.publicId) return;
    const url = `${window.location.origin}/interview-prep?code=${encodeURIComponent(result.publicId)}#verify`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Interview Validation Code</h1>
        <p className="text-sm text-gray-600 mb-6">
          Generate a single Validation Code that aggregates all your interview feedback (normal and coding test). You can then register it on-chain and share one link for verification.
        </p>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">User ID (Mongo ObjectId or custom ID)</div>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Optional if email is provided"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <div className="font-medium mb-1">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Recommended (used to resolve user)"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="text-sm">
            <div className="font-medium mb-1">Wallet</div>
            {isConnected ? (
              <div className="text-green-700">Connected to MetaMask</div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect MetaMask"}
              </button>
            )}
          </div>

          <div className="text-sm">
            <div className="font-medium mb-1">Generate</div>
            <button
              onClick={generateValidationCode}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Validation Code"}
            </button>
          </div>

          {result && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="mb-1"><span className="font-medium">Public Code:</span> <span className="font-mono break-all">{result.publicId}</span></div>
              <div className="mb-1"><span className="font-medium">Manifest Hash:</span> <span className="font-mono break-all">{result.manifestHash}</span></div>
              <div className="mb-3"><span className="font-medium">Version:</span> {result.version}</div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={registerOnChain}
                  disabled={loading || !isConnected}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Register on Blockchain"}
                </button>
                <button
                  onClick={copyLink}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
                >
                  Copy Verification Link
                </button>
              </div>
            </div>
          )}

          {txInfo && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <div className="font-medium mb-2">Registration Result</div>
              {txInfo.transactionHash && (
                <div>Tx: <span className="font-mono break-all">{txInfo.transactionHash}</span></div>
              )}
              {txInfo.blockNumber && (
                <div>Block: <span className="font-mono">{txInfo.blockNumber}</span></div>
              )}
              {txInfo.message && <div className="text-gray-600">{txInfo.message}</div>}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
