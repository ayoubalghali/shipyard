"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [expiryDays, setExpiryDays] = useState<string>("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/user/api-keys")
      .then((r) => r.json() as Promise<{ keys: ApiKey[] }>)
      .then((d) => setKeys(d.keys ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/user/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newKeyName.trim() || "My API Key",
        expires_days: expiryDays ? parseInt(expiryDays) : undefined,
      }),
    });
    const data = await res.json() as { apiKey: ApiKey; rawKey: string };
    setKeys((prev) => [data.apiKey, ...prev]);
    setRevealedKey(data.rawKey);
    setNewKeyName("");
    setExpiryDays("");
    setShowForm(false);
    setCreating(false);
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Revoke this API key? It cannot be undone.")) return;
    await fetch(`/api/user/api-keys?id=${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyKey = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section aria-labelledby="api-keys-heading">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="api-keys-heading" className="text-base font-semibold text-white">API Keys</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Use keys to run agents programmatically</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg text-xs font-medium text-white transition-colors"
          >
            + New Key
          </button>
        )}
      </div>

      {/* One-time key reveal */}
      <AnimatePresence>
        {revealedKey && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 p-4"
          >
            <p className="text-xs font-medium text-[#10B981] mb-2">
              ✅ Key created — copy it now. It won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[#0A0E27] px-3 py-2 text-xs text-[#A3A3A3] font-mono truncate border border-[#2A3A4E]">
                {revealedKey}
              </code>
              <button
                onClick={copyKey}
                className="px-3 py-2 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-xs text-[#10B981] transition-colors flex-shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setRevealedKey(null)}
                className="text-[#6B7280] hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={createKey}
            className="mb-4 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] p-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-white mb-3">New API Key</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  maxLength={64}
                  className="w-full rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:border-[#00D9FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Expires in (optional)</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white focus:border-[#00D9FF] focus:outline-none"
                >
                  <option value="">Never</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg text-sm text-white disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating…" : "Create Key"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-[#2A3A4E] text-sm text-[#A3A3A3] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Keys list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2A3A4E] p-8 text-center">
          <p className="text-sm text-[#6B7280]">No API keys yet. Create one to run agents programmatically.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2A3A4E] overflow-hidden">
          {keys.map((key, i) => (
            <div
              key={key.id}
              className={`flex items-center gap-4 px-4 py-3 ${i < keys.length - 1 ? "border-b border-[#2A3A4E]/50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{key.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <code className="text-xs text-[#6B7280] font-mono">{key.key_prefix}••••••••</code>
                  {key.last_used_at && (
                    <span className="text-xs text-[#4B5563]">Last used {timeAgo(key.last_used_at)}</span>
                  )}
                  {key.expires_at && (
                    <span className="text-xs text-[#F59E0B]">
                      Expires {new Date(key.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => revokeKey(key.id)}
                className="text-xs text-[#EF4444] hover:text-white border border-[#EF4444]/30 hover:border-[#EF4444] px-2 py-1 rounded-md transition-colors flex-shrink-0"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Docs callout */}
      <div className="mt-4 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] p-4">
        <p className="text-xs text-[#6B7280] mb-2 font-medium">Usage example</p>
        <pre className="text-xs text-[#A3A3A3] font-mono overflow-x-auto whitespace-pre-wrap break-all">{`curl -X POST https://shipyard.ai/api/agents/{id}/execute \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"input_data": {"input": "Hello"}}'`}</pre>
      </div>
    </section>
  );
}
