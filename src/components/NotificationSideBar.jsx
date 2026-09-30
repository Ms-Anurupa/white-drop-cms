/* eslint-disable no-useless-assignment */
import { useEffect, useMemo, useState } from "react";
import {
  X,
  Bell,
  BellOff,
  RefreshCw,
  ChevronDown,
  WifiOff,
  Trash2,
  Loader2,
  CheckCheckIcon,
  ShoppingCart,
  Gift,
  Gem,
  PackageCheck
} from "lucide-react";
import { useNotificationStore } from "@/zustand/Store/useNotificationStore";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Unified config: Handles the Icon, Label, Group, and all Tailwind color states in one place.
// Unified config
const TYPE_CONFIG = {
  DEFAULT: {
    icon: Bell,
    label: "General",
    group: "general", // Fallback
    iconColors: "bg-gray-100 text-gray-600",
    badgeColors: "bg-gray-50 text-gray-600 border-gray-200",
    barColor: "bg-gray-300",
  },
  ADMIN_ORDER_REC: {
    icon: ShoppingCart,
    label: "New Order",
    group: "order", // Changed to match filter
    iconColors: "bg-blue-100 text-blue-600",
    badgeColors: "bg-blue-50 text-blue-700 border-blue-200",
    barColor: "bg-blue-500",
  },
  ADMIN_PCK_JOB_FNS: {
    icon: Gift,
    label: "Packing Finished",
    group: "packaging", // Changed to match filter
    iconColors: "bg-purple-100 text-purple-600",
    badgeColors: "bg-purple-50 text-purple-700 border-purple-200",
    barColor: "bg-purple-500",
  },
  ADMIN_ADHOC_REC: {
    icon: Gem,
    label: "Adhoc Request",
    group: "adhoc", // Changed to match filter
    iconColors: "bg-amber-100 text-amber-600",
    badgeColors: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
  },
  DELIVERY_JOB_COMPLETE: {
    icon: PackageCheck,
    label: "Delivery Complete",
    group: "order", // Grouping delivery under orders
    iconColors: "bg-emerald-100 text-emerald-600",
    badgeColors: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "order", label: "ORDER" },
  { key: "adhoc", label: "ADHOC" },
  { key: "packaging", label: "Packaging Job" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;
const isUnread = (n) => n?.status === "PENDING" || n?.status === "SENT";
const isDeleted = (n) => n?.status === "DEL" || n?.isDelete === true;

const formatRelative = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatFull = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "-";

const dayBucket = (date) => {
  const d = new Date(date);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((startOfToday - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
};

const BUCKET_ORDER = ["Today", "Yesterday", "This week", "Earlier"];
const senderName = (n) => n?.from?.customer_name || n?.from?.name || n?.from?.userName || "System";

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

const NotificationSkeleton = () => (
  <div className="space-y-2">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex animate-pulse gap-3 rounded-xl border border-gray-100 bg-white p-4">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/5 rounded bg-gray-100" />
          <div className="h-3 w-4/5 rounded bg-gray-100" />
          <div className="h-3 w-1/4 rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ filtered, onReset }) => (
  <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <BellOff size={22} />
    </div>
    <p className="mt-4 text-sm font-medium text-gray-700">
      {filtered ? "Nothing matches your filters" : "You're all caught up"}
    </p>
    <p className="mt-1 max-w-[240px] text-xs text-gray-400">
      {filtered
        ? "Try a different filter or clear your search."
        : "New notifications from other admins will show up here."}
    </p>
    {filtered && (
      <button
        type="button"
        onClick={onReset}
        className="mt-4 cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
      >
        Clear filters
      </button>
    )}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
      <WifiOff size={22} />
    </div>
    <p className="mt-4 text-sm font-medium text-gray-700">Couldn't load notifications</p>
    <p className="mt-1 max-w-[260px] text-xs text-gray-400">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 cursor-pointer rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
    >
      Try again
    </button>
  </div>
);

const NotificationIcon = ({ type, unread }) => {
  const cfg = getConfig(type);
  const Icon = cfg.icon;

  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
        unread
          ? `${cfg.iconColors} shadow-sm ring-1 ring-black/5`
          : "bg-gray-50 text-gray-400 border border-gray-100"
      }`}
    >
      <Icon size={18} strokeWidth={unread ? 2.5 : 2} />
      {/* {unread && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
      )} */}
    </div>
  );
};

const NotificationItem = ({ notification, onDelete, onRead }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cfg = getConfig(notification.type);
  const unread = isUnread(notification);
  const longBody = (notification.body || "").length > 110;

  const handleInteraction = () => {
    if (unread) onRead(notification.id);
    if (longBody) setExpanded((v) => !v);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(notification.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-colors cursor-pointer ${
        unread ? "border-blue-200 bg-blue-50/70 shadow-sm" : "border-gray-200 bg-white"
      } ${deleting ? "pointer-events-none opacity-60" : ""}`}
    >
      {unread && <span className={`absolute inset-y-0 left-0 w-1 ${cfg.barColor}`} />}

      <div className="flex gap-3 p-4">
        
        <NotificationIcon type={notification.type} unread={unread} />

        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            onClick={handleInteraction}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInteraction()}
            className="cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm leading-snug ${
                  unread ? "font-semibold text-gray-900" : "font-medium text-gray-500"
                }`}
              >
                {notification.title}
              </p>
              <span
                className={`mt-0.5 shrink-0 text-[11px] ${
                  unread ? "font-medium text-blue-600" : "text-gray-400"
                }`}
                title={formatFull(notification.createdAt)}
              >
                {formatRelative(notification.createdAt)}
              </span>
            </div>

            <p
              className={`mt-1 whitespace-pre-line text-xs leading-relaxed ${
                unread ? "text-gray-600" : "text-gray-400"
              } ${expanded ? "" : "line-clamp-2"}`}
            >
              {notification.body}
            </p>
          </div>

          {confirming ? (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs font-medium text-red-700">Delete this notification?</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="cursor-pointer rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed"
                >
                  {deleting && <Loader2 size={12} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  unread ? cfg.badgeColors : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {cfg.label}
              </span>
              <span className="text-[11px] text-gray-400">
                from {senderName(notification)}
              </span>

              <div className="ml-auto flex items-center gap-1">
                {longBody && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-black/5 hover:text-gray-600 cursor-pointer"
                  >
                    <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  title="Delete"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

const NotificationSidebar = ({ open, onClose }) => {
  const {
    adminNotifications,
    nextCursor,
    loading,
    fetchingMore,
    error,
    getAdminToAdminNotification,
    changeAdminNotificationStatus,
  } = useNotificationStore();

  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const handleRead = async (notiId) => {
    try {
      await changeAdminNotificationStatus({ ids: [notiId], status: "READ" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await changeAdminNotificationStatus({ markAllRead: true });
    } catch (err) {
      console.log(err)
      setActionError("Couldn't mark all as read.");
    }
  };

  const handleDelete = async (notiId) => {
    setActionError("");
    try {
      await changeAdminNotificationStatus({ ids: [notiId], status: "DEL" });
    } catch (err) {
      setActionError("Couldn't delete the notification. Try again.");
      throw err;
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !fetchingMore) {
      getAdminToAdminNotification({ cursor: nextCursor, reset: false });
    }
  };

  useEffect(() => {
    if (open) getAdminToAdminNotification({ reset: true });
  }, [open, getAdminToAdminNotification]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const visible = useMemo(
    () =>
      (Array.isArray(adminNotifications) ? adminNotifications : [])
        .filter((n) => !isDeleted(n))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [adminNotifications]
  );

  const counts = useMemo(() => {
    // 1. Dynamically build the counts object based on your FILTERS array
    const c = { all: visible.length, unread: 0 };
    FILTERS.forEach((f) => {
      if (f.key !== "all" && f.key !== "unread") c[f.key] = 0;
    });

    // 2. Tally them up
    visible.forEach((n) => {
      if (isUnread(n)) c.unread += 1;
      const g = getConfig(n.type).group;
      if (c[g] !== undefined) c[g] += 1;
    });
    return c;
  }, [visible]);

  const filtered = useMemo(() => {
    
    return visible.filter((n) => {
      // Filter by category tab
      if (filter === "unread" && !isUnread(n)) return false;
      if (!["all", "unread"].includes(filter) && getConfig(n.type).group !== filter) return false;
      return true;
    });
  }, [visible, filter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((n) => {
      const b = dayBucket(n.createdAt);
      (map[b] = map[b] || []).push(n);
    });
    return BUCKET_ORDER.filter((b) => map[b]).map((b) => ({ bucket: b, items: map[b] }));
  }, [filtered]);

  if (!open) return null;
  const hasFilters = filter !== "all";
  const firstLoad = loading && visible.length === 0;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <aside className="absolute right-0 top-0 flex h-full w-full flex-col bg-gray-50 shadow-2xl sm:w-[480px]">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between px-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                {counts.unread > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {counts.unread} new
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-400">Event Updates</p>
            </div>

            <div className="flex items-center gap-1">
              {counts.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                >
                  <CheckCheckIcon size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => getAdminToAdminNotification({ reset: true })}
                disabled={loading}
                title="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-1.5 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                  <span className={active ? "text-gray-300" : "text-gray-400"}>
                    {counts[f.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {actionError && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <p>{actionError}</p>
              <button onClick={() => setActionError("")} className="cursor-pointer"><X size={14} /></button>
            </div>
          )}

          {firstLoad ? (
            <NotificationSkeleton />
          ) : error && visible.length === 0 ? (
            <ErrorState message={error} onRetry={() => getAdminToAdminNotification({ reset: true })} />
          ) : filtered.length === 0 ? (
            <EmptyState filtered={hasFilters} onReset={() => { setFilter("all"); setQuery(""); }} />
          ) : (
            <div className="space-y-5 pb-6">
              {grouped.map(({ bucket, items }) => (
                <section key={bucket}>
                  <h3 className="mb-2 px-1 text-xs font-medium text-gray-400">{bucket}</h3>
                  <div className="space-y-2">
                    {items.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onRead={handleRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* Pagination Load More Button */}
              {nextCursor && !hasFilters && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={fetchingMore}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchingMore && <Loader2 size={16} className="animate-spin" />}
                    {fetchingMore ? "Loading..." : "Load older notifications"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Bell trigger: drop this into your navbar                                  */
/* -------------------------------------------------------------------------- */

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const getAdminToAdminNotification = useNotificationStore((state) => state.getAdminToAdminNotification);
  const adminNotifications = useNotificationStore((state) => state.adminNotifications);

  // Poll for fresh data
  useEffect(() => {
    getAdminToAdminNotification({ reset: true });
    // Refetch the first page every minute to check for new notifications
    const id = setInterval(() => getAdminToAdminNotification({ reset: true }), 60000);
    return () => clearInterval(id);
  }, [getAdminToAdminNotification]);

  const unread = (Array.isArray(adminNotifications) ? adminNotifications : [])
    .filter((n) => isUnread(n) && !isDeleted(n)).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition cursor-pointer"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      <NotificationSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default NotificationSidebar;