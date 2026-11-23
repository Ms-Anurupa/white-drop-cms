import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  Package,
  Wallet,
  ShoppingBag,
  Users,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import productSaleStore, {
  expenseAnalyticsStore,
} from "@/zustand/Store/analyticsStore";

/* ============================================================
   1. DATE, FORMAT & CONFIG
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

const NOW = new Date();
const YEAR = NOW.getFullYear();
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
const weekRange = (y, m, w) => [w * 7 + 1, Math.min(w * 7 + 7, daysIn(y, m))];
const weeksIn = (y, m) => Math.ceil(daysIn(y, m) / 7);

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
    dailyBase: 32,
    categories: ["App", "Website", "Referral", "Corporate"],
  },
];

const getCategoryColor = (index) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];

const getStaticSeries = (tab, filters) => {
  let labels = [];
  let mults = [];
  let per = "month";

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
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

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

const sum = (arr = []) =>
  arr.reduce((total, value) => total + (Number(value) || 0), 0);

const fmt = (v, pre = "") => {
  const value = Number(v) || 0;
  const a = Math.abs(value);

  const formatted =
    a >= 1e7
      ? `${(value / 1e7).toFixed(2)}Cr`
      : a >= 1e5
        ? `${(value / 1e5).toFixed(2)}L`
        : a >= 1e3
          ? `${(value / 1e3).toFixed(1)}k`
          : Math.round(value).toLocaleString("en-IN");

  return pre + formatted;
};

/* ============================================================
   2. UI COMPONENTS
   ============================================================ */

const Tip = ({ active, payload, label, pre = "" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#101828] px-3 py-2 text-[11px] text-white shadow-2xl">
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

const Delta = ({ v }) => {
  const positive = v >= 0;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(v).toFixed(1)}%
    </span>
  );
};

