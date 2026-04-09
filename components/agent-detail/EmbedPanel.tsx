"use client";

import { useState } from "react";

interface EmbedPanelProps {
  agentId: string;
  agentName: string;
}

const BASE = typeof window !== "undefined" ? window.location.origin : "https://shipyard.ai";

export default function EmbedPanel({ agentId, agentName }: EmbedPanelProps) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState("520");
  const [copied, setCopied] = useState<"iframe" | "script" | null>(null);

  const embedUrl = `${BASE}/embed/${agentId}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  title="${agentName}"
  width="100%"
  height="${height}"
  style="border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.4);"
  allow="clipboard-write"
></iframe>`;

  const scriptCode = `<div id="shipyard-${agentId}"></div>
<script>
  (function() {
    var el = document.getElementById('shipyard-${agentId}');
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '100%';
    iframe.height = '${height}';
    iframe.style.cssText = 'border:none;border-radius:12px;';
    el.appendChild(iframe);
  })();
</script>`;

  const copy = async (type: "iframe" | "script") => {
    await navigator.clipboard.writeText(type === "iframe" ? iframeCode : scriptCode);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between rounded-lg border border-[#2A3A4E] bg-[#0A0E27] px-4 py-3 text-sm text-[#A3A3A3] hover:border-[#2563EB] hover:text-white transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Embed this agent
        </span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] p-4 space-y-4">
          {/* Preview link */}
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Preview</p>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#2563EB] hover:text-[#00D9FF] transition-colors"
            >
              {embedUrl} ↗
            </a>
          </div>

          {/* Height control */}
          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Widget height (px)</label>
            <input
              type="number"
              min={300}
              max={900}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-24 rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-1.5 text-sm text-white focus:border-[#00D9FF] focus:outline-none"
            />
          </div>

          {/* iFrame snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[#A3A3A3]">iFrame embed</p>
              <button
                onClick={() => copy("iframe")}
                className="text-xs text-[#2563EB] hover:text-[#00D9FF] transition-colors"
              >
                {copied === "iframe" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="rounded-lg border border-[#2A3A4E] bg-[#050810] px-3 py-2 text-[10px] text-[#6B7280] font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {iframeCode}
            </pre>
          </div>

          {/* Script snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[#A3A3A3]">Script embed</p>
              <button
                onClick={() => copy("script")}
                className="text-xs text-[#2563EB] hover:text-[#00D9FF] transition-colors"
              >
                {copied === "script" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="rounded-lg border border-[#2A3A4E] bg-[#050810] px-3 py-2 text-[10px] text-[#6B7280] font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {scriptCode}
            </pre>
          </div>

          <p className="text-[10px] text-[#4B5563]">
            The widget streams output in real time. Use{" "}
            <code className="text-[#6B7280]">window.addEventListener(&apos;message&apos;, …)</code>{" "}
            to listen for <code className="text-[#6B7280]">shipyard:run_complete</code> events.
          </p>
        </div>
      )}
    </div>
  );
}
