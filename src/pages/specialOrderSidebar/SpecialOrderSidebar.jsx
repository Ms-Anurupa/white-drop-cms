import { useEffect, useMemo, useState } from "react";
import {
  X,
  Bell,
  BellOff,
  Search,
  RefreshCw,
  Info,
  AlertTriangle,
  AlertOctagon,
  Siren,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  ShoppingBag,
  CreditCard,
  BadgeCheck,
  Repeat,
  Hourglass,
  ChevronDown,
  WifiOff,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNotificationStore } from "@/zustand/Store/useNotificationStore";


/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const TYPE_CONFIG = {
  DEFAULT: { icon: Bell, tone: "gray", label: "General", group: "general" },
  INFO: { icon: Info, tone: "blue", label: "Info", group: "general" },
  ACCEPTED: {
    icon: CheckCircle2,
    tone: "green",
    label: "Accepted",
    group: "general",
  },
  REJECTED: { icon: XCircle, tone: "red", label: "Rejected", group: "alerts" },
  FAILED: { icon: AlertOctagon, tone: "red", label: "Failed", group: "alerts" },
  WARNING: {
    icon: AlertTriangle,
    tone: "amber",
    label: "Warning",
    group: "alerts",
  },
  ALERT: { icon: Siren, tone: "red", label: "Alert", group: "alerts" },
  ORDER_REC: {
    icon: ShoppingBag,
    tone: "blue",
    label: "New order",
    group: "orders",
  },
  DELIVERY_OUT: {
    icon: Truck,
    tone: "indigo",
    label: "Out for delivery",
    group: "orders",
  },
  DELIVERY_COMPLETE: {
    icon: PackageCheck,
    tone: "green",
    label: "Delivered",
    group: "orders",
  },
  PAYMENT_OK: {
    icon: BadgeCheck,
    tone: "green",
    label: "Payment received",
    group: "payments",
  },
  PAYMENT_FAILED: {
    icon: CreditCard,
    tone: "red",
    label: "Payment failed",
    group: "payments",
  },
  SUB_STARTED: {
    icon: Repeat,
    tone: "teal",
    label: "Subscription started",
    group: "subscriptions",
  },
  SUB_ENDING: {
    icon: Hourglass,
    tone: "amber",
    label: "Subscription ending",
    group: "subscriptions",
  },
};

