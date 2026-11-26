import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  PieChart as PieChartIcon,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import productSaleStore, {
  expenseAnalyticsStore,
  orderAnalyticsStore,
} from "@/zustand/Store/analyticsStore";
import useThemeStore from "@/zustand/Store/themeStore";

/* ============================================================
   1. CONFIG & HELPERS
   ============================================================ */

const CATEGORY_COLORS = [
  "#2563EB",
  "#0D9488",
  "#EA580C",
  "#9333EA",
  "#DB2777",
  "#0891B2",
  "#65A30D",
  "#D97706",
  "#4F46E5",
  "#E11D48",
  "#0284C7",
  "#7C3AED",
  "#059669",
  "#C026D3",
  "#CA8A04",
  "#475569",
];

const CATEGORY_COLORS_DARK = [
  "#60A5FA",
  "#2DD4BF",
  "#FB923C",
  "#C084FC",
  "#F472B6",
  "#22D3EE",
  "#A3E635",
  "#FBBF24",
  "#818CF8",
  "#FB7185",
  "#38BDF8",
  "#A78BFA",
  "#34D399",
  "#E879F9",
  "#FACC15",
  "#94A3B8",
];

const getCategoryColor = (i, isDark = false) =>
  (isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS)[i % CATEGORY_COLORS.length];

const YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => YEAR - i);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));

const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const weeksIn = (y, m) => Math.ceil(daysIn(y, m) / 7);
const weekRange = (y, m, w) => [w * 7 + 1, Math.min(w * 7 + 7, daysIn(y, m))];

const TABS = [
  {
    id: "product",
    label: "Product",
    title: "Product Sales",
    blurb: "Units sold across product categories.",
    metric: "Units sold",
    prefix: "",
    hue: "#2563EB",
    darkHue: "#60A5FA",
    managePath: "/dashboard/product",
    icon: Package,
    isDynamic: true,
    categoryLabel: "Product",
    inverse: false,
  },
  {
    id: "expenses",
    label: "Expenses",
    title: "Expense Analytics",
    blurb: "Where the money goes, by expense type.",
    metric: "Spend",
    prefix: "₹",
    hue: "#0D9488",
    darkHue: "#2DD4BF",
    managePath: "/dashboard/expense",
    icon: Wallet,
    isDynamic: true,
    categoryLabel: "Expense",
    inverse: true, // rising spend is "bad"
  },
  {
    id: "orders",
    label: "Orders",
    title: "Order Analytics",
    blurb: "Order revenue across Mini, Subscription, Corporate, Adhoc, and Special orders.",
    metric: "Order value",
    prefix: "₹",
    hue: "#EA580C",
    darkHue: "#FB923C",
    managePath: "/dashboard/orders",
    icon: ShoppingBag,
    isDynamic: true,
    categoryLabel: "Order type",
    inverse: false,
    categories: [
      "Mini Order",
      "Subscription Order",
      "Corporate Order",
      "Adhoc Sale",
      "Special Order",
    ],
  },
  {
    id: "customers",
    label: "Customers",
    title: "Customer Analytics",
    blurb: "New customer acquisitions, by source.",
    metric: "New customers",
    prefix: "",
    hue: "#7C3AED",
    darkHue: "#A78BFA",
    managePath: "/dashboard/customer",
    icon: Users,
    isDynamic: false,
    categoryLabel: "Source",
    inverse: false,
    dailyBase: 32,
    categories: ["App", "Website", "Referral", "Corporate"],
  },
];

const sum = (arr = []) => arr.reduce((t, v) => t + (Number(v) || 0), 0);

const fmt = (v, pre = "") => {
  const value = Number(v) || 0;
  return pre + Math.round(value).toLocaleString("en-IN");
};

const pct = (part, whole, digits = 0) =>
  whole ? ((part / whole) * 100).toFixed(digits) : "0";

const truncateLabel = (str = "", max = 12) =>
  str.length > max ? `${str.slice(0, max - 1)}…` : str;

/* Deterministic mock data for tabs that have no API yet. */
const getStaticSeries = (tab, filters) => {
  let labels, mults, per;

  if (filters.year == null) {
    labels = YEARS.slice().reverse().map(String);
    mults = labels.map(() => 365);
    per = "year";
  } else if (filters.month == null) {
    labels = SHORT_MONTHS;
    mults = MONTHS.map((_, m) => daysIn(filters.year, m));
    per = "month";
  } else if (filters.week == null) {
    const n = weeksIn(filters.year, filters.month);
    labels = Array.from({ length: n }, (_, w) => `Week ${w + 1}`);
    mults = labels.map((_, w) => {
      const [a, b] = weekRange(filters.year, filters.month, w);
      return b - a + 1;
    });
    per = "week";
  } else {
    const [a, b] = weekRange(filters.year, filters.month, filters.week);
    labels = Array.from(
      { length: b - a + 1 },
      (_, i) => `${a + i} ${SHORT_MONTHS[filters.month]}`,
    );
    mults = labels.map(() => 1);
    per = "day";
  }

  let seed = 11;
  for (const ch of tab.id + JSON.stringify(filters)) {
    seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
  }
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const cats = tab.categories || [];
  const weights = [5, 3.5, 2.5, 1.8, 1.2].slice(0, cats.length);
  const totalWeight = sum(weights) || 1;

  const rows = cats.map((name, idx) => {
    const cur = labels.map((_, j) =>
      Math.round(
        (tab.dailyBase || 100) *
          mults[j] *
          (weights[idx] / totalWeight) *
          (1 + j * 0.02) *
          (0.85 + rand() * 0.3),
      ),
    );
    const prev = cur.map((v) => Math.round(v * (0.78 + rand() * 0.2)));
    return { name, cur, prev };
  });

  return { labels, per, rows };
};

/* ============================================================
   2. DATA HOOK  (all derived numbers live here, not in JSX)
   ============================================================ */

