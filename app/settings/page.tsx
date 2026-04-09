"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ApiKeysPanel from "@/components/settings/ApiKeysPanel";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  image: string | null;
  is_verified: boolean;
  total_earned: number;
  withdrawn: number;
  _count: { agents: number; executions: number; favorites: number };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d: { user: UserProfile | null }) => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name ?? "");
          setBio(d.user.bio ?? "");
        }
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setLoadingProfile(false));
  }, [status, router]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { user: UserProfile };
        setProfile((prev) => prev ? { ...prev, ...data.user } : null);
        setSaveMsg({ type: "success", text: "Profile updated successfully." });
      } else {
        const data = await res.json() as { error?: string };
        setSaveMsg({ type: "error", text: data.error ?? "Failed to save profile." });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Network error. Try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  if (status === "loading" || loadingProfile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const avatar = profile?.image ?? profile?.avatar_url ?? null;
  const initials = (profile?.name ?? session?.user?.name ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-semibold text-white">Account Settings</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Manage your profile and preferences.
            </p>
          </div>

          {/* Profile Stats */}
          {profile && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Agents Created", value: profile._count.agents },
                { label: "Total Runs", value: profile._count.executions },
                { label: "Favorites", value: profile._count.favorites },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4 text-center">
                  <p className="text-2xl font-semibold text-[#00D9FF]">{value.toLocaleString()}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-6">
            <h2 className="text-base font-semibold text-white mb-5">Public Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#1A2332] border border-[#2A3A4E] flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-medium text-[#A3A3A3]">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{profile?.email ?? session?.user?.email}</p>
                <p className="text-xs text-[#4B5563] mt-1">
                  Avatar is synced from your OAuth provider (GitHub / Google).
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#A3A3A3] mb-1.5">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  required
                  className="w-full bg-[#1A2332] border border-[#2A3A4E] rounded-md px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/20"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[#A3A3A3] mb-1.5">
                  Bio <span className="text-[#4B5563]">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Tell the community about yourself…"
                  className="w-full bg-[#1A2332] border border-[#2A3A4E] rounded-md px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/20 resize-none"
                />
                <p className="text-xs text-[#4B5563] mt-1 text-right">{bio.length}/300</p>
              </div>

              {saveMsg && (
                <div
                  className={`rounded-md px-3 py-2 text-sm ${
                    saveMsg.type === "success"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {saveMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-md text-sm font-medium text-white transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Earnings summary */}
          {profile && (profile.total_earned > 0 || profile.withdrawn > 0) && (
            <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-4">Earnings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Total Earned</p>
                  <p className="text-xl font-semibold text-[#00D9FF]">
                    ${profile.total_earned.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Available to Withdraw</p>
                  <p className="text-xl font-semibold text-white">
                    ${(profile.total_earned - profile.withdrawn).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-[#0A0E27] border border-red-900/30 rounded-lg p-6">
            {/* API Keys */}
            <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl p-6 mb-6">
              <ApiKeysPanel />
            </div>

            <h2 className="text-base font-semibold text-white mb-3">Session</h2>
            <p className="text-sm text-[#6B7280] mb-4">
              Signed in as <span className="text-[#A3A3A3]">{profile?.email ?? session?.user?.email}</span>
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 border border-red-800 hover:border-red-500 hover:bg-red-500/10 rounded-md text-sm text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