const TONES = {
  gray: {
    chip: "bg-gray-100 text-gray-600",
    ring: "ring-gray-200",
    bar: "bg-gray-300",
    badge: "bg-gray-50 text-gray-600 border-gray-200",
  },
  blue: {
    chip: "bg-blue-50 text-blue-600",
    ring: "ring-blue-100",
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  green: {
    chip: "bg-green-50 text-green-600",
    ring: "ring-green-100",
    bar: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  red: {
    chip: "bg-red-50 text-red-600",
    ring: "ring-red-100",
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  amber: {
    chip: "bg-amber-50 text-amber-600",
    ring: "ring-amber-100",
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  indigo: {
    chip: "bg-indigo-50 text-indigo-600",
    ring: "ring-indigo-100",
    bar: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  teal: {
    chip: "bg-teal-50 text-teal-600",
    ring: "ring-teal-100",
    bar: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "orders", label: "Orders" },
  { key: "payments", label: "Payments" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "alerts", label: "Alerts" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;

// PENDING / SENT = not yet read.
const isUnread = (n) => n?.status === "PENDING" || n?.status === "SENT";

// Hidden once deleted (status DEL, or the isDelete flag returned by the delete API)
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
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatFull = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const dayBucket = (date) => {
  const d = new Date(date);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (startOfToday - new Date(d).setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
};

const BUCKET_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

const senderName = (n) =>
  n?.from?.customer_name || n?.from?.name || n?.from?.userName || "System";

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

const NotificationSkeleton = () => (
  <div className="space-y-2">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex animate-pulse gap-3 rounded-xl border border-gray-100 bg-white p-4"
      >
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
    <p className="mt-4 text-sm font-medium text-gray-700">
      Couldn't load notifications
    </p>
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

const NotificationItem = ({ notification, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cfg = getConfig(notification.type);
  const tone = TONES[cfg.tone];
  const Icon = cfg.icon;
  const unread = isUnread(notification);
  const longBody = (notification.body || "").length > 110;

  const toggle = () => longBody && setExpanded((v) => !v);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(notification.id);
    } catch {
      // parent shows the error banner; let the user try again
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-colors ${
        unread
          ? "border-blue-200 bg-blue-50/70 shadow-sm"
          : "border-gray-200 bg-white"
      } ${deleting ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* Type-coloured edge marks unread */}
      {unread && (
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
      )}

      <div className="flex gap-3 p-4">
        {/* Icon: full colour when unread, muted grey when read */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-4 ${
            unread
              ? `${tone.chip} ${tone.ring}`
              : "bg-gray-100 text-gray-400 ring-gray-50"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            role={longBody ? "button" : undefined}
            tabIndex={longBody ? 0 : undefined}
            onClick={toggle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
            className={longBody ? "cursor-pointer" : ""}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm leading-snug ${
                  unread
                    ? "font-semibold text-gray-900"
                    : "font-medium text-gray-500"
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

            {expanded && (
              <p className="mt-2 text-[11px] text-gray-400">
                {formatFull(notification.createdAt)}
              </p>
            )}
          </div>

          {/* Footer */}
          {confirming ? (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs font-medium text-red-700">
                Delete this notification?
              </p>
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
                  unread
                    ? tone.badge
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {cfg.label}
              </span>
              <span className="text-[11px] text-gray-400">
                from {senderName(notification)}
                {notification.role
                  ? ` · ${String(notification.role).replace(/_/g, " ").toLowerCase()}`
                  : ""}
              </span>

              <div className="ml-auto flex items-center gap-1">
                {longBody && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={expanded ? "Collapse" : "Expand"}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-black/5 hover:text-gray-600"
                  >
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  aria-label="Delete notification"
                  title="Delete"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {unread && (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
            aria-label="Unread"
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

const NotificationSidebar = ({ open, onClose }) => {
  const getAdminToAdminNotification = useNotificationStore(
    (state) => state.getAdminToAdminNotification,
  );
  const deleteAdminNotification = useNotificationStore(
    (state) => state.deleteAdminNotification,
  );
  const adminNotifications = useNotificationStore(
    (state) => state.adminNotifications,
  );
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");

  const handleDelete = async (notiId) => {
    setActionError("");
    try {
      await deleteAdminNotification(notiId);
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Couldn't delete the notification. Try again.",
      );
      throw err; // lets the item reset its own state
    }
  };

  useEffect(() => {
    if (open) getAdminToAdminNotification();
  }, [open, getAdminToAdminNotification]);

  // Close on Escape
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
    [adminNotifications],
  );

  const counts = useMemo(() => {
    const c = {
      all: visible.length,
      unread: 0,
      orders: 0,
      payments: 0,
      subscriptions: 0,
      alerts: 0,
    };
    visible.forEach((n) => {
      if (isUnread(n)) c.unread += 1;
      const g = getConfig(n.type).group;
      if (c[g] !== undefined) c[g] += 1;
    });
    return c;
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((n) => {
      if (filter === "unread" && !isUnread(n)) return false;
      if (
        !["all", "unread"].includes(filter) &&
        getConfig(n.type).group !== filter
      )
        return false;
      if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [visible, filter, query]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((n) => {
      const b = dayBucket(n.createdAt);
      (map[b] = map[b] || []).push(n);
    });
    return BUCKET_ORDER.filter((b) => map[b]).map((b) => ({
      bucket: b,
      items: map[b],
    }));
  }, [filtered]);

  if (!open) return null;

  const hasFilters = filter !== "all" || query.trim() !== "";
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
                <h2 className="text-base font-semibold text-gray-900">
                  Notifications
                </h2>
                {counts.unread > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {counts.unread} new
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                Updates from other admins
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => getAdminToAdminNotification()}
                disabled={loading}
                title="Refresh"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notifications"
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
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
                    {counts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {actionError && (
            <div className="mb-3 flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs text-red-700">{actionError}</p>
              <button
                type="button"
                onClick={() => setActionError("")}
                className="cursor-pointer text-red-400 hover:text-red-600"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {firstLoad ? (
            <NotificationSkeleton />
          ) : error && visible.length === 0 ? (
            <ErrorState
              message={error}
              onRetry={() => getAdminToAdminNotification()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              filtered={hasFilters}
              onReset={() => {
                setFilter("all");
                setQuery("");
              }}
            />
          ) : (
            <div className="space-y-5">
              {grouped.map(({ bucket, items }) => (
                <section key={bucket}>
                  <h3 className="mb-2 px-1 text-xs font-medium text-gray-400">
                    {bucket}
                  </h3>
                  <div className="space-y-2">
                    {items.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              ))}
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

  const getAdminToAdminNotification = useNotificationStore(
    (state) => state.getAdminToAdminNotification,
  );
  const adminNotifications = useNotificationStore(
    (state) => state.adminNotifications,
  );

  // Fetch once on mount, then poll so the badge stays fresh
  useEffect(() => {
    getAdminToAdminNotification();
    const id = setInterval(getAdminToAdminNotification, 60000);
    return () => clearInterval(id);
  }, [getAdminToAdminNotification]);

  const unread = (
    Array.isArray(adminNotifications) ? adminNotifications : []
  ).filter((n) => isUnread(n) && !isDeleted(n)).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Notifications"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
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