const useAnalyticsData = (activeTab) => {
  // Hooks must be called unconditionally.
  const productStore = productSaleStore();
  const expenseStore = expenseAnalyticsStore();
  const orderStore = orderAnalyticsStore();
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";

  const tab = useMemo(
    () => TABS.find((t) => t.id === activeTab) || TABS[0],
    [activeTab],
  );
  const tabHue = isDark ? tab.darkHue || tab.hue : tab.hue;
  const storeMap = {
    product: productStore,
    expenses: expenseStore,
    orders: orderStore,
  };
  const fetchMap = {
    product: productStore.getProductAnalytics,
    expenses: expenseStore.getExpenseAnalytics,
    orders: orderStore.getOrderAnalytics,
  };
  const store = storeMap[activeTab] || productStore;
  const fetchData = fetchMap[activeTab] || productStore.getProductAnalytics;

  const {
    filters,
    selectedCategory,
    compare,
    status,
    setFilters,
    setSelectedCategory,
    setCompare,
    resetFilters,
  } = store;

  useEffect(() => {
    if (tab.isDynamic) fetchData().catch(() => {});
  }, [tab.id, tab.isDynamic, fetchData]);

  const source = useMemo(() => {
    if (tab.isDynamic) {
      return {
        labels: store.labels || [],
        per: store.per || "month",
        rows: store.rows || [],
        loading: Boolean(store.loading),
      };
    }
    return { ...getStaticSeries(tab, filters), loading: false };
  }, [tab, filters, store.labels, store.per, store.rows, store.loading]);

  const { labels, per, loading } = source;

  // Color is assigned ONCE from API order, so every widget agrees on it.
  const rows = useMemo(
    () =>
      source.rows.map((r, i) => ({
        ...r,
        name: r.name || r.key || "Unknown",
        color: getCategoryColor(i, isDark),
      })),
    [source.rows, isDark],
  );

  const table = useMemo(
    () =>
      rows
        .map((r) => {
          const total = sum(r.cur);
          const prevTotal = sum(r.prev);
          return {
            ...r,
            total,
            prevTotal,
            g: prevTotal ? (total / prevTotal - 1) * 100 : 0,
          };
        })
        .sort((a, b) => b.total - a.total),
    [rows],
  );

  const chartTheme = useMemo(
    () =>
      isDark
        ? {
            grid: "#1E293B",
            tick: "#94A3B8",
            prev: "#475569",
            surfaceBorder: "#0F172A",
            barCursor: "#1E293B",
            refLine: "#334155",
            calloutText: "#E2E8F0",
            cursorLine: "#64748B",
          }
        : {
            grid: "#EEF0F3",
            tick: "#64748B",
            prev: "#CBD5E1",
            surfaceBorder: "#FFFFFF",
            barCursor: "#F1F5F9",
            refLine: "#CBD5E1",
            calloutText: "#334155",
            cursorLine: "#94A3B8",
          },
    [isDark],
  );

  const derived = useMemo(() => {
    const selectedRows = selectedCategory
      ? rows.filter((r) => r.name === selectedCategory)
      : rows;
    const pick = (key) =>
      labels.map((_, i) => sum(selectedRows.map((r) => r[key]?.[i] ?? 0)));

    const cur = pick("cur");
    const prev = pick("prev");
    const total = sum(cur);
    const previousTotal = sum(prev);
    const peak = cur.length ? cur.indexOf(Math.max(...cur)) : 0;
    const grand = sum(rows.map((r) => sum(r.cur)));

    return {
      cur,
      prev,
      total,
      previousTotal,
      grand,
      peak,
      growth: previousTotal ? (total / previousTotal - 1) * 100 : 0,
      selectedColor:
        rows.find((r) => r.name === selectedCategory)?.color ?? tabHue,
      trend: labels.map((l, i) => ({
        l,
        cur: cur[i] ?? 0,
        prev: prev[i] ?? 0,
      })),
      stack: labels.map((l, i) => ({
        l,
        ...Object.fromEntries(rows.map((r) => [r.name, r.cur?.[i] ?? 0])),
      })),
      pieData: table
        .filter((r) => r.total > 0)
        .map((r) => ({
          name: r.name,
          value: r.total,
          prevValue: r.prevTotal,
          color: r.color,
          share: Number(pct(r.total, grand, 1)),
          growth: r.g,
        })),
    };
  }, [rows, table, labels, selectedCategory, tabHue]);

  return {
    tab,
    tabHue,
    isDark,
    chartTheme,
    labels,
    per,
    rows,
    table,
    loading,
    status,
    fetchData,
    filters,
    selectedCategory,
    compare,
    setFilters,
    setSelectedCategory,
    setCompare,
    resetFilters,
    ...derived,
  };
};

/* ============================================================
   3. SMALL UI PIECES
   ============================================================ */

const getAxisProps = (tickColor) => ({
  tick: { fill: tickColor, fontSize: 10.5 },
  axisLine: false,
  tickLine: false,
});

