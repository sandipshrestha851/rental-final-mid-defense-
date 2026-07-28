"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, Reply, Search, Bell, X, Edit3, Trash2, ArrowUpDown } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Review } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"} />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onReply,
  onEditReply,
  onDeleteReply,
}: {
  review: Review;
  onReply: (id: number) => void;
  onEditReply: (id: number) => void;
  onDeleteReply: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {review.guestName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{review.guestName}</p>
            <p className="text-sm text-slate-400">{review.propertyTitle}</p>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{review.comment}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
        {!review.reply && (
          <button onClick={() => onReply(review.id)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors">
            <Reply size={14} /> Reply
          </button>
        )}
      </div>

      {review.reply && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Your reply</p>
            <div className="flex gap-1">
              <button onClick={() => onEditReply(review.id)} className="rounded p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit3 size={13} /></button>
              <button onClick={() => onDeleteReply(review.id)} className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.reply.text}</p>
        </div>
      )}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : "0.0";
  const counts = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
  const max = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex gap-8">
        <div className="shrink-0 text-center">
          <p className="text-4xl font-bold text-slate-800">{avg}</p>
          <div className="mt-1 flex justify-center"><StarRow rating={Math.round(Number(avg))} size={15} /></div>
          <p className="mt-1 text-sm text-slate-400">{total} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-2 text-slate-500">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(counts[idx] / max) * 100}%` }} />
              </div>
              <span className="w-4 text-right text-slate-400">{counts[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RatingFilter({ active, onChange }: { active: number | "all"; onChange: (v: number | "all") => void }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
      <p className="mb-3 font-semibold text-slate-800">Filter by Rating</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onChange("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active === "all" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>All</button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button key={star} onClick={() => onChange(star)}
            className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${active === star ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            <Star size={13} className={active === star ? "fill-white" : "fill-slate-400"} /> {star}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyReviewId, setReplyReviewId] = useState<number | null>(null);
  const [editReplyReviewId, setEditReplyReviewId] = useState<number | null>(null);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getLandlordReviews({
      sortBy,
      sortOrder,
      search: search || undefined,
      rating: filter === "all" ? undefined : filter,
    })
      .then(setReviews)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [sortBy, sortOrder, search, filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filtered = useMemo(
    () => reviews,
    [reviews]
  );

  const submitReply = async () => {
    if (!replyDraft.trim() || replyReviewId === null) return;
    try {
      await api.createReviewReply(replyReviewId, replyDraft.trim());
      setReplyDraft("");
      setReplyReviewId(null);
      fetchReviews();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to post reply');
    }
  };

  const startEdit = (reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review?.reply) {
      setEditReplyReviewId(reviewId);
      setReplyDraft(review.reply.text);
    }
  };

  const submitEdit = async () => {
    if (!replyDraft.trim() || editReplyReviewId === null) return;
    const review = reviews.find(r => r.id === editReplyReviewId);
    if (!review?.reply) return;
    try {
      await api.updateReviewReply(review.reply.id, replyDraft.trim());
      setReplyDraft("");
      setEditReplyReviewId(null);
      fetchReviews();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update reply');
    }
  };

  const confirmDelete = async (reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review?.reply || !confirm('Delete your reply?')) return;
    try {
      await api.deleteReviewReply(review.reply.id);
      fetchReviews();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete reply');
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#f4f2fa]">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
        <div className="text-sm text-slate-400">
          Landlord <span className="mx-1">/</span>
          <span className="font-medium text-violet-600">Reviews</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </div>
          <button className="relative text-slate-500 hover:text-slate-700">
            <Bell size={19} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <img src="https://i.pravatar.cc/64?img=68" className="h-8 w-8 rounded-full object-cover" alt="" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">Manage feedback from your tenants</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
              <RatingSummary reviews={reviews} />
              <div className="space-y-4">
                <RatingFilter active={filter} onChange={setFilter} />
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                  <p className="mb-2 text-sm font-semibold text-slate-800">Sort by</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setSortBy('date'); setSortOrder(sortBy === 'date' && sortOrder === 'desc' ? 'asc' : 'desc'); }}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${sortBy === 'date' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      <ArrowUpDown size={12} /> Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                    <button onClick={() => { setSortBy('rating'); setSortOrder(sortBy === 'rating' && sortOrder === 'desc' ? 'asc' : 'desc'); }}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${sortBy === 'rating' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      <ArrowUpDown size={12} /> Rating {sortBy === 'rating' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(replyReviewId !== null || editReplyReviewId !== null) && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <textarea autoFocus value={replyDraft} onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write a reply..." rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => { setReplyDraft(""); setReplyReviewId(null); setEditReplyReviewId(null); }}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100">
                  <X size={14} /> Cancel
                </button>
                <button onClick={editReplyReviewId !== null ? submitEdit : submitReply}
                  className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
                  {editReplyReviewId !== null ? 'Update reply' : 'Post reply'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
                  <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded bg-slate-100" /><div className="h-3 w-24 rounded bg-slate-100" /></div></div>
                  <div className="mt-4 space-y-2"><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-3/4 rounded bg-slate-100" /></div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                {reviews.length === 0 ? 'No reviews yet. Reviews will appear here once tenants leave feedback.' : 'No reviews with this rating yet.'}
              </div>
            ) : (
              filtered.map((review) => (
                <ReviewCard key={review.id} review={review} onReply={(id) => { setReplyReviewId(id); setEditReplyReviewId(null); setReplyDraft(""); }} onEditReply={startEdit} onDeleteReply={confirmDelete} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
