import React, { useMemo, useState } from "react";
import {
  Star,
  Reply,
  Search,
  Bell,
  ChevronLeft,
  LayoutGrid,
  Building2,
  CalendarDays,
  User,
  MessageSquare,
  X,
} from "lucide-react";

// ---------- Mock data ----------
interface Review {
  id: string;
  guestName: string;
  guestAvatar: string;
  property: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string; // ISO
  reply?: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    guestName: "Ryan Mitchell",
    guestAvatar: "https://i.pravatar.cc/80?img=12",
    property: "Industrial Loft in Arts District",
    rating: 5,
    comment:
      "Absolutely stunning loft! The exposed brick and natural light made every morning feel special. The neighborhood is full of amazing restaurants and galleries. Will definitely book again.",
    date: "2024-11-01",
  },
  {
    id: "r2",
    guestName: "Daniel Lee",
    guestAvatar: "https://i.pravatar.cc/80?img=13",
    property: "Desert Modern Oasis",
    rating: 5,
    comment:
      "Desert modern perfection! The pool and mountain views are unreal. Felt like a private resort. Already planning our return trip.",
    date: "2025-01-05",
  },
  {
    id: "r3",
    guestName: "Sarah Williams",
    guestAvatar: "https://i.pravatar.cc/80?img=5",
    property: "Contemporary Townhouse Near Tech Hub",
    rating: 4,
    comment:
      "Sleek and modern with great tech features. The courtyard is a nice private outdoor space. Walking distance to great coffee shops.",
    date: "2024-12-10",
  },
  {
    id: "r4",
    guestName: "Sarah Williams",
    guestAvatar: "https://i.pravatar.cc/80?img=5",
    property: "Industrial Loft in Arts District",
    rating: 4,
    comment:
      "Great space and location. The kitchen is well-equipped and the bed is comfortable. Only minor issue was street noise on weekends, but it didn't ruin the stay.",
    date: "2024-10-22",
  },
  {
    id: "r5",
    guestName: "Emma Thompson",
    guestAvatar: "https://i.pravatar.cc/80?img=9",
    property: "Soho Artist Loft",
    rating: 4,
    comment:
      "Incredible Soho location and the space is huge! Perfect for creatives. The natural light is amazing for photography.",
    date: "2024-10-01",
    reply:
      "Thank you so much, Emma! So glad the light worked well for your shoots — you're welcome back anytime.",
  },
  {
    id: "r6",
    guestName: "Marcus Chen",
    guestAvatar: "https://i.pravatar.cc/80?img=15",
    property: "Desert Modern Oasis",
    rating: 4,
    comment:
      "Beautiful property with a killer view at sunset. Check-in was smooth and the host was quick to respond to questions.",
    date: "2024-09-14",
  },
];

// ---------- Helpers ----------
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function Topbar() {
  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
      <div className="text-sm text-slate-400">
        Landlord <span className="mx-1">/</span>
        <span className="font-medium text-violet-600">Reviews</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search properties, bookings..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={19} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <img
          src="https://i.pravatar.cc/64?img=68"
          className="h-8 w-8 rounded-full object-cover"
          alt=""
        />
      </div>
    </header>
  );
}

// ---------- Review card ----------
function ReviewCard({ review }: { review: Review }) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [savedReply, setSavedReply] = useState(review.reply);

  const submitReply = () => {
    if (!draft.trim()) return;
    setSavedReply(draft.trim());
    setDraft("");
    setReplying(false);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img
            src={review.guestAvatar}
            alt={review.guestName}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-slate-800">{review.guestName}</p>
            <p className="text-sm text-slate-400">{review.property}</p>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {review.comment}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(review.date)}</span>
        {!savedReply && !replying && (
          <button
            onClick={() => setReplying(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors"
          >
            <Reply size={14} />
            Reply
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Write a reply to ${review.guestName}...`}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setReplying(false);
                setDraft("");
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={submitReply}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Post reply
            </button>
          </div>
        </div>
      )}

      {savedReply && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">
            Your reply
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {savedReply}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Summary ----------
function RatingSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = total
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : "0.0";
  const counts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );
  const max = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex gap-8">
        <div className="shrink-0 text-center">
          <p className="text-4xl font-bold text-slate-800">{avg}</p>
          <div className="mt-1 flex justify-center">
            <StarRow rating={Math.round(Number(avg))} size={15} />
          </div>
          <p className="mt-1 text-sm text-slate-400">{total} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-2 text-slate-500">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${(counts[idx] / max) * 100}%` }}
                />
              </div>
              <span className="w-4 text-right text-slate-400">
                {counts[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RatingFilter({
  active,
  onChange,
}: {
  active: number | "all";
  onChange: (v: number | "all") => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
      <p className="mb-3 font-semibold text-slate-800">Filter by Rating</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === "all"
              ? "bg-violet-600 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === star
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Star
              size={13}
              className={active === star ? "fill-white" : "fill-slate-400"}
            />
            {star}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function ReviewsPage() {
  const [filter, setFilter] = useState<number | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? MOCK_REVIEWS
        : MOCK_REVIEWS.filter((r) => r.rating === filter),
    [filter]
  );

  return (
    <div className="flex h-screen w-full bg-[#f4f2fa] font-sans">
      {/* <Sidebar /> */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage feedback from your tenants
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
              <RatingSummary reviews={MOCK_REVIEWS} />
              <RatingFilter active={filter} onChange={setFilter} />
            </div>

            <div className="mt-6 space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                  No reviews with this rating yet.
                </div>
              ) : (
                filtered.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
