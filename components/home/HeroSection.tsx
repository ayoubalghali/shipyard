"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pt-28">
      {/* Background glow effect */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[400px] w-[600px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2A3A4E] bg-[#0A0E27] px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D9FF] animate-pulse" aria-hidden="true" />
          <span className="text-xs font-medium text-[#00D9FF]">
            Now in Beta · Free to use
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="text-[32px] font-semibold leading-[1.2] tracking-tight text-white sm:text-5xl"
        >
          Create & Share{" "}
          <span className="text-[#00D9FF]">AI Agents</span>
          <br />
          Without Code
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#A3A3A3]"
        >
          Build powerful AI agents in minutes — no coding required. Share them with the world
          and earn when others use them.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/create"
            className="rounded-[6px] bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
          >
            Create Your First Agent
          </Link>
          <Link
            href="#featured"
            className="rounded-[6px] border border-[#2A3A4E] px-6 py-2.5 text-sm font-medium text-[#00D9FF] transition-all duration-150 hover:border-[#2563EB] hover:bg-[#0A0E27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
          >
            Explore Agents →
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="mt-10 flex items-center justify-center gap-6 text-xs text-[#6B7280]"
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>1,200+ agents available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Runs locally with Ollama</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