const ChartTooltip = ({ active, payload, label, pre = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#0F172A]/95 px-3 py-2 text-[11px] text-white shadow-xl backdrop-blur-sm">
      {label && (
        <p className="mb-1.5 border-b border-white/10 pb-1 font-semibold text-slate-300">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((p) => (
          <div
            key={`${p.dataKey}-${p.name}`}
            className="flex items-center justify-between gap-5"
          >
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <i
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: p.stroke || p.color || p.fill }}
              />
              <span className="max-w-[140px] truncate">{p.name}</span>
            </span>
            <span className="font-bold tabular-nums text-white">
              {pre}
              {Math.round(Number(p.value) || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload, pre = "" }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#0F172A]/95 px-3 py-2 text-[11px] text-white shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 font-semibold">
        <i
          className="h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ background: item.color }}
        />
        <span>{item.name}</span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-4 tabular-nums">
        <span className="text-[13px] font-extrabold text-white">
          {pre}
          {Math.round(Number(item.value) || 0).toLocaleString("en-IN")}
        </span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-200">
          {item.share}% share
        </span>
      </div>
    </div>
  );
};

/** `inverse` flips the colors for metrics where "up" is bad (e.g. expenses). */
const Delta = ({ v, inverse = false }) => {
  const up = v >= 0;
  const good = inverse ? !up : up;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
        good
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
      }`}
    >
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(v).toFixed(1)}%
    </span>
  );
};

const Spark = ({ values = [], color }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 52 + 2;
      const y = 16 - ((v - min) / (max - min || 1)) * 14;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="56" height="18" aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Panel = ({
  title,
  sub,
  icon: Icon,
  accent,
  right,
  className = "",
  children,
}) => (
  <section
    className={`flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.03)] transition-all hover:shadow-[0_8px_24px_-8px_rgba(16,24,40,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.5)] sm:p-5 ${className}`}
  >
    <header className="mb-3.5 flex shrink-0 flex-wrap items-start justify-between gap-2.5">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${accent || "#2563EB"}18`,
              color: accent || "#2563EB",
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold tracking-tight text-[#101828] dark:text-slate-100">
            {title}
          </h3>
          {sub && (
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {sub}
            </p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
    {children}
  </section>
);

const Select = ({ label, value, onChange, disabled, children }) => (
  <label
    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] transition-colors focus-within:border-slate-900 focus-within:bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:border-slate-500 dark:focus-within:bg-slate-800 dark:hover:border-slate-600 ${
      disabled ? "pointer-events-none opacity-45" : ""
    }`}
  >
    <span className="font-medium text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="cursor-pointer bg-transparent font-bold text-[#101828] outline-none dark:text-slate-100 dark:[color-scheme:dark]"
    >
      {children}
    </select>
  </label>
);

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
  />
);

const EmptyChart = ({ message = "No data available for this period." }) => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-300">
      {message}
    </p>
    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
      Try selecting a wider year or month range.
    </p>
  </div>
);

/* ============================================================
   4. CATEGORY DROPDOWN
   ============================================================ */

const CategoryDropdown = ({
  label,
  items,
  grand,
  prefix = "",
  hue,
  isDark = false,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const MENU_WIDTH = 288; // w-72

  const updatePosition = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxLeft =
      window.innerWidth - Math.min(MENU_WIDTH, window.innerWidth - 32) - 16;
    setPos({
      top: r.bottom + 6,
      left: Math.max(16, Math.min(r.left, maxLeft)),
    });
  };

  // Position before paint so the menu never flashes in the wrong place.
  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    // capture = true so scrolling the filter bar (or any parent) re-anchors the menu
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = items.find((i) => i.name === value);
  const activeColor = active?.color ?? hue;

  const choose = (name) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold text-[#101828] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-100 dark:focus-visible:outline-slate-300"
        style={{
          background: value
            ? `${activeColor}${isDark ? "22" : "12"}`
            : isDark
              ? "#1E293B"
              : "#F8FAFC",
          borderColor: value
            ? `${activeColor}${isDark ? "80" : "70"}`
            : isDark
              ? "#334155"
              : "#E6E8EC",
        }}
      >
        <Layers size={14} style={{ color: activeColor }} />
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {label}:
        </span>
        <span className="flex items-center gap-1.5">
          {value && (
            <i
              className="h-2 w-2 rounded-full"
              style={{ background: activeColor }}
            />
          )}
          {value ?? "All"}
        </span>
        <ChevronDown
          size={14}
          className={`ml-0.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className="z-[100] w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#E6E8EC] bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* "All" row stays pinned, outside the scroll area */}
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => choose(null)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-bold ${
                value === null
                  ? "bg-slate-100 text-[#101828] dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
              }`}
            >
              <span>All ({items.length})</span>
              <span className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {fmt(grand, prefix)}
                {value === null && <Check size={14} style={{ color: hue }} />}
              </span>
            </button>

            <div
              className="my-1 border-t border-slate-100 dark:border-slate-800"
              aria-hidden
            />

            {/* Scrolls after 5 items */}
            <ul
              role="listbox"
              aria-label={`Filter by ${label}`}
              className="max-h-[188px] overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {items.map((item) => {
                const selected = value === item.name;
                return (
                  <li key={item.name} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => choose(item.name)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                        selected
                          ? "font-bold text-[#101828] dark:text-slate-100"
                          : "font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
                      }`}
                      style={
                        selected
                          ? {
                              background: `${item.color}${isDark ? "22" : "12"}`,
                            }
                          : undefined
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <i
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="ml-2 flex shrink-0 items-center gap-2 text-[11px] tabular-nums">
                        <span className="font-bold text-[#101828] dark:text-slate-100">
                          {fmt(item.total, prefix)}
                        </span>
                        <span className="w-8 text-right text-slate-400 dark:text-slate-500">
                          {pct(item.total, grand)}%
                        </span>
                        <span className="w-3.5">
                          {selected && (
                            <Check size={14} style={{ color: item.color }} />
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};
/* ============================================================
   5. SECTIONS
   ============================================================ */

const ManageButton = ({ className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 cursor-pointer items-center gap-0.5 rounded-xl border border-[#E6E8EC] bg-white px-3 py-1.5 text-[12px] font-bold text-[#101828] transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700/80 ${className}`}
  >
    Manage <ChevronRight size={13} />
  </button>
);

const FilterBar = ({ d }) => {
  const navigate = useNavigate();
  const {
    tab,
    tabHue,
    isDark,
    filters,
    setFilters,
    compare,
    setCompare,
    selectedCategory,
    setSelectedCategory,
    resetFilters,
    loading,
  } = d;

  const accent = d.selectedColor || tabHue || "#2563EB";
  const thumbColor = isDark ? `${accent}88` : `${accent}66`;
  const thumbHoverColor = accent;
  const trackColor = isDark
    ? "rgba(30, 41, 59, 0.55)"
    : "rgba(241, 245, 249, 0.9)";

  const previousPeriod =
    filters.year == null ? "prev yr" : `${filters.year - 1}`;
  const num = (v) => (v === "all" ? null : Number(v));

  const when = [
    filters.year ?? "All years",
    filters.month != null && MONTHS[filters.month],
    filters.week != null && `W${filters.week + 1}`,
  ]
    .filter(Boolean)
    .join(" › ");

  const hasActiveFilters =
    selectedCategory !== null ||
    filters.year !== YEAR ||
    filters.month !== null ||
    filters.week !== null;

  return (
    <div className="relative w-full min-w-0 overflow-visible">
      <div
        style={{
          "--sb-thumb": thumbColor,
          "--sb-thumb-hover": thumbHoverColor,
          "--sb-track": trackColor,
          scrollbarWidth: "thin",
          scrollbarColor: `${thumbColor} ${trackColor}`,
        }}
        className="
        flex w-full min-w-0 flex-nowrap items-center justify-between gap-2
        overflow-x-auto overflow-y-hidden
        pb-1 rounded-xl border border-slate-200/80
        bg-white px-3 pt-1.5
        shadow-[0_1px_2px_rgba(16,24,40,0.03)]
        scroll-smooth
        [&::-webkit-scrollbar]:h-1.5
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-track]:bg-[var(--sb-track)]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-[var(--sb-thumb)]
        hover:[&::-webkit-scrollbar-thumb]:bg-[var(--sb-thumb-hover)]
        dark:border-slate-800 dark:bg-slate-900
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]
      "
      >
        {/* Left: Title & active status pills in a single flex row */}
        <div className="flex shrink-0 items-center gap-1.5">
          <h1
            title={tab.blurb}
            className="whitespace-nowrap text-[14px] font-extrabold tracking-tight text-[#101828] dark:text-slate-100"
          >
            {tab.title}
          </h1>

          <span className="whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {when}
          </span>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              title="Clear category filter"
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: `${d.selectedColor}${isDark ? "24" : "15"}`,
                color: d.selectedColor,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: d.selectedColor }}
              />
              {selectedCategory}
              <X size={10} />
            </button>
          )}

          {loading && (
            <span
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                background: `${tabHue}${isDark ? "24" : "15"}`,
                color: tabHue,
              }}
            >
              <RefreshCw size={10} className="animate-spin" /> Syncing
            </span>
          )}
        </div>

        {/* Right: All controls in one strict non-wrapping flex row */}
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
          <CategoryDropdown
            label={tab.categoryLabel}
            items={d.table}
            grand={d.grand}
            prefix={tab.prefix}
            hue={tabHue}
            isDark={isDark}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />

          <span className="h-4 w-px shrink-0 bg-[#E6E8EC] dark:bg-slate-800" />

          <Select
            label="Year"
            value={filters.year ?? "all"}
            onChange={(e) => {
              const year = num(e.target.value);
              setFilters({
                year,
                month: year == null ? null : filters.month,
                week: null,
              });
            }}
          >
            <option
              value="all"
              className="dark:bg-slate-900 dark:text-slate-100"
            >
              All years
            </option>
            {YEARS.map((y) => (
              <option
                key={y}
                value={y}
                className="dark:bg-slate-900 dark:text-slate-100"
              >
                {y}
              </option>
            ))}
          </Select>

          <Select
            label="Month"
            value={filters.month ?? "all"}
            disabled={filters.year == null}
            onChange={(e) =>
              setFilters({ ...filters, month: num(e.target.value), week: null })
            }
          >
            <option
              value="all"
              className="dark:bg-slate-900 dark:text-slate-100"
            >
              All months
            </option>
            {MONTHS.map((m, i) => (
              <option
                key={m}
                value={i}
                className="dark:bg-slate-900 dark:text-slate-100"
              >
                {m}
              </option>
            ))}
          </Select>

          <Select
            label="Week"
            value={filters.week ?? "all"}
            disabled={filters.month == null}
            onChange={(e) =>
              setFilters({ ...filters, week: num(e.target.value) })
            }
          >
            <option
              value="all"
              className="dark:bg-slate-900 dark:text-slate-100"
            >
              All weeks
            </option>
            {filters.month != null &&
              Array.from(
                { length: weeksIn(filters.year, filters.month) },
                (_, w) => {
                  const [s, e] = weekRange(filters.year, filters.month, w);
                  return (
                    <option
                      key={w}
                      value={w}
                      className="dark:bg-slate-900 dark:text-slate-100"
                    >
                      W{w + 1} ({s}–{e})
                    </option>
                  );
                },
              )}
          </Select>

          <button
            type="button"
            role="switch"
            aria-checked={compare}
            onClick={() => setCompare(!compare)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600"
          >
            <span
              className="relative h-3.5 w-6 rounded-full transition-colors"
              style={{
                background: compare
                  ? d.selectedColor
                  : isDark
                    ? "#475569"
                    : "#CBD5E1",
              }}
            >
              <i
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${compare ? "left-3" : "left-0.5"}`}
              />
            </span>
            vs {previousPeriod}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#101828] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}

          <ManageButton
            className="flex shrink-0"
            onClick={() => navigate(tab.managePath)}
          />
        </div>
      </div>
    </div>
  );
};

const KpiCards = ({ d }) => {
  const {
    tab,
    tabHue,
    isDark,
    selectedCategory,
    total,
    growth,
    labels,
    per,
    cur,
    peak,
    grand,
    table,
    filters,
    selectedColor,
    loading,
  } = d;
  const metricLower = tab.metric.toLowerCase();
  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;

  const kpis = [
    {
      key: selectedCategory
        ? `${selectedCategory} ${metricLower}`
        : `Total ${metricLower}`,
      value: fmt(total, tab.prefix),
      delta: <Delta v={growth} inverse={tab.inverse} />,
      note: `vs ${previousPeriod}`,
      icon: TrendingUp,
      accent: selectedColor,
    },
    {
      key: `Average per ${per}`,
      value: fmt(labels.length ? total / labels.length : 0, tab.prefix),
      note: `Across ${labels.length || 0} ${per}${labels.length === 1 ? "" : "s"}`,
      icon: Calendar,
      accent: isDark ? "#94A3B8" : "#475569",
    },
    {
      key: "Peak performance",
      value: fmt(cur[peak] ?? 0, tab.prefix),
      note: labels[peak] ? `Best in ${labels[peak]}` : "–",
      icon: Award,
      accent: isDark ? "#FBBF24" : "#D97706",
    },
    selectedCategory
      ? {
          key: "Share of total",
          value: `${pct(total, grand, 1)}%`,
          note: `of all ${tab.label.toLowerCase()}`,
          shareBar: Number(pct(total, grand, 1)),
          icon: PieChartIcon,
          accent: selectedColor,
        }
      : {
          key: `Top ${tab.categoryLabel.toLowerCase()}`,
          value: table[0]?.name || "–",
          note: `${table[0] ? pct(table[0].total, grand) : 0}% of total`,
          shareBar: table[0] ? Number(pct(table[0].total, grand, 1)) : 0,
          icon: Layers,
          accent: table[0]?.color || tabHue,
        },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k, i) => {
        const Icon = k.icon;
        return (
          <div
            key={k.key}
            className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_6px_18px_-6px_rgba(16,24,40,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] dark:hover:border-slate-700/90 dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)]"
            style={
              i === 0
                ? {
                    backgroundImage: `radial-gradient(200px 70px at 0% 0%, ${selectedColor}${isDark ? "28" : "18"}, transparent)`,
                    borderColor: `${selectedColor}${isDark ? "55" : "38"}`,
                  }
                : undefined
            }
          >
            {/* Subtle top accent hairline on hover */}
            <span
              className="pointer-events-none absolute inset-x-2.5 top-0 h-[1.5px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${k.accent}, transparent)`,
              }}
            />

            <div>
              <div className="flex items-center justify-between gap-1.5">
                <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.04em] text-slate-500/90 dark:text-slate-400">
                  {k.key}
                </p>
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded ring-1 ring-inset transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${k.accent}14`,
                    color: k.accent,
                    boxShadow: `inset 0 0 0 1px ${k.accent}24`,
                  }}
                >
                  <Icon size={10} strokeWidth={2.25} />
                </span>
              </div>

              {loading && !k.value ? (
                <Skeleton className="mt-1 h-4 w-20" />
              ) : (
                <div className="mt-0.5 flex flex-wrap items-baseline gap-1">
                  <p
                    className={`truncate font-bold leading-tight tracking-tight text-[#101828] tabular-nums dark:text-slate-100 ${
                      i === 0
                        ? "text-[15px] sm:text-[16px]"
                        : "text-[14px] sm:text-[15px]"
                    }`}
                  >
                    {k.value}
                  </p>
                  {k.delta && (
                    <span className="origin-left scale-85">{k.delta}</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-1">
              {k.shareBar != null && (
                <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/90">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, k.shareBar))}%`,
                      backgroundColor: k.accent,
                    }}
                  />
                </div>
              )}

              {k.note && (
                <p className="truncate text-[9.5px] font-normal leading-tight text-slate-400 dark:text-slate-500">
                  {k.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Chart 1: Area Trend ---------- */
const TrendPanel = ({ d }) => {
  const {
    tab,
    chartTheme,
    selectedCategory,
    selectedColor,
    compare,
    filters,
    per,
    trend,
    loading,
  } = d;
  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;
  const prefixName = selectedCategory ? `${selectedCategory} ` : "";
  const axisProps = getAxisProps(chartTheme.tick);

  return (
    <Panel
      className="lg:col-span-8"
      icon={TrendingUp}
      accent={selectedColor}
      title={
        compare
          ? `${prefixName}${tab.metric} trend: ${filters.year ?? "all years"} vs ${previousPeriod}`
          : `${prefixName}${tab.metric} over time`
      }
      sub={`Area trajectory · one point per ${per}`}
      right={
        compare && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <i
                className="h-2 w-2 rounded-full"
                style={{ background: selectedColor }}
              />
              {filters.year ?? "Current"}
            </span>
            <span className="flex items-center gap-1.5">
              <i
                className="h-2 w-2 rounded-full"
                style={{ background: chartTheme.prev }}
              />
              {previousPeriod}
            </span>
          </div>
        )
      }
    >
      <div className="h-[260px] w-full min-w-0">
        {loading && trend.length === 0 ? (
          <Skeleton className="h-full w-full" />
        ) : trend.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`g-${tab.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={selectedColor}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={selectedColor}
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke={chartTheme.grid}
                strokeDasharray="3 3"
              />
              <XAxis dataKey="l" {...axisProps} minTickGap={18} />
              <YAxis {...axisProps} width={64} tickFormatter={(v) => fmt(v, tab.prefix)} />
              <Tooltip
                wrapperStyle={{ zIndex: 20 }}
                content={<ChartTooltip pre={tab.prefix} />}
                cursor={{ stroke: selectedColor, strokeDasharray: 4 }}
              />
              {compare && (
                <Area
                  name={previousPeriod}
                  type="monotone"
                  dataKey="prev"
                  stroke={chartTheme.prev}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  fill="none"
                />
              )}
              <Area
                name={selectedCategory ?? tab.metric}
                type="monotone"
                dataKey="cur"
                stroke={selectedColor}
                strokeWidth={2.5}
                fill={`url(#g-${tab.id})`}
                activeDot={{
                  r: 5,
                  stroke: chartTheme.surfaceBorder,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
};

/* ---------- Chart 2: Pie / Donut Share Chart ---------- */
const CategoryPiePanel = ({ d }) => {
  const {
    tab,
    tabHue,
    chartTheme,
    pieData,
    grand,
    selectedCategory,
    setSelectedCategory,
    loading,
  } = d;

  const activeSlice = useMemo(
    () => pieData.find((p) => p.name === selectedCategory) ?? null,
    [pieData, selectedCategory],
  );

  const handleSliceToggle = (entry) => {
    const name = entry?.name ?? entry?.payload?.name;
    if (!name) return;
    setSelectedCategory(selectedCategory === name ? null : name);
  };

  return (
    <Panel
      className="lg:col-span-4"
      icon={PieChartIcon}
      accent={activeSlice?.color ?? tabHue}
      title={`${tab.categoryLabel} share`}
      sub={
        selectedCategory
          ? `${selectedCategory} highlighted · click slice to clear`
          : "Click any slice to filter dashboard"
      }
    >
      {loading && pieData.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center gap-3">
          <Skeleton className="h-40 w-40 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      ) : pieData.length === 0 ? (
        <div className="h-[260px]">
          <EmptyChart message={`No ${tab.categoryLabel.toLowerCase()} data.`} />
        </div>
      ) : (
        <div className="flex h-[260px] flex-col justify-between">
          {/* Donut Chart + Center Readout */}
          <div className="relative h-[180px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  wrapperStyle={{ zIndex: 20 }}
                  content={<PieTooltip pre={tab.prefix} />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="64%"
                  outerRadius="90%"
                  paddingAngle={pieData.length > 1 ? 2.5 : 0}
                  cornerRadius={5}
                  stroke={chartTheme.surfaceBorder}
                  strokeWidth={2}
                  onClick={handleSliceToggle}
                  className="cursor-pointer outline-none"
                >
                  {pieData.map((entry) => {
                    const dim =
                      selectedCategory && selectedCategory !== entry.name;
                    return (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        fillOpacity={dim ? 0.22 : 1}
                        className="cursor-pointer transition-opacity duration-200"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
              <span className="max-w-[96px] truncate text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-400">
                {activeSlice ? activeSlice.name : "Total"}
              </span>
              <span className="mt-0.5 max-w-[100px] truncate text-[15px] font-extrabold leading-tight tracking-tight text-[#101828] tabular-nums dark:text-slate-100">
                {activeSlice
                  ? `${activeSlice.share}%`
                  : fmt(grand, tab.prefix)}
              </span>
              <span className="max-w-[96px] truncate text-[10px] font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                {activeSlice
                  ? fmt(activeSlice.value, tab.prefix)
                  : `${pieData.length} ${pieData.length === 1 ? "item" : "items"}`}
              </span>
            </div>
          </div>

          {/* Interactive Legend */}
          <ul className="flex max-h-[72px] flex-wrap items-center justify-center gap-1.5 overflow-y-auto pt-1">
            {pieData.map((entry) => {
              const selected = selectedCategory === entry.name;
              const dim = selectedCategory && !selected;
              return (
                <li key={entry.name}>
                  <button
                    type="button"
                    onClick={() => handleSliceToggle(entry)}
                    aria-pressed={selected}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-[10.5px] font-semibold transition-all ${
                      selected
                        ? "border-slate-300 bg-slate-50 text-[#101828] shadow-2xs dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        : dim
                          ? "border-transparent bg-slate-50/70 text-slate-400 opacity-55 hover:opacity-100 dark:bg-slate-800/40 dark:text-slate-500"
                          : "border-slate-100 bg-slate-50/80 text-slate-700 hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <i
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="max-w-[90px] truncate">{entry.name}</span>
                    <span className="font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {entry.share}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
};

/* ---------- Chart 3: Bar Comparison Chart ---------- */
const CategoryBarPanel = ({ d }) => {
  const {
    tab,
    chartTheme,
    table,
    trend,
    compare,
    filters,
    per,
    selectedCategory,
    setSelectedCategory,
    selectedColor,
    loading,
  } = d;

  const [mode, setMode] = useState("category"); // "category" | "period"
  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;
  const axisProps = getAxisProps(chartTheme.tick);

  const categoryBars = useMemo(
    () =>
      table.slice(0, 8).map((r) => ({
        name: r.name,
        shortName: truncateLabel(r.name, 11),
        cur: r.total,
        prev: r.prevTotal,
        color: r.color,
      })),
    [table],
  );

  const isCategoryMode = mode === "category";
  const barData = isCategoryMode ? categoryBars : trend;

  const handleBarClick = (entry) => {
    if (!isCategoryMode) return;
    const name = entry?.name ?? entry?.payload?.name;
    if (!name) return;
    setSelectedCategory(selectedCategory === name ? null : name);
  };

  return (
    <Panel
      className="lg:col-span-6"
      icon={BarChart3}
      accent={selectedColor}
      title={
        isCategoryMode
          ? `${tab.metric} by ${tab.categoryLabel.toLowerCase()}`
          : `${selectedCategory ? `${selectedCategory} ` : ""}${tab.metric} by ${per}`
      }
      sub={
        isCategoryMode
          ? `${table.length > 8 ? "Top 8 items · " : ""}Click a bar to filter${compare ? ` · vs ${previousPeriod}` : ""}`
          : `Bar comparison per ${per}${compare ? ` · vs ${previousPeriod}` : ""}`
      }
      right={
        <div
          role="group"
          aria-label="Bar chart mode"
          className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800"
        >
          <button
            type="button"
            onClick={() => setMode("category")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 transition-all ${
              isCategoryMode
                ? "bg-white font-bold text-[#101828] shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            By {tab.categoryLabel}
          </button>
          <button
            type="button"
            onClick={() => setMode("period")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 transition-all ${
              !isCategoryMode
                ? "bg-white font-bold text-[#101828] shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            By {per}
          </button>
        </div>
      }
    >
      <div className="h-[270px] w-full min-w-0">
        {loading && barData.length === 0 ? (
          <Skeleton className="h-full w-full" />
        ) : barData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ left: 0, right: 8, top: 10, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                vertical={false}
                stroke={chartTheme.grid}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey={isCategoryMode ? "shortName" : "l"}
                {...axisProps}
                interval={isCategoryMode ? 0 : "preserveStartEnd"}
                minTickGap={12}
              />
              <YAxis {...axisProps} width={64} tickFormatter={(v) => fmt(v, tab.prefix)} />
              <Tooltip
                wrapperStyle={{ zIndex: 20 }}
                cursor={{ fill: chartTheme.barCursor, radius: 6 }}
                content={<ChartTooltip pre={tab.prefix} />}
                labelFormatter={(_, items) =>
                  items?.[0]?.payload?.name || items?.[0]?.payload?.l || ""
                }
              />
              {compare && (
                <Bar
                  name={previousPeriod}
                  dataKey="prev"
                  fill={chartTheme.prev}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={24}
                />
              )}
              <Bar
                name={
                  isCategoryMode
                    ? filters.year != null
                      ? String(filters.year)
                      : "Current"
                    : selectedCategory ?? tab.metric
                }
                dataKey="cur"
                fill={selectedColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
                onClick={handleBarClick}
                className={isCategoryMode ? "cursor-pointer" : undefined}
              >
                {isCategoryMode &&
                  barData.map((entry) => {
                    const dim =
                      selectedCategory && selectedCategory !== entry.name;
                    return (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        fillOpacity={dim ? 0.22 : 1}
                        className="cursor-pointer"
                      />
                    );
                  })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
};

/* ---------- Chart 4: Multi-Category Line Trajectory ---------- */
const CategoryLinesPanel = ({ d }) => {
  const {
    tab,
    tabHue,
    chartTheme,
    rows,
    table,
    labels,
    stack,
    filters,
    selectedCategory,
    setSelectedCategory,
    loading,
  } = d;
  const axisProps = getAxisProps(chartTheme.tick);

  const when = [
    filters.year ?? "All years",
    filters.month != null && MONTHS[filters.month],
    filters.week != null && `Week ${filters.week + 1}`,
  ]
    .filter(Boolean)
    .join(" › ");

  // Which point gets a peak label on which line.
  const callouts = useMemo(() => {
    const names = selectedCategory
      ? [selectedCategory]
      : table.slice(0, 2).map((r) => r.name);

    return Object.fromEntries(
      names.map((name) => {
        const values = rows.find((r) => r.name === name)?.cur ?? [];
        return [name, values.length ? values.indexOf(Math.max(...values)) : -1];
      }),
    );
  }, [rows, table, selectedCategory]);

  const renderCallout =
    (name, color) =>
    ({ x, y, index, value }) => {
      if (callouts[name] !== index || !value) return null;

      const nearEnd = index >= labels.length - 2;

      const text = `${labels[index]}${
        filters.year != null && filters.month == null ? ` ${filters.year}` : ""
      }, ${fmt(value, tab.prefix)}`;

      return (
        <g key={`${name}-${index}`}>
          <circle
            cx={x}
            cy={y}
            r={5}
            fill={color}
            stroke={chartTheme.surfaceBorder}
            strokeWidth={2}
          />
          <text
            x={nearEnd ? x - 10 : x + 10}
            y={nearEnd ? y - 10 : y + 4}
            textAnchor={nearEnd ? "end" : "start"}
            fill={chartTheme.calloutText}
            fontSize={10.5}
            fontWeight={700}
          >
            {text}
          </text>
        </g>
      );
    };

  return (
    <Panel
      className="lg:col-span-6"
      icon={Activity}
      accent={tabHue}
      title={`${tab.metric} trajectory by ${tab.categoryLabel.toLowerCase()}`}
      sub={`Multi-line trend · ${when}`}
    >
      {/* Category Legend */}
      {rows.length > 0 && (
        <ul className="mb-2 flex max-h-[54px] flex-wrap items-center gap-x-3.5 gap-y-1.5 overflow-y-auto">
          {rows.map((row) => {
            const dim = selectedCategory && selectedCategory !== row.name;

            return (
              <li key={row.name}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === row.name ? null : row.name,
                    )
                  }
                  aria-pressed={selectedCategory === row.name}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    dim ? "opacity-35" : "opacity-100"
                  }`}
                >
                  <i
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: row.color }}
                  />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {row.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Chart */}
      <div className="h-[225px] w-full min-w-0 flex-1">
        {loading && stack.length === 0 ? (
          <Skeleton className="h-full w-full" />
        ) : stack.length === 0 || rows.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stack}
              margin={{ left: 0, right: 16, top: 24, bottom: 0 }}
            >
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />

              <XAxis dataKey="l" {...axisProps} minTickGap={18} />

              <YAxis {...axisProps} width={64} tickFormatter={(v) => fmt(v, tab.prefix)} />

              <ReferenceLine y={0} stroke={chartTheme.refLine} />

              <Tooltip
                wrapperStyle={{ zIndex: 20 }}
                content={<ChartTooltip pre={tab.prefix} />}
                cursor={{
                  stroke: chartTheme.cursorLine,
                  strokeDasharray: 4,
                }}
              />

              {rows.map((row) => {
                const dim = selectedCategory && selectedCategory !== row.name;

                return (
                  <Line
                    key={row.name}
                    type="monotone"
                    dataKey={row.name}
                    name={row.name}
                    stroke={row.color}
                    strokeWidth={selectedCategory === row.name ? 3 : 2.25}
                    strokeOpacity={dim ? 0.18 : 1}
                    dot={{
                      r: 2.5,
                      fill: row.color,
                      stroke: row.color,
                      fillOpacity: dim ? 0.18 : 1,
                    }}
                    activeDot={{
                      r: 5,
                      stroke: chartTheme.surfaceBorder,
                      strokeWidth: 2,
                    }}
                    label={renderCallout(row.name, row.color)}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
};

/* ---------- Section 5: Category Performance Breakdown ---------- */
/* ---------- Section 5: Category Performance Breakdown ---------- */
const CategoryList = ({ d }) => {
  const {
    tab,
    tabHue,
    isDark,
    table,
    grand,
    loading,
    selectedCategory,
    setSelectedCategory,
  } = d;
  const maxTotal = table[0]?.total || 1;

  return (
    <Panel
      className="lg:col-span-12"
      icon={Layers}
      accent={tabHue}
      title={`${tab.categoryLabel}-wise ${tab.metric.toLowerCase()}`}
      sub={`${table.length} ${table.length === 1 ? "item" : "items"} · Select any card to focus every chart`}
      right={
        selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#101828] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X size={12} /> Show all
          </button>
        )
      }
    >
      {loading && table.length === 0 ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : table.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-slate-400 dark:text-slate-500">
          Nothing recorded for this period. Try a wider date range.
        </p>
      ) : (
        <div className="max-h-[268px] overflow-y-auto pr-1 md:max-h-[130px] [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-track]:bg-transparent">
          <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {table.map((row, idx) => {
              const selected = selectedCategory === row.name;
              const dim = selectedCategory && !selected;
              const share = pct(row.total, grand, 1);

              return (
                <li key={row.name}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory(selected ? null : row.name)
                    }
                    aria-pressed={selected}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 dark:focus-visible:outline-slate-300 ${
                      selected
                        ? "border-transparent"
                        : dim
                          ? "border-slate-100 bg-slate-50/50 opacity-60 hover:opacity-100 dark:border-slate-800/60 dark:bg-slate-900/30"
                          : "border-slate-200/75 bg-white hover:border-slate-300 hover:bg-[#F8FAFC] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                    }`}
                    style={
                      selected
                        ? {
                            background: `${row.color}${isDark ? "20" : "10"}`,
                            boxShadow: `inset 0 0 0 1.5px ${row.color}`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white dark:text-slate-950"
                      style={{ background: row.color }}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12.5px] font-bold text-[#101828] dark:text-slate-100">
                          {row.name}
                        </p>
                        <span className="shrink-0 text-[10.5px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                          {share}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(row.total / maxTotal) * 100}%`,
                            background: row.color,
                          }}
                        />
                      </div>
                    </div>

                    <Spark values={row.cur} color={row.color} />

                    <div className="min-w-[76px] shrink-0 text-right">
                      <p className="text-[12.5px] font-extrabold tabular-nums text-[#101828] dark:text-slate-100">
                        {fmt(row.total, tab.prefix)}
                      </p>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <Delta v={row.g} inverse={tab.inverse} />
                        {selected && (
                          <Check size={13} style={{ color: row.color }} />
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
};

/* ============================================================
   6. ANALYTICS VIEW
   ============================================================ */

export const AnalyticsView = ({ activeTab, topNav = null }) => {
  const d = useAnalyticsData(activeTab);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="sticky top-0 z-40 -mx-4 bg-[#F4F5F7] px-4 py-2 dark:bg-slate-950 md:-mx-6 md:px-6">
        <div className="relative flex flex-col gap-2 overflow-visible">
          {topNav}
          <FilterBar d={d} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 pb-6">
        {d.tab.isDynamic && d.status?.type === "error" && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300"
          >
            <span>{d.status.message}</span>
            <button
              type="button"
              onClick={() => d.fetchData().catch(() => {})}
              className="cursor-pointer rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        <KpiCards d={d} />

        {/* Row 2: Area Trend (8 cols) + Share Pie/Donut (4 cols) */}
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-12">
          <TrendPanel d={d} />
          <CategoryPiePanel d={d} />
        </div>

        {/* Row 3: Bar Comparison (6 cols) + Multi-Category Line Trajectory (6 cols) */}
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-12">
          <CategoryBarPanel d={d} />
          <CategoryLinesPanel d={d} />
        </div>

        {/* Row 4: Full-width Category Performance Breakdown */}
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-12">
          <CategoryList d={d} />
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   7. DASHBOARD PAGE
   ============================================================ */

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("product");
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";

  const resetProductCategory = productSaleStore((s) => s.setSelectedCategory);

  const resetExpenseCategory = expenseAnalyticsStore(
    (s) => s.setSelectedCategory,
  );

  const resetOrderCategory = orderAnalyticsStore((s) => s.setSelectedCategory);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    resetProductCategory(null);
    resetExpenseCategory(null);
    resetOrderCategory(null);
  };

  const categoryNav = (
    <div className="w-full">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.06)] ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45)] dark:ring-white/[0.04]">
        <nav
          aria-label="Dashboard categories"
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const activeHue = isDark ? tab.darkHue || tab.hue : tab.hue;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`group relative inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-[12.5px] tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.98] ${
                  active
                    ? "font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                    : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: `${activeHue}${isDark ? "22" : "12"}`,
                        color: activeHue,
                        boxShadow: `inset 0 0 0 1px ${activeHue}${isDark ? "50" : "30"}, 0 1px 2px rgba(16,24,40,0.04)`,
                      }
                    : undefined
                }
              >
                {/* Icon Squircle Container */}
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors duration-200 ${
                    active
                      ? "text-white shadow-xs dark:text-slate-950"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800 group-hover:shadow-2xs dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-100"
                  }`}
                  style={active ? { backgroundColor: activeHue } : undefined}
                >
                  <Icon size={12} strokeWidth={2.25} />
                </span>

                <span>{tab.label}</span>

                {/* Orders Count Pill */}
                {tab.id === "orders" && (
                  <span
                    className={`ml-0.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors ${
                      active
                        ? "bg-white/90 shadow-2xs dark:bg-slate-800/90"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-100"
                    }`}
                    style={active ? { color: activeHue } : undefined}
                  >
                    {tab.categories.length} types
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-full min-w-0 flex-col overflow-x-clip bg-[#F4F5F7] text-[12px] text-[#101828] dark:bg-slate-950 dark:text-slate-100"
      style={{
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&display=swap');

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-1 flex-col px-4 md:px-6">
        {/* ANALYTICS CONTENT (includes sticky category navigation + filter bar) */}
        <AnalyticsView activeTab={activeTab} topNav={categoryNav} />
      </div>
    </div>
  );
};

export default Dashboard;
