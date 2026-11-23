import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    ChevronDown,
    Check,
    Layers,
    RotateCcw,
    RefreshCw,
} from "lucide-react";
import {
    CURRENT_YEAR,
    YEARS,
    MONTHS,
    TINT,
    weekRange,
    weeksIn,
    sum,
    fmt,
} from "./analyticsHelpers";

const Tip = ({ active, payload, label, pre = "" }) =>
    active && payload?.length ? (
        <div className="rounded-lg bg-[#101828] px-2.5 py-1.5 text-[11px] text-white shadow-2xl">
            <p className="mb-0.5 text-white/60">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="flex items-center gap-1.5 font-semibold">
                    <i
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: p.stroke || p.fill }}
                    />
                    <span>{p.name}:</span>
                    <span className="tabular-nums">
                        {pre}
                        {Math.round(p.value).toLocaleString("en-IN")}
                    </span>
                </p>
            ))}
        </div>
    ) : null;

const Delta = ({ v }) => (
    <span
        className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-px text-[11px] font-bold ${v >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
    >
        {v >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(v).toFixed(1)}%
    </span>
);

const Spark = ({ v, color }) => {
    if (!v?.length) return null;
    const mx = Math.max(...v),
        mn = Math.min(...v);
    const pts = v
        .map(
            (x, i) =>
                `${(i / Math.max(v.length - 1, 1)) * 52 + 2},${16 - ((x - mn) / (mx - mn || 1)) * 14}`,
        )
        .join(" ");
    return (
        <svg
            width="56"
            height="18"
            aria-hidden
            className="hidden shrink-0 xl:block"
        >
            <polyline
                points={pts}
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
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-[#F8FAFC] px-2.5 py-1.5 text-[12px] transition-colors hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white ${disabled ? "pointer-events-none opacity-45" : ""
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
        const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const activeIndex = items.findIndex((item) => item.name === value);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                style={
                    value
                        ? { background: `${hue}12`, borderColor: hue, color: "#101828" }
                        : {
                            background: "#F8FAFC",
                            borderColor: "#E6E8EC",
                            color: "#101828",
                        }
                }
            >
                <Layers size={14} style={{ color: hue }} />
                <span className="font-medium text-slate-500">{label}:</span>
                <span className="flex items-center gap-1.5">
                    {value && (
                        <i
                            className="h-2 w-2 rounded-full"
                            style={{ background: hue, opacity: TINT[activeIndex] ?? 1 }}
                        />
                    )}
                    {value ?? "All"}
                </span>
                <ChevronDown
                    size={14}
                    className={`ml-0.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-label={`Filter by ${label}`}
                    className="absolute left-0 top-full z-50 mt-1.5 max-h-72 w-68 overflow-y-auto rounded-xl border border-[#E6E8EC] bg-white p-1.5 shadow-2xl"
                >
                    <li role="option" aria-selected={value === null}>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-bold transition-colors ${value === null
                                    ? "bg-slate-100 text-[#101828]"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <span>All ({items.length})</span>
                            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 tabular-nums">
                                {fmt(grand, prefix)}
                                {value === null && <Check size={14} style={{ color: hue }} />}
                            </span>
                        </button>
                    </li>

                    <li className="my-1 border-t border-slate-100" aria-hidden />

                    {items.map((item, idx) => {
                        const selected = value === item.name;
                        const share = grand ? ((item.total / grand) * 100).toFixed(0) : 0;
                        return (
                            <li key={item.name} role="option" aria-selected={selected}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(item.name);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${selected
                                            ? "font-bold text-[#101828]"
                                            : "font-semibold text-slate-700 hover:bg-slate-50"
                                        }`}
                                    style={selected ? { background: `${hue}14` } : undefined}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <i
                                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                            style={{ background: hue, opacity: TINT[idx] ?? 0.5 }}
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
                                            {selected && <Check size={14} style={{ color: hue }} />}
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

const AnalyticsShell = ({
    id,
    title,
    blurb,
    metric,
    categoryLabel,
    prefix = "",
    hue = "#2563EB",
    managePath,
    labels = [],
    per = "month",
    rows = [],
    loading = false,
    status = { type: null, message: "" },
    onRetry,
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    compare,
    setCompare,
    resetFilters,
    subToolbar = null,
}) => {
    const navigate = useNavigate();
    const num = (v) => (v === "all" ? null : Number(v));

    const table = useMemo(
        () =>
            rows
                .map((r) => {
                    const total = sum(r.cur || []);
                    const prevTotal = sum(r.prev || []);
                    return {
                        ...r,
                        total,
                        g: prevTotal ? (total / prevTotal - 1) * 100 : 0,
                    };
                })
                .sort((a, b) => b.total - a.total),
        [rows],
    );

    const sel = selectedCategory
        ? rows.filter((r) => r.name === selectedCategory)
        : rows;
    const pick = (k) => labels.map((_, j) => sum(sel.map((r) => r[k]?.[j] ?? 0)));
    const cur = pick("cur");
    const prev = pick("prev");
    const tot = sum(cur);
    const prevTot = sum(prev);
    const growth = prevTot ? (tot / prevTot - 1) * 100 : 0;
    const peak = cur.length ? cur.indexOf(Math.max(...cur)) : 0;
    const grand = sum(rows.map((r) => sum(r.cur || [])));

    const trend = labels.map((l, j) => ({
        l,
        cur: cur[j] ?? 0,
        prev: prev[j] ?? 0,
    }));
    const stack = labels.map((l, j) => ({
        l,
        ...Object.fromEntries(rows.map((r) => [r.name, r.cur?.[j] ?? 0])),
    }));

    const when = [
        filters.year ?? "All years",
        filters.month != null && MONTHS[filters.month],
        filters.week != null && `Week ${filters.week + 1}`,
    ]
        .filter(Boolean)
        .join(" › ");

    const pv = filters.year == null ? "previous year" : `${filters.year - 1}`;
    const hasActiveFilters =
        selectedCategory !== null ||
        filters.year !== CURRENT_YEAR ||
        filters.month !== null ||
        filters.week !== null;

    const metricLower = metric.toLowerCase();
    const catLower = categoryLabel.toLowerCase();

    const kpis = [
        [
            selectedCategory
                ? `${selectedCategory} ${metricLower}`
                : `Total ${metricLower}`,
            fmt(tot, prefix),
            <Delta key="d" v={growth} />,
            `vs ${pv}`,
        ],
        [
            `Average per ${per}`,
            fmt(labels.length ? tot / labels.length : 0, prefix),
        ],
        ["Peak", fmt(cur[peak] ?? 0, prefix), null, labels[peak] || "-"],
        selectedCategory
            ? [
                "Share of total",
                `${grand ? ((tot / grand) * 100).toFixed(1) : 0}%`,
                null,
                `of all ${catLower}s`,
            ]
            : [
                `Top ${catLower}`,
                table[0]?.name || "-",
                null,
                `${grand && table[0] ? ((table[0].total / grand) * 100).toFixed(0) : 0}% of total`,
            ],
    ];

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Header + Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[18px] font-extrabold tracking-tight text-[#101828]">
                                {title}
                            </h1>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                {when}
                            </span>
                            {loading && (
                                <span
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                                    style={{ background: `${hue}15`, color: hue }}
                                >
                                    <RefreshCw size={11} className="animate-spin" /> Syncing
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">{blurb}</p>
                    </div>

                    {managePath && (
                        <button
                            type="button"
                            onClick={() => navigate(managePath)}
                            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#101828] transition-colors hover:border-slate-400 2xl:hidden"
                        >
                            Manage <ChevronRight size={13} />
                        </button>
                    )}
                </div>

                {/* Sub-category Dropdown + Year / Month / Week + Compare */}
                <div className="flex flex-wrap items-center gap-2">
                    <CategoryDropdown
                        label={categoryLabel}
                        items={table}
                        grand={grand}
                        prefix={prefix}
                        hue={hue}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                    />

                    <span
                        className="hidden h-5 w-px bg-[#E6E8EC] sm:inline-block"
                        aria-hidden
                    />

                    <Sel
                        label="Year"
                        value={filters.year ?? "all"}
                        onChange={(e) => {
                            const y = num(e.target.value);
                            setFilters({
                                year: y,
                                month: y == null ? null : filters.month,
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
                    </Sel>

                    <Sel
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
                    </Sel>

                    <Sel
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
                                    const [a, b] = weekRange(filters.year, filters.month, w);
                                    return (
                                        <option key={w} value={w}>
                                            Week {w + 1} ({a}–{b})
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
                            style={{ background: compare ? hue : "#CBD5E1" }}
                        >
                            <i
                                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${compare ? "left-3.5" : "left-0.5"
                                    }`}
                            />
                        </span>
                        vs {pv}
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

                    {managePath && (
                        <button
                            type="button"
                            onClick={() => navigate(managePath)}
                            className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#101828] transition-colors hover:border-slate-400 2xl:flex"
                        >
                            Manage <ChevronRight size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Optional category-specific toolbar (e.g., Order Type quick pills) */}
            {subToolbar}

            {/* Error banner */}
            {status?.type === "error" && (
                <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-700">
                    <span>{status.message}</span>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                        >
                            Retry
                        </button>
                    )}
                </div>
            )}

            {/* KPI strip */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map(([k, v, d, note], i) => (
                    <div
                        key={k}
                        className="min-w-0 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3"
                        style={
                            i === 0
                                ? {
                                    backgroundImage: `radial-gradient(260px 90px at 0% 0%, ${hue}20, transparent)`,
                                }
                                : undefined
                        }
                    >
                        <p className="truncate text-[11px] font-semibold text-slate-500">
                            {k}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <p
                                className={`truncate font-extrabold leading-tight tracking-tight text-[#101828] tabular-nums ${i === 0
                                        ? "text-[24px] sm:text-[26px]"
                                        : "text-[19px] sm:text-[20px]"
                                    }`}
                            >
                                {v}
                            </p>
                            {d}
                        </div>
                        {note && (
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                {note}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts + Breakdown */}
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="flex min-w-0 flex-col gap-3 lg:col-span-8">
                    <Panel
                        title={
                            compare
                                ? `${selectedCategory ? `${selectedCategory} ` : ""}${metric}: ${filters.year ?? "all years"} vs ${pv}`
                                : `${selectedCategory ? `${selectedCategory} ` : ""}${metric} over time`
                        }
                        sub={`One point per ${per}`}
                        right={
                            compare && (
                                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <i
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{ background: hue }}
                                        />
                                        {filters.year ?? "Current"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <i className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                        {pv}
                                    </span>
                                </div>
                            )
                        }
                    >
                        <ChartBox height={220}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart
                                    data={trend}
                                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient
                                            id={`g-analytics-${id}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor={hue} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={hue} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#EEF0F3" />
                                    <XAxis dataKey="l" {...axis} minTickGap={18} />
                                    <YAxis {...axis} width={46} tickFormatter={(v) => fmt(v)} />
                                    <Tooltip
                                        wrapperStyle={{ zIndex: 30 }}
                                        content={<Tip pre={prefix} />}
                                        cursor={{ stroke: hue, strokeDasharray: 4 }}
                                    />
                                    {compare && (
                                        <Area
                                            name={pv}
                                            dataKey="prev"
                                            stroke="#CBD5E1"
                                            strokeWidth={2}
                                            strokeDasharray="5 4"
                                            fill="none"
                                        />
                                    )}
                                    <Area
                                        name={selectedCategory ?? metric}
                                        dataKey="cur"
                                        stroke={hue}
                                        strokeWidth={2.5}
                                        fill={`url(#g-analytics-${id})`}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </Panel>

                    <Panel
                        title={`${metric} by ${catLower}`}
                        sub={`Each bar split by ${catLower}, per ${per}`}
                        right={
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                {table.map((r, i) => (
                                    <button
                                        key={r.name}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory(
                                                selectedCategory === r.name ? null : r.name,
                                            )
                                        }
                                        className={`flex items-center gap-1 text-[11px] font-semibold transition-opacity ${selectedCategory && selectedCategory !== r.name
                                                ? "opacity-40"
                                                : "text-slate-600"
                                            }`}
                                    >
                                        <i
                                            className="h-2 w-2 rounded-sm"
                                            style={{ background: hue, opacity: TINT[i] ?? 0.35 }}
                                        />
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <ChartBox height={220}>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={stack}
                                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                                >
                                    <CartesianGrid vertical={false} stroke="#EEF0F3" />
                                    <XAxis dataKey="l" {...axis} minTickGap={18} />
                                    <YAxis {...axis} width={46} tickFormatter={(v) => fmt(v)} />
                                    <Tooltip
                                        wrapperStyle={{ zIndex: 30 }}
                                        content={<Tip pre={prefix} />}
                                        cursor={{ fill: "#F6F7F9" }}
                                    />
                                    {table.map((r, i) => (
                                        <Bar
                                            key={r.name}
                                            dataKey={r.name}
                                            stackId="a"
                                            fill={hue}
                                            fillOpacity={
                                                selectedCategory
                                                    ? selectedCategory === r.name
                                                        ? 1
                                                        : 0.12
                                                    : (TINT[i] ?? 0.35)
                                            }
                                            stroke="#fff"
                                            strokeWidth={1}
                                            maxBarSize={30}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </Panel>
                </div>

                <Panel
                    className="lg:col-span-4"
                    title={`${categoryLabel}-wise ${metricLower}`}
                    sub="Select an item here or from the dropdown above."
                >
                    {table.length === 0 && !loading ? (
                        <p className="py-8 text-center text-[12px] text-slate-400">
                            No data found for this period.
                        </p>
                    ) : (
                        <ul className="space-y-1.5">
                            {table.map((r, idx) => {
                                const on = selectedCategory === r.name;
                                const maxTotal = table[0]?.total || 1;
                                return (
                                    <li key={r.name}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory(on ? null : r.name)}
                                            aria-pressed={on}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#F6F7F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                                            style={
                                                on
                                                    ? {
                                                        background: `${hue}14`,
                                                        boxShadow: `inset 0 0 0 1.5px ${hue}`,
                                                    }
                                                    : undefined
                                            }
                                        >
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                                style={{ background: hue, opacity: TINT[idx] ?? 0.5 }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[12px] font-bold text-[#101828]">
                                                    {r.name}
                                                </p>
                                                <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                                                    <div
                                                        className="h-1.5 rounded-full transition-[width] duration-500"
                                                        style={{
                                                            width: `${(r.total / maxTotal) * 100}%`,
                                                            background: hue,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <Spark v={r.cur} color={hue} />
                                            <div className="min-w-[76px] shrink-0 text-right">
                                                <p className="text-[12px] font-extrabold tabular-nums text-[#101828]">
                                                    {fmt(r.total, prefix)}
                                                </p>
                                                <Delta v={r.g} />
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

export default AnalyticsShell;
