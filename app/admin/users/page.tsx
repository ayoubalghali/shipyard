"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  total_earned: number;
  created_at: string;
  _count: { agents: number; executions: number };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); }
  }, [status, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/admin/users${params}`);
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json() as { users: AdminUser[]; total: number };
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    if (status === "authenticated") fetchUsers();
  }, [status, fetchUsers]);

  const updateUser = async (id: string, patch: { is_verified?: boolean; is_admin?: boolean }) => {
    setUpdating(id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    }
    setUpdating(null);
  };

  if (forbidden) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Access Denied</h1>
        <Link href="/admin" className="mt-4 text-[#2563EB] text-sm">← Admin Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-[#6B7280] hover:text-white text-sm transition-colors">Admin</Link>
              <span className="text-[#6B7280]">/</span>
              <span className="text-white text-sm">Users</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">Manage Users</h1>
            <p className="text-sm text-[#6B7280] mt-1">{total} total users</p>
          </div>
          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
            className="flex gap-2"
          >
            <input
              type="search"
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search users"
              className="rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:border-[#00D9FF] focus:outline-none w-56"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg text-sm text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 text-[#6B7280]">No users found.</div>
        ) : (
          <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-[#2A3A4E]">
                    <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium">User</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium hidden sm:table-cell">Agents</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium hidden md:table-cell">Runs</th>
                    <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium hidden md:table-cell">Earned</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium">Verified</th>
                    <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium">Admin</th>
                    <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium hidden sm:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3A4E]/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#0D1535] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-[#A3A3A3] hidden sm:table-cell">
                        {user._count?.agents ?? 0}
                      </td>
                      <td className="px-4 py-3 text-center text-[#A3A3A3] hidden md:table-cell">
                        {user._count?.executions ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right text-[#A3A3A3] hidden md:table-cell">
                        ${(user.total_earned ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateUser(user.id, { is_verified: !user.is_verified })}
                          disabled={updating === user.id}
                          aria-label={user.is_verified ? "Remove verification" : "Verify user"}
                          className={`text-lg transition-opacity ${updating === user.id ? "opacity-40" : "hover:opacity-80"}`}
                        >
                          {user.is_verified ? "✅" : "○"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateUser(user.id, { is_admin: !user.is_admin })}
                          disabled={updating === user.id}
                          aria-label={user.is_admin ? "Revoke admin" : "Grant admin"}
                          className={`text-lg transition-opacity ${updating === user.id ? "opacity-40" : "hover:opacity-80"}`}
                        >
                          {user.is_admin ? "🛡️" : "○"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-[#6B7280] text-xs hidden sm:table-cell">
                        {timeAgo(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
