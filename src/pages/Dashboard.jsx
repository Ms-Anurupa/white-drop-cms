import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import productSaleStore, {
  expenseAnalyticsStore,
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
const getCategoryColor = (i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length];

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
    blurb: "Units sold for each product category.",
    metric: "Units sold",
    prefix: "",
    hue: "#2563EB",
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
    blurb: "Orders placed across different order types.",
    metric: "Orders",
    prefix: "",
    hue: "#EA580C",
    managePath: "/dashboard/orders",
    icon: ShoppingBag,
    isDynamic: false,
    categoryLabel: "Order type",
    inverse: false,
    dailyBase: 240,
    categories: [
      "Mini Order",
      "Subscription Order",
      "Corporate Order",
      "Adhoc Order",
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
  const a = Math.abs(value);
  const out =
    a >= 1e7
      ? `${(value / 1e7).toFixed(2)}Cr`
      : a >= 1e5
        ? `${(value / 1e5).toFixed(2)}L`
        : a >= 1e3
          ? `${(value / 1e3).toFixed(1)}k`
          : Math.round(value).toLocaleString("en-IN");
  return pre + out;
};

const pct = (part, whole, digits = 0) =>
  whole ? ((part / whole) * 100).toFixed(digits) : "0";

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

  const tab = useMemo(
    () => TABS.find((t) => t.id === activeTab) || TABS[0],
    [activeTab],
  );
  const store = activeTab === "expenses" ? expenseStore : productStore;
  const fetchData =
    activeTab === "expenses"
      ? expenseStore.getExpenseAnalytics
      : productStore.getProductAnalytics;

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
    () => source.rows.map((r, i) => ({ ...r, color: getCategoryColor(i) })),
    [source.rows],
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
            g: prevTotal ? (total / prevTotal - 1) * 100 : 0,
          };
        })
        .sort((a, b) => b.total - a.total),
    [rows],
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
      grand,
      peak,
      growth: previousTotal ? (total / previousTotal - 1) * 100 : 0,
      selectedColor:
        rows.find((r) => r.name === selectedCategory)?.color ?? tab.hue,
      trend: labels.map((l, i) => ({
        l,
        cur: cur[i] ?? 0,
        prev: prev[i] ?? 0,
      })),
      stack: labels.map((l, i) => ({
        l,
        ...Object.fromEntries(rows.map((r) => [r.name, r.cur?.[i] ?? 0])),
      })),
    };
  }, [rows, labels, selectedCategory, tab.hue]);

  return {
    tab,
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

const axisProps = {
  tick: { fill: "#98A2B3", fontSize: 10 },
  axisLine: false,
  tickLine: false,
};

const ChartTooltip = ({ active, payload, label, pre = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#101828] px-3 py-2 text-[11px] text-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1.5 font-semibold text-white/60">{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-5 py-0.5"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <i
              className="h-2 w-2 rounded-full"
              style={{ background: p.stroke || p.fill }}
            />
            {p.name}
          </span>
          <span className="font-bold tabular-nums">
            {pre}
            {Math.round(Number(p.value) || 0).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
};

/** `inverse` flips the colors for metrics where "up" is bad (e.g. expenses). */
const Delta = ({ v, inverse = false }) => {
  const up = v >= 0;
  const good = inverse ? !up : up;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
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
    <svg
      width="56"
      height="18"
      aria-hidden
      className="hidden shrink-0 xl:block"
    >
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

const Panel = ({ title, sub, right, className = "", children }) => (
  <section
    className={`flex min-w-0 flex-col rounded-2xl border border-[#E6E8EC] bg-white p-4 dark:border-slate-800 dark:bg-slate-900 ${className}`}
  >
    <header className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-[13px] font-bold text-[#101828] dark:text-slate-100">
          {title}
        </h3>
        {sub && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {sub}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
    {children}
  </section>
);

const Select = ({ label, value, onChange, disabled, children }) => (
  <label
    className={`flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] transition-colors focus-within:border-slate-900 focus-within:bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-slate-500 dark:focus-within:bg-slate-800 dark:hover:border-slate-600 ${
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
      className="cursor-pointer bg-transparent font-bold text-[#101828] outline-none dark:text-slate-100 [&>option]:bg-white [&>option]:text-[#101828] dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
    >
      {children}
    </select>
  </label>
);

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 ${className}`}
  />
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
  value,
  onChange,
}) => {
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
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
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-1.5 text-[12px] font-bold text-[#101828] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-slate-400"
        style={
          value
            ? {
                background: isDark ? `${activeColor}24` : `${activeColor}12`,
                borderColor: `${activeColor}70`,
              }
            : undefined
        }
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
          className={`ml-0.5 text-slate-400 transition-transform dark:text-slate-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={`Filter by ${label}`}
          className="absolute left-0 top-full z-50 mt-1.5 max-h-72 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#E6E8EC] bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <li role="option" aria-selected={value === null}>
            <button
              type="button"
              onClick={() => choose(null)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-bold ${
                value === null
                  ? "bg-slate-100 text-[#101828] dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
              }`}
            >
              <span>All ({items.length})</span>
              <span className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {fmt(grand, prefix)}
                {value === null && <Check size={14} style={{ color: hue }} />}
              </span>
            </button>
          </li>

          <li
            className="my-1 border-t border-slate-100 dark:border-slate-800"
            aria-hidden
          />

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
                      : "font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
                  }`}
                  style={
                    selected
                      ? {
                          background: isDark
                            ? `${item.color}24`
                            : `${item.color}12`,
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
    className={`shrink-0 cursor-pointer items-center gap-0.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#101828] hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 ${className}`}
  >
    Manage <ChevronRight size={13} />
  </button>
);

const FilterBar = ({ d }) => {
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const navigate = useNavigate();
  const {
    tab,
    filters,
    setFilters,
    compare,
    setCompare,
    selectedCategory,
    resetFilters,
    loading,
  } = d;

  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;
  const num = (v) => (v === "all" ? null : Number(v));

  const when = [
    filters.year ?? "All years",
    filters.month != null && MONTHS[filters.month],
    filters.week != null && `Week ${filters.week + 1}`,
  ]
    .filter(Boolean)
    .join(" › ");

  const hasActiveFilters =
    selectedCategory !== null ||
    filters.year !== YEAR ||
    filters.month !== null ||
    filters.week !== null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 2xl:flex-row 2xl:items-center 2xl:justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[18px] font-extrabold tracking-tight text-[#101828] dark:text-slate-100">
              {tab.title}
            </h1>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {when}
            </span>
            {loading && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: `${tab.hue}15`, color: tab.hue }}
              >
                <RefreshCw size={11} className="animate-spin" /> Syncing
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {tab.blurb}
          </p>
        </div>
        <ManageButton
          className="flex 2xl:hidden"
          onClick={() => navigate(tab.managePath)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoryDropdown
          label={tab.categoryLabel}
          items={d.table}
          grand={d.grand}
          prefix={tab.prefix}
          hue={tab.hue}
          value={selectedCategory}
          onChange={d.setSelectedCategory}
        />

        <span className="hidden h-5 w-px bg-[#E6E8EC] dark:bg-slate-800 sm:inline-block" />

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
          <option value="all">All years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
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
          <option value="all">All months</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
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
          <option value="all">All weeks</option>
          {filters.month != null &&
            Array.from(
              { length: weeksIn(filters.year, filters.month) },
              (_, w) => {
                const [s, e] = weekRange(filters.year, filters.month, w);
                return (
                  <option key={w} value={w}>
                    Week {w + 1} ({s}–{e})
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
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <span
            className="relative h-4 w-7 rounded-full transition-colors"
            style={{
              background: compare
                ? d.selectedColor
                : isDark
                  ? "#475569"
                  : "#CBD5E1",
            }}
          >
            <i
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${compare ? "left-3.5" : "left-0.5"}`}
            />
          </span>
          vs {previousPeriod}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-[#101828] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}

        <ManageButton
          className="hidden 2xl:flex"
          onClick={() => navigate(tab.managePath)}
        />
      </div>
    </div>
  );
};

const KpiCards = ({ d }) => {
  const {
    tab,
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
    },
    {
      key: `Average per ${per}`,
      value: fmt(labels.length ? total / labels.length : 0, tab.prefix),
    },
    {
      key: "Peak",
      value: fmt(cur[peak] ?? 0, tab.prefix),
      note: labels[peak] || "–",
    },
    selectedCategory
      ? {
          key: "Share of total",
          value: `${pct(total, grand, 1)}%`,
          note: `of all ${tab.label.toLowerCase()}`,
        }
      : {
          key: `Top ${tab.categoryLabel.toLowerCase()}`,
          value: table[0]?.name || "–",
          note: `${table[0] ? pct(table[0].total, grand) : 0}% of total`,
        },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k, i) => (
        <div
          key={k.key}
          className="min-w-0 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
          style={
            i === 0
              ? {
                  backgroundImage: `radial-gradient(260px 90px at 0% 0%, ${selectedColor}20, transparent)`,
                  borderColor: `${selectedColor}35`,
                }
              : undefined
          }
        >
          <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {k.key}
          </p>
          {loading && !k.value ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p
                className={`truncate font-extrabold leading-tight tracking-tight text-[#101828] tabular-nums dark:text-slate-100 ${
                  i === 0
                    ? "text-[24px] sm:text-[26px]"
                    : "text-[19px] sm:text-[20px]"
                }`}
              >
                {k.value}
              </p>
              {k.delta}
            </div>
          )}
          {k.note && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
              {k.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

const TrendPanel = ({ d }) => {
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const { tab, selectedCategory, selectedColor, compare, filters, per, trend } =
    d;
  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;
  const prefixName = selectedCategory ? `${selectedCategory} ` : "";
  const themedAxisProps = {
    ...axisProps,
    tick: { fill: isDark ? "#94A3B8" : "#98A2B3", fontSize: 10 },
  };

  return (
    <Panel
      title={
        compare
          ? `${prefixName}${tab.metric}: ${filters.year ?? "all years"} vs ${previousPeriod}`
          : `${prefixName}${tab.metric} over time`
      }
      sub={`One point per ${per}`}
      right={
        compare && (
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <i
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: selectedColor }}
              />
              {filters.year ?? "Current"}
            </span>
            <span className="flex items-center gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              {previousPeriod}
            </span>
          </div>
        )
      }
    >
      <div className="h-[220px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trend}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`g-${tab.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={selectedColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={isDark ? "#1E293B" : "#EEF0F3"}
            />
            <XAxis dataKey="l" {...themedAxisProps} minTickGap={18} />
            <YAxis
              {...themedAxisProps}
              width={46}
              tickFormatter={(v) => fmt(v)}
            />
            <Tooltip
              wrapperStyle={{ zIndex: 20 }}
              content={<ChartTooltip pre={tab.prefix} />}
              cursor={{ stroke: selectedColor, strokeDasharray: 4 }}
            />
            {compare && (
              <Area
                name={previousPeriod}
                dataKey="prev"
                stroke={isDark ? "#475569" : "#CBD5E1"}
                strokeWidth={2}
                strokeDasharray="5 4"
                fill="none"
              />
            )}
            <Area
              name={selectedCategory ?? tab.metric}
              dataKey="cur"
              stroke={selectedColor}
              strokeWidth={2.5}
              fill={`url(#g-${tab.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};


const CategoryLinesPanel = ({ d }) => {
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const {
    tab,
    rows,
    table,
    labels,
    stack,
    filters,
    selectedCategory,
    setSelectedCategory,
  } = d;

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

  const cardBgHex = isDark ? "#0F172A" : "#FFFFFF";
  const axisColor = isDark ? "#94A3B8" : "#64748B";
  const gridColor = isDark ? "#1E293B" : "#EEF0F3";
  const axisLineColor = isDark ? "#334155" : "#E2E8F0";

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
            r={5.5}
            fill={color}
            stroke={cardBgHex}
            strokeWidth={2}
          />

          <text
            x={nearEnd ? x - 10 : x + 10}
            y={nearEnd ? y - 10 : y + 4}
            textAnchor={nearEnd ? "end" : "start"}
            fill={isDark ? "#E2E8F0" : "#101828"}
            fontSize={11}
            fontWeight={700}
          >
            {text}
          </text>
        </g>
      );
    };

  return (
    <Panel
      title={`${tab.metric} by ${tab.categoryLabel.toLowerCase()} · ${when}`}
      sub="Click any item below to highlight or isolate its trend."
    >
      <ul className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
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
                className={`flex cursor-pointer items-center gap-1.5 text-[11px] transition-opacity ${dim ? "opacity-35" : "opacity-100"}`}
              >
                <i
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: row.color }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Chart */}
      <div className="mt-2 h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={stack}
            margin={{ left: 4, right: 16, top: 30, bottom: 0 }}
          >
            <CartesianGrid stroke={gridColor} />
            <XAxis
              dataKey="l"
              tick={{ fill: axisColor, fontSize: 10 }}
              axisLine={{ stroke: axisLineColor }}
              tickLine={false}
              minTickGap={18}
            />

            <YAxis
              tick={{ fill: axisColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={62}
              tickFormatter={(v) => fmt(v)}
              label={{
                value: `${tab.metric}${tab.prefix ? ` (${tab.prefix})` : ""}`,
                angle: -90,
                position: "insideLeft",
                fill: axisColor,
                fontSize: 10,
                style: { textAnchor: "middle" },
              }}
            />
            <ReferenceLine y={0} stroke={axisLineColor} />
            <Tooltip
              wrapperStyle={{ zIndex: 20 }}
              content={<ChartTooltip pre={tab.prefix} />}
              cursor={{ stroke: axisColor, strokeDasharray: 4 }}
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
                  strokeWidth={2.5}
                  strokeOpacity={dim ? 0.2 : 1}
                  dot={{
                    r: 3,
                    fill: row.color,
                    stroke: row.color,
                    fillOpacity: dim ? 0.2 : 1,
                  }}
                  activeDot={{ r: 5, stroke: cardBgHex, strokeWidth: 2 }}
                  label={renderCallout(row.name, row.color)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};


const CategoryList = ({ d }) => {
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const { tab, table, loading, selectedCategory, setSelectedCategory } = d;
  const maxTotal = table[0]?.total || 1;

  return (
    <Panel
      className="lg:col-span-4"
      title={`${tab.categoryLabel}-wise ${tab.metric.toLowerCase()}`}
      sub="Select an item here or from the dropdown above."
    >
      {loading && table.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : table.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-slate-400 dark:text-slate-500">
          Nothing recorded for this period. Try a wider date range.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {table.map((row) => {
            const selected = selectedCategory === row.name;
            return (
              <li key={row.name}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory(selected ? null : row.name)
                  }
                  aria-pressed={selected}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all hover:bg-[#F6F7F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 dark:hover:bg-slate-800/70 dark:focus-visible:outline-slate-400"
                  style={
                    selected
                      ? {
                          background: isDark
                            ? `${row.color}24`
                            : `${row.color}12`,
                          boxShadow: `inset 0 0 0 1.5px ${row.color}`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{
                      background: row.color,
                      boxShadow: `0 0 0 3px ${row.color}18`,
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-bold text-[#101828] dark:text-slate-100">
                        {row.name}
                      </p>
                      {selected && (
                        <Check size={13} style={{ color: row.color }} />
                      )}
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
                    <p className="text-[12px] font-extrabold tabular-nums text-[#101828] dark:text-slate-100">
                      {fmt(row.total, tab.prefix)}
                    </p>
                    <Delta v={row.g} inverse={tab.inverse} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
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
      {/* Unified opaque sticky header so scrolled cards/charts never bleed through */}
      <div className="sticky top-0 z-30 -mx-4 bg-[#F4F5F7] px-4 pt-3 pb-3 dark:bg-slate-950 md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3">
          {topNav}
          <FilterBar d={d} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 pb-6">
        {d.tab.isDynamic && d.status?.type === "error" && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
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

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-8">
            <TrendPanel d={d} />
            <CategoryLinesPanel d={d} />
          </div>
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
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const [activeTab, setActiveTab] = useState("product");

  const resetProductCategory = productSaleStore((s) => s.setSelectedCategory);

  const resetExpenseCategory = expenseAnalyticsStore(
    (s) => s.setSelectedCategory,
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    resetProductCategory(null);
    resetExpenseCategory(null);
  };

  const categoryNav = (
    <div className="w-full">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.06)] ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/[0.04]">
        <nav
          aria-label="Dashboard categories"
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`group relative inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-[12.5px] tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.98] ${
                  active
                    ? "font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                    : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: isDark
                          ? `${tab.hue}24`
                          : `${tab.hue}12`,
                        color: tab.hue,
                        boxShadow: `inset 0 0 0 1px ${tab.hue}30, 0 1px 2px rgba(16,24,40,0.04)`,
                      }
                    : undefined
                }
              >
                {/* Icon Squircle Container */}
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors duration-200 ${
                    active
                      ? "text-white shadow-xs"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800 group-hover:shadow-2xs dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-100"
                  }`}
                  style={active ? { backgroundColor: tab.hue } : undefined}
                >
                  <Icon size={12} strokeWidth={2.25} />
                </span>

                <span>{tab.label}</span>

                {/* Orders Count Pill */}
                {tab.id === "orders" && (
                  <span
                    className={`ml-0.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors ${
                      active
                        ? "bg-white/90 shadow-2xs dark:bg-slate-900/90"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-200"
                    }`}
                    style={active ? { color: tab.hue } : undefined}
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

