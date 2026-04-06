"use client";

import { motion } from "framer-motion";
import AgentCard from "@/components/agents/AgentCard";
import { FEATURED_AGENTS } from "@/lib/mockData";
import { Agent } from "@/lib/types";

export default function FeaturedAgents() {
  const handleUseAgent = (agent: Agent) => {
    // Navigate to agent detail page (full nav handled by Link in AgentCard)
    window.location.href = `/agent/${agent.id}`;
  };

  return (
    <section id="featured" className="px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.3] text-white">
              Featured Agents
            </h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Hand-picked by the Shipyard team
            </p>
          </div>
          <a
            href="#browse"
            className="hidden text-sm text-[#00D9FF] transition-colors hover:underline sm:block"
          >
            View all →
          </a>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_AGENTS.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="animate-gpu"
            >
              <AgentCard agent={agent} onUseClick={handleUseAgent} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
