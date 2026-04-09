"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";

interface ReviewUser {
  id: string;
  name: string;
  avatar_url: string | null;
  image: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: ReviewUser;
}

interface AgentReviewsProps {
  agentId: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentReviews({ agentId }: AgentReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New review form state
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/reviews?limit=20`);
      const data = await res.json() as { reviews: Review[]; total: number };
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);

      // Check if the current user already reviewed
      if (session?.user) {
        const mine = (data.reviews ?? []).find(
          (r: Review) => r.user.id === (session.user as { id?: string }).id
        );
        if (mine) {
          setMyReviewId(mine.id);
          setMyRating(mine.rating);
          setMyComment(mine.comment ?? "");
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [agentId, session]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myRating === 0) { setFormError("Please select a rating."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`/api/agents/${agentId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setFormError(data.error ?? "Failed to submit review.");
      } else {
        setFormSuccess(true);
        setMyComment("");
        fetchReviews();
        setTimeout(() => setFormSuccess(false), 3000);
      }
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    setSubmitting(true);
    try {
      await fetch(`/api/agents/${agentId}/reviews`, { method: "DELETE" });
      setMyRating(0);
      setMyComment("");
      setMyReviewId(null);
      fetchReviews();
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregate stats
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Reviews</h2>
        <span className="text-sm text-[#6B7280]">({total})</span>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-5 flex gap-6 flex-wrap">
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[#00D9FF]">
              {avgRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(avgRating)} readonly size="sm" />
            <span className="text-xs text-[#6B7280] mt-1">{total} review{total !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex-1 space-y-1.5 min-w-[160px]">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-[#A3A3A3] w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-[#1A2332] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] rounded-full transition-all"
                    style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-[#6B7280] w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a Review (logged-in users) */}
      {session?.user && (
        <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            {myReviewId ? "Edit Your Review" : "Write a Review"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <StarRating value={myRating} onChange={setMyRating} size="lg" />
              {myRating > 0 && (
                <span className="text-sm text-[#A3A3A3]">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][myRating]}
                </span>
              )}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share your experience with this agent… (optional)"
              rows={3}
              maxLength={500}
              className="w-full bg-[#1A2332] border border-[#2A3A4E] rounded-md px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/20 resize-none"
            />
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {formSuccess && <p className="text-xs text-green-400">Review submitted!</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || myRating === 0}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-md text-sm font-medium text-white transition-colors"
              >
                {submitting ? "Saving…" : myReviewId ? "Update Review" : "Submit Review"}
              </button>
              {myReviewId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#2A3A4E] hover:border-red-500 hover:text-red-400 rounded-md text-sm text-[#A3A3A3] transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-[#6B7280]">
          <p className="text-2xl mb-2">⭐</p>
          <p className="text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A2332] border border-[#2A3A4E] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.user.image || review.user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.user.image ?? review.user.avatar_url ?? ""}
                        alt={review.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-[#A3A3A3]">
                        {review.user.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{review.user.name}</span>
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="text-xs text-[#6B7280]">{timeAgo(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-[#A3A3A3] leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