const Spark = ({ values = [], color }) => {
  if (!values.length) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 52 + 2;
      const y = 16 - ((value - min) / (max - min || 1)) * 14;
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
    className={`flex min-w-0 flex-col rounded-2xl border border-[#E6E8EC] bg-white p-4 ${className}`}
  >
    <header className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-[13px] font-bold text-[#101828]">{title}</h3>
        {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>

    {children}
  </section>
);

const ChartBox = ({ height = 220, children }) => (
  <div className="w-full min-w-0 shrink-0" style={{ height }}>
    {children}
  </div>
);

const axis = {
  tick: { fill: "#98A2B3", fontSize: 10 },
  axisLine: false,
  tickLine: false,
};

const Sel = ({ label, value, onChange, disabled, children }) => (
  <label
    className={`flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] transition-colors hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white ${
      disabled ? "pointer-events-none opacity-45" : ""
    }`}
  >
    <span className="font-medium text-slate-500">{label}</span>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="cursor-pointer bg-transparent font-bold text-[#101828] outline-none"
    >
      {children}
    </select>
  </label>
);

/* ============================================================
   3. CATEGORY DROPDOWN
   Each category uses its own color.
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
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const activeIndex = items.findIndex((item) => item.name === value);
  const activeColor = activeIndex >= 0 ? getCategoryColor(activeIndex) : hue;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        style={{
          background: value ? `${activeColor}12` : "#F8FAFC",
          borderColor: value ? `${activeColor}70` : "#E6E8EC",
          color: "#101828",
        }}
      >
        <Layers size={14} style={{ color: activeColor }} />

        <span className="font-medium text-slate-500">{label}:</span>

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
          className={`ml-0.5 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={`Filter by ${label}`}
          className="absolute left-0 top-full z-50 mt-1.5 max-h-72 w-72 overflow-y-auto rounded-xl border border-[#E6E8EC] bg-white p-1.5 shadow-2xl"
        >
          <li role="option" aria-selected={value === null}>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-bold ${
                value === null
                  ? "bg-slate-100 text-[#101828]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>All ({items.length})</span>

              <span className="flex items-center gap-2 text-[11px] text-slate-500">
                {fmt(grand, prefix)}
                {value === null && <Check size={14} style={{ color: hue }} />}
              </span>
            </button>
          </li>

          <li className="my-1 border-t border-slate-100" aria-hidden />

          {items.map((item, idx) => {
            const selected = value === item.name;
            const color = getCategoryColor(idx);
            const share = grand ? ((item.total / grand) * 100).toFixed(0) : 0;

            return (
              <li key={item.name} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                    selected
                      ? "font-bold text-[#101828]"
                      : "font-semibold text-slate-700 hover:bg-slate-50"
                  }`}
                  style={selected ? { background: `${color}12` } : undefined}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <i
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>

                  <span className="ml-2 flex shrink-0 items-center gap-2 text-[11px] tabular-nums">
                    <span className="font-bold text-[#101828]">
                      {fmt(item.total, prefix)}
                    </span>
                    <span className="w-8 text-right text-slate-400">
                      {share}%
                    </span>
                    <span className="w-3.5">
                      {selected && <Check size={14} style={{ color }} />}
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
   4. ANALYTICS VIEW
   ============================================================ */

export const AnalyticsView = ({ activeTab }) => {
  const navigate = useNavigate();

  // Both hooks are called unconditionally.
  const productAnalytics = productSaleStore();
  const expenseAnalytics = expenseAnalyticsStore();

  const analytics =
    activeTab === "expenses" ? expenseAnalytics : productAnalytics;

  const {
    labels: productLabels,
    per: productPer,
    rows: productRows,
    loading: productLoading,
    filters,
    selectedCategory,
    compare,
    status,
    setFilters,
    setSelectedCategory,
    setCompare,
    resetFilters,
  } = analytics;

  const getAnalytics =
    activeTab === "expenses"
      ? expenseAnalytics.getExpenseAnalytics
      : productAnalytics.getProductAnalytics;

  const tab = useMemo(
    () => TABS.find((t) => t.id === activeTab) || TABS[0],
    [activeTab],
  );

  useEffect(() => {
    if (tab.isDynamic) {
      getAnalytics().catch(() => {});
    }
  }, [tab.id, tab.isDynamic, getAnalytics]);

  const { labels, per, rows, loading } = useMemo(() => {
    if (tab.isDynamic) {
      return {
        labels: productLabels || [],
        per: productPer || "month",
        rows: productRows || [],
        loading: productLoading,
      };
    }

    return {
      ...getStaticSeries(tab, filters),
      loading: false,
    };
  }, [tab, filters, productLabels, productPer, productRows, productLoading]);

  const num = (v) => (v === "all" ? null : Number(v));

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

  // Keep category colors consistent with the API row order.
  const colorOf = (name) => {
    const index = rows.findIndex((r) => r.name === name);
    return getCategoryColor(Math.max(index, 0));
  };

  const selectedColor = selectedCategory ? colorOf(selectedCategory) : tab.hue;

  const selectedRows = selectedCategory
    ? rows.filter((r) => r.name === selectedCategory)
    : rows;

  const pick = (key) =>
    labels.map((_, index) =>
      sum(selectedRows.map((r) => r[key]?.[index] ?? 0)),
    );

  const cur = pick("cur");
  const prev = pick("prev");

  const total = sum(cur);
  const previousTotal = sum(prev);
  const growth = previousTotal ? (total / previousTotal - 1) * 100 : 0;

  const peak = cur.length ? cur.indexOf(Math.max(...cur)) : 0;
  const grand = sum(rows.map((r) => sum(r.cur)));

  const trend = labels.map((label, index) => ({
    l: label,
    cur: cur[index] ?? 0,
    prev: prev[index] ?? 0,
  }));

  const stack = labels.map((label, index) => ({
    l: label,
    ...Object.fromEntries(rows.map((r) => [r.name, r.cur?.[index] ?? 0])),
  }));

  const calloutSeries = selectedCategory
    ? [selectedCategory]
    : table.slice(0, 2).map((r) => r.name);

  const callouts = Object.fromEntries(
    calloutSeries.map((name) => {
      const values = rows.find((r) => r.name === name)?.cur ?? [];

      return [name, values.length ? values.indexOf(Math.max(...values)) : -1];
    }),
  );

  const calloutText = (index, value) =>
    `${labels[index]}${
      filters.year != null && filters.month == null ? ` ${filters.year}` : ""
    }, ${fmt(value, tab.prefix)}`;

  const renderCallout = (name, color) => (props) => {
    const { x, y, index, value } = props;

    if (callouts[name] !== index || !value) return null;

    const nearEnd = index >= labels.length - 2;

    return (
      <g key={`${name}-${index}`}>
        <circle
          cx={x}
          cy={y}
          r={5.5}
          fill={color}
          stroke="#1F2226"
          strokeWidth={2}
        />

        <text
          x={nearEnd ? x - 10 : x + 10}
          y={nearEnd ? y - 10 : y + 4}
          textAnchor={nearEnd ? "end" : "start"}
          fill="#E5E7EB"
          fontSize={11}
          fontWeight={700}
        >
          {calloutText(index, value)}
        </text>
      </g>
    );
  };

  const when = [
    filters.year ?? "All years",
    filters.month != null && MONTHS[filters.month],
    filters.week != null && `Week ${filters.week + 1}`,
  ]
    .filter(Boolean)
    .join(" › ");

  const previousPeriod =
    filters.year == null ? "previous year" : `${filters.year - 1}`;

  const hasActiveFilters =
    selectedCategory !== null ||
    filters.year !== YEAR ||
    filters.month !== null ||
    filters.week !== null;

  const metricLower = tab.metric.toLowerCase();

  const kpis = [
    [
      selectedCategory
        ? `${selectedCategory} ${metricLower}`
        : `Total ${metricLower}`,
      fmt(total, tab.prefix),
      <Delta key="growth" v={growth} />,
      `vs ${previousPeriod}`,
    ],
    [
      `Average per ${per}`,
      fmt(labels.length ? total / labels.length : 0, tab.prefix),
    ],
    ["Peak", fmt(cur[peak] ?? 0, tab.prefix), null, labels[peak] || "-"],
    selectedCategory
      ? [
          "Share of total",
          `${grand ? ((total / grand) * 100).toFixed(1) : 0}%`,
          null,
          `of all ${tab.label.toLowerCase()}`,
        ]
      : [
          `Top ${tab.id === "orders" ? "order type" : "category"}`,
          table[0]?.name || "-",
          null,
          `${
            grand && table[0] ? ((table[0].total / grand) * 100).toFixed(0) : 0
          }% of total`,
        ],
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* HEADER AND FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-extrabold tracking-tight text-[#101828]">
                {tab.title}
              </h1>

              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {when}
              </span>

              {loading && (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: `${tab.hue}15`,
                    color: tab.hue,
                  }}
                >
                  <RefreshCw size={11} className="animate-spin" />
                  Syncing
                </span>
              )}
            </div>

            <p className="mt-0.5 text-[11px] text-slate-500">{tab.blurb}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(tab.managePath)}
            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#101828] hover:border-slate-400 2xl:hidden"
          >
            Manage <ChevronRight size={13} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryDropdown
            label={tab.id === "orders" ? "Order Type" : tab.label}
            items={table}
            grand={grand}
            prefix={tab.prefix}
            hue={tab.hue}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />

          <span className="hidden h-5 w-px bg-[#E6E8EC] sm:inline-block" />

          <Sel
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
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Sel>

          <Sel
            label="Month"
            value={filters.month ?? "all"}
            disabled={filters.year == null}
            onChange={(e) =>
              setFilters({
                ...filters,
                month: num(e.target.value),
                week: null,
              })
            }
          >
            <option value="all">All months</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </Sel>

          <Sel
            label="Week"
            value={filters.week ?? "all"}
            disabled={filters.month == null}
            onChange={(e) =>
              setFilters({
                ...filters,
                week: num(e.target.value),
              })
            }
          >
            <option value="all">All weeks</option>

            {filters.month != null &&
              Array.from(
                {
                  length: weeksIn(filters.year, filters.month),
                },
                (_, week) => {
                  const [start, end] = weekRange(
                    filters.year,
                    filters.month,
                    week,
                  );

                  return (
                    <option key={week} value={week}>
                      Week {week + 1} ({start}–{end})
                    </option>
                  );
                },
              )}
          </Sel>

          <button
            type="button"
            role="switch"
            aria-checked={compare}
            onClick={() => setCompare(!compare)}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-300"
          >
            <span
              className="relative h-4 w-7 rounded-full transition-colors"
              style={{
                background: compare ? selectedColor : "#CBD5E1",
              }}
            >
              <i
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                  compare ? "left-3.5" : "left-0.5"
                }`}
              />
            </span>
            vs {previousPeriod}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-[#101828]"
              title="Reset filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(tab.managePath)}
            className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#101828] hover:border-slate-400 2xl:flex"
          >
            Manage <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ORDER TYPE FILTER PILLS */}
      {tab.id === "orders" && tab.categories && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-2.5">
          <span className="mr-1 text-[11px] font-bold text-slate-500">
            Order Types:
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              selectedCategory === null
                ? "text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            style={
              selectedCategory === null ? { background: tab.hue } : undefined
            }
          >
            All Orders
          </button>

          {tab.categories.map((orderType, index) => {
            const selected = selectedCategory === orderType;
            const color = getCategoryColor(index);

            return (
              <button
                key={orderType}
                type="button"
                onClick={() => setSelectedCategory(selected ? null : orderType)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                  selected
                    ? "text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={selected ? { background: color } : { color }}
              >
                {orderType}
              </button>
            );
          })}
        </div>
      )}

      {/* API ERROR */}
      {tab.isDynamic && status?.type === "error" && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-700">
          <span>{status.message}</span>

          <button
            type="button"
            onClick={() => getAnalytics().catch(() => {})}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([key, value, delta, note], index) => (
          <div
            key={key}
            className="min-w-0 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3"
            style={
              index === 0
                ? {
                    backgroundImage: `radial-gradient(260px 90px at 0% 0%, ${selectedColor}20, transparent)`,
                    borderColor: `${selectedColor}35`,
                  }
                : undefined
            }
          >
            <p className="truncate text-[11px] font-semibold text-slate-500">
              {key}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p
                className={`truncate font-extrabold leading-tight tracking-tight text-[#101828] tabular-nums ${
                  index === 0
                    ? "text-[24px] sm:text-[26px]"
                    : "text-[19px] sm:text-[20px]"
                }`}
              >
                {value}
              </p>
              {delta}
            </div>

            {note && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CHARTS AND CATEGORY BREAKDOWN */}
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-8">
          {/* MAIN TREND CHART */}
          <Panel
            title={
              compare
                ? `${selectedCategory ? `${selectedCategory} ` : ""}${tab.metric}: ${filters.year ?? "all years"} vs ${previousPeriod}`
                : `${selectedCategory ? `${selectedCategory} ` : ""}${tab.metric} over time`
            }
            sub={`One point per ${per}`}
            right={
              compare && (
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <i
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: selectedColor }}
                    />
                    {filters.year ?? "Current"}
                  </span>

                  <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {previousPeriod}
                  </span>
                </div>
              )
            }
          >
            <ChartBox height={220}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={trend}
                  margin={{
                    left: 0,
                    right: 8,
                    top: 8,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id={`g-analytics-${tab.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={selectedColor}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={selectedColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} stroke="#EEF0F3" />

                  <XAxis dataKey="l" {...axis} minTickGap={18} />

                  <YAxis
                    {...axis}
                    width={46}
                    tickFormatter={(value) => fmt(value)}
                  />

                  <Tooltip
                    wrapperStyle={{ zIndex: 30 }}
                    content={<Tip pre={tab.prefix} />}
                    cursor={{
                      stroke: selectedColor,
                      strokeDasharray: 4,
                    }}
                  />

                  {compare && (
                    <Area
                      name={previousPeriod}
                      dataKey="prev"
                      stroke="#CBD5E1"
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
                    fill={`url(#g-analytics-${tab.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </Panel>

          {/* CATEGORY-WISE LINE CHART */}
          <section className="min-w-0 rounded-2xl bg-[#1F2226] p-5 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,.5)]">
            <h3 className="text-[15px] font-bold">
              {tab.metric} by {tab.id === "orders" ? "order type" : "category"}{" "}
              · {when}
            </h3>

            {/* CATEGORY LEGEND */}
            <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {rows.map((row) => {
                const color = colorOf(row.name);
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
                      className={`flex items-center gap-1.5 text-[11px] transition-opacity ${
                        dim ? "opacity-35" : "opacity-100"
                      }`}
                    >
                      <i
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: color }}
                      />

                      <span className="font-semibold text-slate-200">
                        {row.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <ChartBox height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={stack}
                  margin={{
                    left: 4,
                    right: 16,
                    top: 30,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid stroke="#30353B" />

                  <XAxis
                    dataKey="l"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={{ stroke: "#4B5563" }}
                    tickLine={false}
                    minTickGap={18}
                  />

                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                    tickFormatter={(value) => fmt(value)}
                    label={{
                      value: `${tab.metric}${tab.prefix ? ` (${tab.prefix})` : ""}`,
                      angle: -90,
                      position: "insideLeft",
                      fill: "#9CA3AF",
                      fontSize: 10,
                      style: { textAnchor: "middle" },
                    }}
                  />

                  <ReferenceLine y={0} stroke="#6B7280" />

                  <Tooltip
                    wrapperStyle={{ zIndex: 30 }}
                    content={<Tip pre={tab.prefix} />}
                    cursor={{
                      stroke: "#6B7280",
                      strokeDasharray: 4,
                    }}
                  />

                  {rows.map((row) => {
                    const color = colorOf(row.name);
                    const dim =
                      selectedCategory && selectedCategory !== row.name;

                    return (
                      <Line
                        key={row.name}
                        type="monotone"
                        dataKey={row.name}
                        name={row.name}
                        stroke={color}
                        strokeWidth={2.5}
                        strokeOpacity={dim ? 0.2 : 1}
                        dot={{
                          r: 3,
                          fill: color,
                          stroke: color,
                          fillOpacity: dim ? 0.2 : 1,
                        }}
                        activeDot={{
                          r: 5,
                          stroke: "#1F2226",
                          strokeWidth: 2,
                        }}
                        label={renderCallout(row.name, color)}
                        isAnimationActive
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </section>
        </div>

        {/* CATEGORY PREVIEW */}
        <Panel
          className="lg:col-span-4"
          title={`${
            tab.id === "orders" ? "Order type" : tab.label
          }-wise ${metricLower}`}
          sub="Select an item here or from the dropdown above."
        >
          {table.length === 0 && !loading ? (
            <p className="py-8 text-center text-[12px] text-slate-400">
              No data found for this period.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {table.map((row) => {
                const originalIndex = rows.findIndex(
                  (r) => r.name === row.name,
                );

                const color = getCategoryColor(Math.max(originalIndex, 0));

                const selected = selectedCategory === row.name;
                const maxTotal = table[0]?.total || 1;

                return (
                  <li key={row.name}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategory(selected ? null : row.name)
                      }
                      aria-pressed={selected}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all hover:bg-[#F6F7F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                      style={
                        selected
                          ? {
                              background: `${color}12`,
                              boxShadow: `inset 0 0 0 1.5px ${color}`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{
                          background: color,
                          boxShadow: `0 0 0 3px ${color}18`,
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-bold text-[#101828]">
                            {row.name}
                          </p>

                          {selected && <Check size={13} style={{ color }} />}
                        </div>

                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(row.total / maxTotal) * 100}%`,
                              background: color,
                            }}
                          />
                        </div>
                      </div>

                      <Spark values={row.cur} color={color} />

                      <div className="min-w-[76px] shrink-0 text-right">
                        <p className="text-[12px] font-extrabold tabular-nums text-[#101828]">
                          {fmt(row.total, tab.prefix)}
                        </p>

                        <Delta v={row.g} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

/* ============================================================
   5. DASHBOARD PAGE
   ============================================================ */

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("product");

  const resetProductCategory = productSaleStore(
    (state) => state.setSelectedCategory,
  );

  const resetExpenseCategory = expenseAnalyticsStore(
    (state) => state.setSelectedCategory,
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    resetProductCategory(null);
    resetExpenseCategory(null);
  };

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F5F7] text-[12px] text-[#101828]"
      style={{
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&display=swap');

        @media (prefers-reduced-motion:reduce) {
          * {
            transition: none!important;
            animation: none!important;
          }
        }
      `}</style>

      {/* TOP NAVIGATION */}
      <header className="z-40 border-b border-[#E6E8EC] bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <nav
            aria-label="Dashboard Categories"
            className="flex flex-wrap items-center gap-1.5"
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
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "bg-[#F4F5F7] text-slate-600 hover:bg-slate-200/70 hover:text-[#101828]"
                  }`}
                  style={active ? { background: tab.hue } : undefined}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>

                  {tab.id === "orders" && (
                    <span
                      className={`ml-0.5 rounded px-1.5 py-px text-[10px] font-semibold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      5 types
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <label className="hidden w-60 items-center gap-2 rounded-lg bg-[#F4F5F7] px-2.5 py-1.5 text-slate-500 focus-within:ring-2 focus-within:ring-slate-900 sm:flex">
              <Search size={14} />
              <input
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Search"
              />
            </label>

            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F4F5F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              <Bell size={15} />
              <i className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-1 flex-col px-4 py-3 md:px-6">
        <AnalyticsView activeTab={activeTab} />
      </main>
    </div>
  );
};

export default Dashboard;
