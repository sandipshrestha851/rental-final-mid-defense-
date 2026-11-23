"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Bell,
  MessageSquare,
  Calendar,
  Home,
  Star,
  UserPlus,
  AlertCircle,
  Trash2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash,
  Check
} from "lucide-react";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Notification } from "@/lib/types";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return "Just now";
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Just now";
  }
}

export default function NotificationDropdown() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async (pageNum: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications(pageNum, limit);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || pageNum);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
    }
  }, [user, fetchNotifications]);

  // Real-time socket listener
  useEffect(() => {
    // Only connect if user is logged in
    if (!user) return;

    // Connect to Socket.IO server (either using the active state token or fallback cookies)
    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Notification socket connected successfully.");
    });

    socket.on("new_notification", (notif: Notification) => {
      // Prepend new notification if we are on the first page
      if (page === 1) {
        setNotifications((prev) => {
          // Avoid duplicate notifications in the list
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [notif, ...prev.slice(0, limit - 1)];
        });
      }
      setUnreadCount((prev) => prev + 1);
      
      // Optional: play subtle sound or alert if needed
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, page]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes("message")) {
      return <MessageSquare className="w-4 h-4 text-sky-500" />;
    }
    if (normalizedType.includes("booking")) {
      return <Calendar className="w-4 h-4 text-emerald-500" />;
    }
    if (normalizedType.includes("property")) {
      if (normalizedType.includes("approved")) {
        return <Home className="w-4 h-4 text-emerald-500" />;
      }
      if (normalizedType.includes("rejected")) {
        return <Home className="w-4 h-4 text-red-500" />;
      }
      return <Home className="w-4 h-4 text-violet-500" />;
    }
    if (normalizedType.includes("review")) {
      return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    }
    if (normalizedType.includes("user")) {
      return <UserPlus className="w-4 h-4 text-indigo-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-500" />;
  };

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      // Re-fetch notifications for current page to balance size
      fetchNotifications(page);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearRead = async () => {
    try {
      await api.clearReadNotifications();
      fetchNotifications(1);
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read if unread
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    const refId = notif.reference_id || notif.related_id;
    const type = notif.type.toLowerCase();

    if (type.includes("message")) {
      router.push("/chat");
    } else if (type.includes("booking")) {
      if (refId) {
        router.push(`/booking-details/${refId}`);
      } else {
        router.push(user?.role === "landlord" ? "/reservations" : "/tenant-booking");
      }
    } else if (type.includes("property")) {
      if (user?.role === "admin") {
        router.push("/admin");
      } else if (refId) {
        router.push(`/property/${refId}`);
      } else {
        router.push("/landlord");
      }
    } else if (type.includes("review")) {
      if (user?.role === "landlord") {
        // reviews are on landlord tab
        router.push("/landlord");
      } else if (refId) {
        router.push(`/property/${refId}`);
      }
    } else if (type.includes("user") && user?.role === "admin") {
      router.push("/admin");
    } else {
      // generic fallback
      router.push("/");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-[#555267] flex cursor-pointer p-1.5 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 border-[1.5px] border-white animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[90vw] max-w-96 bg-white border border-[#e6e4f3] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f1f8] bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-base">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-violet-100 text-violet-600 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto min-h-[220px]">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <span className="text-sm">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-red-500 gap-2">
                <AlertCircle className="w-8 h-8" />
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => fetchNotifications(1)}
                  className="mt-2 text-xs text-violet-600 font-semibold underline cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-3 px-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">All caught up!</h4>
                  <p className="text-xs mt-1 text-slate-400">You have no in-app notifications at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#f2f1f8]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex gap-3.5 p-4 hover:bg-slate-50/80 cursor-pointer transition-all duration-150 relative ${
                      !notif.is_read ? "bg-violet-50/20" : ""
                    }`}
                  >
                    {/* Icon wrapper */}
                    <div className="mt-0.5 shrink-0 w-8 py-2.5 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${!notif.is_read ? "font-semibold text-slate-800" : "font-medium text-slate-700"} truncate`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 text-slate-500 leading-relaxed ${!notif.is_read ? "font-medium text-slate-600" : ""}`}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Badge / Actions */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      {!notif.is_read ? (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="w-5 h-5 rounded-full border border-violet-100 flex items-center justify-center hover:bg-violet-100 text-violet-600 transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                      )}
                      
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Controls & Pagination */}
          {notifications.length > 0 && (
            <div className="px-5 py-3.5 border-t border-[#f2f1f8] bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={handleClearRead}
                className="text-slate-500 hover:text-red-500 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                title="Clear all read notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Read
              </button>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => fetchNotifications(page - 1)}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-medium text-slate-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => fetchNotifications(page + 1)}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
