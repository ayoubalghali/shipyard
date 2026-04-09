/**
 * /embed/[id] — Embeddable agent widget (rendered inside an iframe)
 *
 * Designed for embedding on third-party sites:
 *   <iframe src="https://shipyard.ai/embed/AGENT_ID" width="100%" height="520"
 *     style="border:none;border-radius:12px;" />
 *
 * Features:
 * - No Header/Footer — lean chrome only
 * - Inherits the Shipyard dark theme
 * - Streams agent output via SSE
 * - postMessage API so the host page can interact
 */

import { Metadata } from "next";
import EmbedClient from "./EmbedClient";

export const metadata: Metadata = {
  robots: "noindex",
};

export default function EmbedPage({ params }: { params: { id: string } }) {
  return <EmbedClient agentId={params.id} />;
}
