import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-8 max-w-md w-full">
        <div className="mb-4 text-4xl">⚡</div>
        <h1 className="text-[24px] font-semibold text-white">Agent Builder</h1>
        <p className="mt-3 text-sm text-[#A3A3A3]">
          Feature 3 — No-Code Agent Builder — is coming in Week 3.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8]"
        >
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
