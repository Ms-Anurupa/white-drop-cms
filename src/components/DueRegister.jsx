import { useEffect, useMemo, useRef, useState } from "react";

/**
 * DueTrackerPro — receivables workspace over the `dueRegister` table.
 *
 * Props
 *  fetchDues({ type, month }) => Promise<Row[]>
 *      type "subscription" → rows that have userId · type "corporate" → rows that have corpoAccId
 *      Row: { id, name?, userId?, corpoAccId?, dueAmount, month, lastCalculated, details }
 *  fetchTrend({ type, months }) => Promise<{ month, total, owingCount }[]>     (optional)
 *      Enables month-over-month deltas and the 6-month chart. Hidden if omitted.
 *  onOpenAccount(row) · onSendReminder(rows[]) · onRecordPayment(row)           (optional)
 *      A button is rendered only when its handler is passed.
 *  theme: "auto" | "light" | "dark"
 *
 * With no fetchDues the component runs on demo data (and shows all actions).
 * The component reads `fetchDues` / `fetchTrend` through a ref, so inline arrow functions are safe.
 */

/* ───────────── formatting & date helpers (month key = UTC "YYYY-MM", same as the cron) ───────────── */
const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
const inrCompact = (n) =>
  "₹" +
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n || 0);
const monthKey = (d) => d.toISOString().slice(0, 7);
const monthLabel = (k) =>
  new Date(`${k}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const shortMonth = (k) =>
  new Date(`${k}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    timeZone: "UTC",
  });
const lastMonths = (n = 6) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) =>
    monthKey(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)),
    ),
  );
};
const timeAgo = (iso) => {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

/* ───────────── register analysis ───────────── */
const LOG_RE = /^(\w+) (\S+): ([\d.]+) - ([\d.]+) paid = ([\d.]+) due$/;
const parseLog = (line) => {
  const m = LOG_RE.exec(line);
  return m
    ? { kind: m[1], id: m[2], total: +m[3], paid: +m[4], due: +m[5] }
    : { raw: line };
};
const analyse = (row, type) => {
  const logs = (row.details?.calculationLogs || []).map(parseLog);
  const parsed = logs.filter((l) => !l.raw);
  const billed = parsed.reduce((s, l) => s + l.total, 0);
  const paid = parsed.reduce((s, l) => s + l.paid, 0);
  const items =
    type === "subscription"
      ? (row.details?.unpaidOrders?.length || 0) +
        (row.details?.unpaidSubscriptions?.length || 0)
      : row.details?.unpaidCorporateOrders?.length || 0;
  const status = !(row.dueAmount > 0)
    ? "clear"
    : paid > 0
      ? "partial"
      : "unpaid";
  return { logs, billed, paid, items, status };
};
const STATUS_LABEL = {
  unpaid: "Unpaid",
  partial: "Partly paid",
  clear: "Cleared",
};
const STATUS_RANK = { unpaid: 0, partial: 1, clear: 2 };
const strip = ({ _a, ...raw }) => raw;

/* ───────────── demo data ───────────── */
const FIRST = [
  "Riya",
  "Manoj",
  "Priyanka",
  "Subhas",
  "Farhana",
  "Debashis",
  "Ananya",
  "Imran",
  "Sneha",
  "Tapan",
  "Mitali",
  "Rohit",
  "Kaveri",
  "Arjun",
  "Nusrat",
  "Sourav",
  "Pallavi",
  "Dilip",
  "Meera",
  "Jayanta",
  "Tanushree",
  "Asif",
  "Barnali",
  "Kunal",
  "Ishita",
  "Ratan",
];
const LAST = [
  "Sen",
  "Das",
  "Ghosh",
  "Roy",
  "Khatun",
  "Pal",
  "Mukherjee",
  "Sheikh",
  "Basu",
  "Dey",
];
const CORPS = [
  "Sunrise Hospitality Pvt Ltd",
  "Eastern Canteen Services",
  "Lakeview Apartments AOA",
  "Greenleaf Foods",
  "Metro Tiffin Co-op",
  "Harbour Hotels Group",
  "Bengal Institute of Tech",
  "Orchid Catering",
  "Riverside Medical Centre",
  "Ankur Public School",
  "Cityline Offices LLP",
  "Silverline Hostels",
];
const FACTORS = [1, 0.87, 0.94, 0.76, 0.82, 0.68];
const rnd = (i, k) => {
  const x = Math.sin(i * 97.13 + k * 31.7) * 10000;
  return x - Math.floor(x);
};
const demoRows = (type, month) => {
  const f = FACTORS[Math.max(0, lastMonths().indexOf(month))] ?? 1;
  const base = Date.now() - 3.5 * 3600e3;
  const scale = (v, step = 100) =>
    Math.max(step, Math.round((v * f) / step) * step);
  if (type === "subscription") {
    return Array.from({ length: 26 }, (_, i) => {
      const cleared = rnd(i, 3) < 0.15;
      const nSubs = cleared ? 0 : Math.floor(rnd(i, 1) * 3);
      const nRetail = cleared
        ? 0
        : Math.floor(rnd(i, 2) * 4) + (nSubs === 0 ? 1 : 0);
      const subs = Array.from({ length: nSubs }, (_, s) => {
        const total = scale((Math.floor(rnd(i, 10 + s) * 10) + 2) * 500, 500);
        const paid =
          rnd(i, 20 + s) < 0.45
            ? Math.round((total * rnd(i, 30 + s) * 0.8) / 100) * 100
            : 0;
        return { id: 100 + i * 3 + s, total, paid };
      });
      const retail = Array.from({ length: nRetail }, (_, r) => ({
        id: 800 + i * 4 + r,
        amt: scale((Math.floor(rnd(i, 40 + r) * 8) + 3) * 100),
      }));
      const due =
        subs.reduce((s, x) => s + (x.total - x.paid), 0) +
        retail.reduce((s, x) => s + x.amt, 0);
      return {
        id: `u${i}`,
        name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
        userId: `USR-${1000 + i}`,
        month,
        dueAmount: due,
        lastCalculated: new Date(base - i * 1000).toISOString(),
        details: {
          unpaidOrders: retail.map((r) => r.id),
          unpaidSubscriptions: subs.map((s) => s.id),
          calculationLogs: subs.map(
            (s) =>
              `Sub ${s.id}: ${s.total} - ${s.paid} paid = ${s.total - s.paid} due`,
          ),
        },
      };
    });
  }
  return CORPS.map((name, i) => {
    const n = rnd(i, 5) < 0.12 ? 0 : Math.floor(rnd(i, 6) * 3) + 1;
    const orders = Array.from({ length: n }, (_, o) => {
      const total = scale((Math.floor(rnd(i, 50 + o) * 80) + 16) * 500, 500);
      const paid =
        rnd(i, 60 + o) < 0.5
          ? Math.round((total * rnd(i, 70 + o) * 0.7) / 500) * 500
          : 0;
      return { id: 20 + i * 3 + o, total, paid };
    });
    return {
      id: `c${i}`,
      name,
      corpoAccId: `CORP-${200 + i}`,
      month,
      dueAmount: orders.reduce((s, x) => s + (x.total - x.paid), 0),
      lastCalculated: new Date(base - i * 1000).toISOString(),
      details: {
        unpaidCorporateOrders: orders.map((o) => o.id),
        calculationLogs: orders.map(
          (o) =>
            `CorpOrder ${o.id}: ${o.total} - ${o.paid} paid = ${o.total - o.paid} due`,
        ),
      },
    };
  });
};
const demoFetch = ({ type, month }) =>
  new Promise((r) => setTimeout(() => r(demoRows(type, month)), 400));
const demoTrend = ({ type, months }) =>
  Promise.resolve(
    months.map((m) => {
      const rows = demoRows(type, m).filter((r) => r.dueAmount > 0);
      return {
        month: m,
        total: rows.reduce((s, r) => s + r.dueAmount, 0),
        owingCount: rows.length,
      };
    }),
  );

/* ───────────── icons ───────────── */
const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  send: (
    <>
      <path d="M21 3 10 14" />
      <path d="M21 3 14 21l-4-7-7-4z" />
    </>
  ),
  sort: <path d="m8 10 4-4 4 4M8 14l4 4 4-4" />,
};
const Icon = ({ name, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

/* ───────────── small pieces ───────────── */
const StatusBadge = ({ status }) => (
  <span className={`dt-badge ${status}`}>{STATUS_LABEL[status]}</span>
);

function Delta({ cur, prev, prevLabel }) {
  if (prev == null || prev === 0)
    return <span className="dt-delta flat">No prior month to compare</span>;
  const p = ((cur - prev) / prev) * 100;
  if (Math.abs(p) < 0.05)
    return <span className="dt-delta flat">No change vs {prevLabel}</span>;
  const up = p > 0; // more owed = worse
  return (
    <span className={`dt-delta ${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(p).toFixed(1)}% vs {prevLabel}
    </span>
  );
}

function SortTh({ k, label, sort, onSort, className = "" }) {
  const active = sort.key === k;
  return (
    <th
      className={className}
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        className={`dt-sortbtn ${active ? "on" : ""}`}
        onClick={() => onSort(k)}
      >
        {label}
        <Icon
          name={active ? (sort.dir === "asc" ? "up" : "down") : "sort"}
          size={13}
        />
      </button>
    </th>
  );
}

function Chips({ title, ids, prefix }) {
  if (!ids?.length) return null;
  return (
    <div className="dt-sec">
      <h4>{title}</h4>
      <div className="dt-chips">
        {ids.map((id) => (
          <span key={id} className="dt-chip">
            {prefix} #{id}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrendCard({ months, trend, selected, onSelect }) {
  const asc = [...months].reverse();
  const byMonth = Object.fromEntries(trend.map((t) => [t.month, t]));
  const max = Math.max(1, ...asc.map((m) => byMonth[m]?.total || 0));
  return (
    <div className="dt-card dt-trend">
      <h3>Outstanding by month</h3>
      <div
        className="dt-bars"
        role="group"
        aria-label="Outstanding amount by month"
      >
        {asc.map((m) => {
          const v = byMonth[m]?.total || 0;
          const on = m === selected;
          return (
            <button
              key={m}
              className={`dt-col ${on ? "on" : ""}`}
              aria-pressed={on}
              aria-label={`${monthLabel(m)}: ${inr(v)} outstanding`}
              title={`${monthLabel(m)} · ${inr(v)}`}
              onClick={() => onSelect(m)}
            >
              <span className="dt-colval">{on ? inrCompact(v) : ""}</span>
              <span className="dt-colbar">
                <i style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
              </span>
              <span className="dt-collbl">{shortMonth(m)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── main component ───────────── */
export default function DueTrackerPro({
  fetchDues,
  fetchTrend,
  onOpenAccount,
  onSendReminder,
  onRecordPayment,
  theme = "auto",
}) {
  const demo = !fetchDues;
  const api = useRef({});
  api.current = {
    load: fetchDues ?? demoFetch,
    trend: fetchTrend ?? (demo ? demoTrend : null),
  };

  const months = useMemo(() => lastMonths(6), []);
  const [type, setType] = useState("subscription");
  const [month, setMonth] = useState(months[0]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("dues");
  const [minAmount, setMinAmount] = useState(0);
  const [sort, setSort] = useState({ key: "dueAmount", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [density, setDensity] = useState("comfortable");
  const [selected, setSelected] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [rows, setRows] = useState([]);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);

  const searchRef = useRef(null);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  const canRemind = demo || !!onSendReminder;
  const canPay = demo || !!onRecordPayment;
  const canOpen = demo || !!onOpenAccount;
  const notify = (msg, tone = "ok") => setToast({ msg, tone });

  /* data */
  useEffect(() => {
    let off = false;
    setLoading(true);
    setError(null);
    Promise.resolve(api.current.load({ type, month }))
      .then((d) => !off && setRows(Array.isArray(d) ? d : []))
      .catch(
        (e) =>
          !off && setError(e?.message || "Could not load the due register."),
      )
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, [type, month, tick]);

  useEffect(() => {
    const t = api.current.trend;
    if (!t) return setTrend(null);
    let off = false;
    Promise.resolve(t({ type, months }))
      .then((d) => !off && setTrend(Array.isArray(d) ? d : null))
      .catch(() => !off && setTrend(null));
    return () => {
      off = true;
    };
  }, [type, months, tick]);

  useEffect(() => {
    setSelected(new Set());
    setPage(1);
    setActiveId(null);
  }, [type, month]);
  useEffect(() => setPage(1), [query, statusFilter, minAmount, sort, pageSize]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  /* derived */
  const enriched = useMemo(
    () => rows.map((r) => ({ ...r, _a: analyse(r, type) })),
    [rows, type],
  );

  const counts = useMemo(() => {
    const c = { all: enriched.length, unpaid: 0, partial: 0, clear: 0 };
    enriched.forEach((r) => c[r._a.status]++);
    c.dues = c.unpaid + c.partial;
    return c;
  }, [enriched]);

  const summary = useMemo(() => {
    const owing = enriched
      .filter((r) => r.dueAmount > 0)
      .sort((a, b) => b.dueAmount - a.dueAmount);
    const total = owing.reduce((s, r) => s + r.dueAmount, 0);
    const top5 = owing.slice(0, 5).reduce((s, r) => s + r.dueAmount, 0);
    const latest = enriched.reduce(
      (a, r) => (r.lastCalculated > a ? r.lastCalculated : a),
      "",
    );
    return {
      total,
      owing: owing.length,
      top5Share: total ? (top5 / total) * 100 : 0,
      max: owing[0]?.dueAmount || 1,
      latest,
    };
  }, [enriched]);

  const prevKey = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return monthKey(new Date(Date.UTC(y, m - 2, 1)));
  }, [month]);
  const prev = trend?.find((t) => t.month === prevKey);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = enriched.filter((r) => {
      const s = r._a.status;
      if (statusFilter === "dues" && s === "clear") return false;
      if (
        ["unpaid", "partial", "clear"].includes(statusFilter) &&
        s !== statusFilter
      )
        return false;
      if (minAmount && r.dueAmount < minAmount) return false;
      if (!q) return true;
      return [r.name, r.userId, r.corpoAccId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    const d = sort.dir === "asc" ? 1 : -1;
    const val = {
      name: (a, b) =>
        String(a.name || a.userId || a.corpoAccId).localeCompare(
          String(b.name || b.userId || b.corpoAccId),
        ),
      status: (a, b) => STATUS_RANK[a._a.status] - STATUS_RANK[b._a.status],
      items: (a, b) => a._a.items - b._a.items,
      lastCalculated: (a, b) =>
        String(a.lastCalculated).localeCompare(String(b.lastCalculated)),
      dueAmount: (a, b) => a.dueAmount - b.dueAmount,
    }[sort.key];
    return [...list].sort((a, b) => d * val(a, b));
  }, [enriched, query, statusFilter, minAmount, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageRows = visible.slice((page - 1) * pageSize, page * pageSize);
  const allOnPage =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const someOnPage = pageRows.some((r) => selected.has(r.id));
  const selectedRows = enriched.filter((r) => selected.has(r.id));
  const selectedTotal = selectedRows.reduce((s, r) => s + r.dueAmount, 0);

  const activeIdx = visible.findIndex((r) => r.id === activeId);
  const active =
    activeIdx >= 0
      ? visible[activeIdx]
      : enriched.find((r) => r.id === activeId) || null;

  /* interactions */
  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  const toggleRow = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      pageRows.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id)));
      return n;
    });

  const openDrawer = (id, el) => {
    lastFocus.current = el;
    setActiveId(id);
  };
  const closeDrawer = () => {
    setActiveId(null);
    requestAnimationFrame(() => lastFocus.current?.focus?.());
  };
  useEffect(() => {
    if (activeId != null) closeRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && activeId != null) return closeDrawer();
      if (
        e.key === "/" &&
        !/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activeId]);

  const trapTab = (e) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const f = [
      ...drawerRef.current.querySelectorAll(
        "button,[href],input,select,[tabindex]:not([tabindex='-1'])",
      ),
    ].filter((el) => !el.disabled);
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const remind = async (list) => {
    try {
      if (onSendReminder) await onSendReminder(list.map(strip));
      notify(
        `Reminder queued for ${list.length} ${list.length === 1 ? "account" : "accounts"}${demo ? " (demo)" : ""}`,
      );
    } catch (e) {
      notify(e?.message || "Couldn't send reminders. Try again.", "err");
    }
  };
  const recordPayment = (row) => {
    if (onRecordPayment) onRecordPayment(strip(row));
    else notify("Demo: your payment form would open here");
  };
  const openAccount = (row) => {
    if (onOpenAccount) onOpenAccount(strip(row));
    else notify("Demo: this would open the account page");
  };

  const exportCsv = () => {
    const list = selectedRows.length ? selectedRows : visible;
    const head = [
      "Account",
      "ID",
      "Month",
      "Status",
      "Open items",
      "Amount due",
      "Last calculated",
    ];
    const body = list.map((r) =>
      [
        r.name || "",
        r.userId || r.corpoAccId || "",
        month,
        STATUS_LABEL[r._a.status],
        r._a.items,
        r.dueAmount,
        r.lastCalculated,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dues-${type}-${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify(`Exported ${list.length} ${list.length === 1 ? "row" : "rows"}`);
  };

  const isSub = type === "subscription";
  const noun = isSub ? "customers" : "accounts";
  const STATUS_TABS = [
    ["dues", "With dues", counts.dues],
    ["unpaid", "Unpaid", counts.unpaid],
    ["partial", "Partly paid", counts.partial],
    ["clear", "Cleared", counts.clear],
    ["all", "All", counts.all],
  ];

  return (
    <section className="dt" data-theme={theme}>
      <style>{CSS}</style>

      {/* Header */}
      <header className="dt-head">
        <div>
          <h2>Dues</h2>
          <p className="dt-lead">
            Outstanding balances for {monthLabel(month)}, net of offline
            payments.
            {summary.latest && (
              <> Register recalculated {timeAgo(summary.latest)}.</>
            )}
          </p>
        </div>
        <div className="dt-actions">
          <label className="dt-field">
            <span className="dt-sr">Month</span>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="dt-btn icon"
            onClick={() => setTick((t) => t + 1)}
            aria-label="Refresh"
            title="Refresh"
          >
            <Icon name="refresh" />
          </button>
          <button
            className="dt-btn"
            onClick={exportCsv}
            disabled={!visible.length}
          >
            <Icon name="download" /> Export
          </button>
        </div>
      </header>

      <div className="dt-tabs" role="tablist" aria-label="Due type">
        {[
          ["subscription", "Subscription dues"],
          ["corporate", "Corporate dues"],
        ].map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={type === k}
            className={type === k ? "on" : ""}
            onClick={() => setType(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPIs + trend */}
      <div className={`dt-overview ${trend ? "" : "solo"}`}>
        <div className="dt-kpis">
          <div className="dt-card dt-kpi hero">
            <span className="dt-label">Total outstanding</span>
            <strong>{loading ? "—" : inr(summary.total)}</strong>
            {trend && !loading && (
              <Delta
                cur={summary.total}
                prev={prev?.total}
                prevLabel={shortMonth(prevKey)}
              />
            )}
          </div>
          <div className="dt-card dt-kpi">
            <span className="dt-label">
              {isSub ? "Customers" : "Accounts"} owing
            </span>
            <strong>{loading ? "—" : summary.owing}</strong>
            {trend && !loading ? (
              <Delta
                cur={summary.owing}
                prev={prev?.owingCount}
                prevLabel={shortMonth(prevKey)}
              />
            ) : (
              <span className="dt-delta flat">of {counts.all} in register</span>
            )}
          </div>
          <div className="dt-card dt-kpi">
            <span className="dt-label">Top 5 concentration</span>
            <strong>
              {loading ? "—" : `${summary.top5Share.toFixed(0)}%`}
            </strong>
            <span className="dt-delta flat">of all outstanding</span>
          </div>
        </div>
        {trend && (
          <TrendCard
            months={months}
            trend={trend}
            selected={month}
            onSelect={setMonth}
          />
        )}
      </div>

      {/* Toolbar */}
      <div className="dt-toolbar">
        <label className="dt-search">
          <Icon name="search" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isSub ? "Search customer name or ID" : "Search company name or ID"
            }
            aria-label="Search dues"
          />
          <kbd>/</kbd>
        </label>
        <div className="dt-seg" role="group" aria-label="Filter by status">
          {STATUS_TABS.map(([k, label, n]) => (
            <button
              key={k}
              aria-pressed={statusFilter === k}
              className={statusFilter === k ? "on" : ""}
              onClick={() => setStatusFilter(k)}
            >
              {label}
              <span>{loading ? "" : n}</span>
            </button>
          ))}
        </div>
        <label className="dt-field">
          <span className="dt-sr">Minimum amount</span>
          <select
            value={minAmount}
            onChange={(e) => setMinAmount(+e.target.value)}
          >
            <option value={0}>Any amount</option>
            <option value={5000}>₹5,000 and above</option>
            <option value={10000}>₹10,000 and above</option>
            <option value={50000}>₹50,000 and above</option>
          </select>
        </label>
        <div className="dt-seg tight" role="group" aria-label="Row density">
          {["comfortable", "compact"].map((d) => (
            <button
              key={d}
              aria-pressed={density === d}
              className={density === d ? "on" : ""}
              onClick={() => setDensity(d)}
            >
              {d === "comfortable" ? "Roomy" : "Compact"}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="dt-bulk" role="region" aria-label="Bulk actions">
          <span>
            <b>{selected.size}</b> selected · {inr(selectedTotal)} due
          </span>
          <div>
            {canRemind && (
              <button
                className="dt-btn sm"
                onClick={() =>
                  remind(selectedRows.filter((r) => r.dueAmount > 0))
                }
                disabled={!selectedRows.some((r) => r.dueAmount > 0)}
              >
                <Icon name="send" size={14} /> Send reminders
              </button>
            )}
            <button className="dt-btn sm" onClick={exportCsv}>
              <Icon name="download" size={14} /> Export selected
            </button>
            <button
              className="dt-btn sm ghost"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dt-card dt-tablecard">
        <div className="dt-tablewrap">
          <table className={`dt-table ${density}`}>
            <thead>
              <tr>
                <th className="c-check">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allOnPage}
                    ref={(el) =>
                      el && (el.indeterminate = someOnPage && !allOnPage)
                    }
                    onChange={togglePage}
                    disabled={!pageRows.length}
                  />
                </th>
                <SortTh
                  k="name"
                  label={isSub ? "Customer" : "Company"}
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortTh
                  k="status"
                  label="Status"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortTh
                  k="items"
                  label="Open items"
                  sort={sort}
                  onSort={toggleSort}
                  className="num hide-sm"
                />
                <SortTh
                  k="dueAmount"
                  label="Amount due"
                  sort={sort}
                  onSort={toggleSort}
                  className="num"
                />
                <th className="num hide-sm">Share</th>
                <SortTh
                  k="lastCalculated"
                  label="Updated"
                  sort={sort}
                  onSort={toggleSort}
                  className="num hide-md"
                />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="skel">
                    <td colSpan={7}>
                      <span />
                    </td>
                  </tr>
                ))}

              {!loading &&
                !error &&
                pageRows.map((r) => {
                  const on = selected.has(r.id);
                  return (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      className={`${on ? "sel" : ""} ${r.id === activeId ? "active" : ""}`}
                      onClick={(e) => openDrawer(r.id, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target === e.currentTarget)
                          openDrawer(r.id, e.currentTarget);
                      }}
                    >
                      <td
                        className="c-check"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleRow(r.id)}
                          aria-label={`Select ${r.name || r.userId || r.corpoAccId}`}
                        />
                      </td>
                      <td>
                        <div className="dt-who">
                          <b>{r.name || r.userId || r.corpoAccId}</b>
                          <small>{r.userId || r.corpoAccId}</small>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={r._a.status} />
                      </td>
                      <td className="num hide-sm">{r._a.items || "—"}</td>
                      <td className="num">
                        <div className="dt-amt">
                          <b className={r.dueAmount > 0 ? "" : "zero"}>
                            {inr(r.dueAmount)}
                          </b>
                          <i className="dt-bar">
                            <em
                              style={{
                                width: `${(r.dueAmount / summary.max) * 100}%`,
                              }}
                            />
                          </i>
                        </div>
                      </td>
                      <td className="num hide-sm mut">
                        {summary.total && r.dueAmount
                          ? `${((r.dueAmount / summary.total) * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="num hide-md mut">
                        {timeAgo(r.lastCalculated)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {!loading && error && (
            <div className="dt-state">
              <strong>Couldn't load dues</strong>
              <p>{error}</p>
              <button className="dt-btn" onClick={() => setTick((t) => t + 1)}>
                Try again
              </button>
            </div>
          )}
          {!loading && !error && visible.length === 0 && (
            <div className="dt-state">
              <strong>
                {rows.length === 0
                  ? `No register entries for ${monthLabel(month)}`
                  : "No results"}
              </strong>
              <p>
                {rows.length === 0
                  ? "The due cron creates these once it has run for the month."
                  : "Nothing matches the current filters."}
              </p>
              {rows.length > 0 && (
                <button
                  className="dt-btn"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                    setMinAmount(0);
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && !error && visible.length > 0 && (
          <div className="dt-pager">
            <span>
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, visible.length)} of {visible.length}{" "}
              {noun}
            </span>
            <div>
              <label className="dt-field">
                <span className="dt-sr">Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(+e.target.value)}
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="dt-btn sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="dt-btn sm"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {active && (
        <>
          <div className="dt-scrim" onClick={closeDrawer} />
          <aside
            className="dt-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dt-dr-title"
            ref={drawerRef}
            onKeyDown={trapTab}
          >
            <div className="dt-dr-top">
              <div className="dt-dr-nav">
                <button
                  className="dt-btn icon sm"
                  onClick={() => setActiveId(visible[activeIdx - 1].id)}
                  disabled={activeIdx <= 0}
                  aria-label="Previous account"
                >
                  <Icon name="up" />
                </button>
                <button
                  className="dt-btn icon sm"
                  onClick={() => setActiveId(visible[activeIdx + 1].id)}
                  disabled={activeIdx < 0 || activeIdx >= visible.length - 1}
                  aria-label="Next account"
                >
                  <Icon name="down" />
                </button>
                {activeIdx >= 0 && (
                  <span>
                    {activeIdx + 1} of {visible.length}
                  </span>
                )}
              </div>
              <button
                ref={closeRef}
                className="dt-btn icon sm"
                onClick={closeDrawer}
                aria-label="Close details"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="dt-dr-body">
              <div className="dt-dr-id">
                <h3 id="dt-dr-title">
                  {active.name || active.userId || active.corpoAccId}
                </h3>
                <small>
                  {active.userId || active.corpoAccId} ·{" "}
                  {monthLabel(active.month || month)}
                </small>
              </div>

              <div className="dt-dr-amount">
                <div>
                  <span className="dt-label">Amount due</span>
                  <strong className={active.dueAmount > 0 ? "" : "zero"}>
                    {inr(active.dueAmount)}
                  </strong>
                </div>
                <StatusBadge status={active._a.status} />
              </div>

              {active._a.billed > 0 && (
                <div className="dt-sec">
                  <div className="dt-sum">
                    <span>
                      Billed <b>{inr(active._a.billed)}</b>
                    </span>
                    <span>
                      Paid offline <b>{inr(active._a.paid)}</b>
                    </span>
                  </div>
                  <i className="dt-bar lg paid">
                    <em
                      style={{
                        width: `${(active._a.paid / active._a.billed) * 100}%`,
                      }}
                    />
                  </i>
                </div>
              )}

              {active._a.logs.length > 0 && (
                <div className="dt-sec">
                  <h4>{isSub ? "Subscriptions" : "Corporate orders"}</h4>
                  <div className="dt-ledger">
                    {active._a.logs.map((l, i) =>
                      l.raw ? (
                        <p key={i} className="dt-raw">
                          {l.raw}
                        </p>
                      ) : (
                        <div key={i} className="dt-lrow">
                          <span className="dt-lid">
                            {l.kind === "Sub" ? "Subscription" : "Order"} #
                            {l.id}
                          </span>
                          <b>{inr(l.due)}</b>
                          <i className="dt-bar paid">
                            <em
                              style={{
                                width: `${l.total ? (l.paid / l.total) * 100 : 0}%`,
                              }}
                            />
                          </i>
                          <small>
                            {inr(l.paid)} paid of {inr(l.total)}
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {isSub ? (
                <>
                  {active._a.logs.length === 0 && (
                    <Chips
                      title="Subscriptions"
                      ids={active.details?.unpaidSubscriptions}
                      prefix="SUB"
                    />
                  )}
                  <Chips
                    title="Delivered orders awaiting payment"
                    ids={active.details?.unpaidOrders}
                    prefix="ORD"
                  />
                </>
              ) : (
                active._a.logs.length === 0 && (
                  <Chips
                    title="Corporate orders"
                    ids={active.details?.unpaidCorporateOrders}
                    prefix="ORD"
                  />
                )
              )}

              {active.dueAmount <= 0 && (
                <p className="dt-none">Nothing owed for this month.</p>
              )}

              <p className="dt-foot">
                Calculated{" "}
                {new Date(active.lastCalculated).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="dt-dr-actions">
              {canPay && (
                <button
                  className="dt-btn primary"
                  onClick={() => recordPayment(active)}
                  disabled={active.dueAmount <= 0}
                >
                  Record payment
                </button>
              )}
              {canRemind && (
                <button
                  className="dt-btn"
                  onClick={() => remind([active])}
                  disabled={active.dueAmount <= 0}
                >
                  <Icon name="send" size={14} /> Send reminder
                </button>
              )}
              {canOpen && (
                <button
                  className="dt-btn ghost"
                  onClick={() => openAccount(active)}
                >
                  Open {isSub ? "customer" : "account"}
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {toast && (
        <div className={`dt-toast ${toast.tone}`} role="status">
          {toast.msg}
        </div>
      )}
    </section>
  );
}

/* ───────────── styles (all scoped under .dt; inherits the host app's font) ───────────── */
const DARK_VARS = `
  --bg:#0b1220;--surface:#111a2b;--raise:#16223a;--ink:#e8edf5;--mut:#93a1b5;--line:#24314a;--line2:#1b2740;
  --unpaid:#f97066;--unpaid-bg:#3b1614;--partial:#fdb022;--partial-bg:#3a2a0a;--clear:#47cd89;--clear-bg:#0f2e22;
  --focus:#7aa7ff;--shadow:0 12px 40px rgba(0,0,0,.5);`;

const CSS = `
.dt{--bg:#f5f6f8;--surface:#fff;--raise:#fafbfc;--ink:#0e1a2b;--mut:#5f6b7a;--line:#e4e8ee;--line2:#eef1f5;
  --unpaid:#b42318;--unpaid-bg:#fee4e2;--partial:#b54708;--partial-bg:#fef0c7;--clear:#067647;--clear-bg:#d1fadf;
  --focus:#2e6be6;--shadow:0 12px 40px rgba(14,26,43,.18);
  position:relative;font-family:var(--dt-font,inherit);font-size:14px;line-height:1.45;color:var(--ink);background:var(--bg);
  padding:24px;border-radius:14px;max-width:1180px;margin:0 auto;font-variant-numeric:tabular-nums}
@media (prefers-color-scheme:dark){.dt[data-theme="auto"]{${DARK_VARS}}}
.dt[data-theme="dark"]{${DARK_VARS}}
.dt *{box-sizing:border-box}
.dt button,.dt input,.dt select{font:inherit;color:inherit}
.dt button{cursor:pointer}
.dt :focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.dt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

.dt-head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-end}
.dt-head h2{margin:0;font-size:24px;letter-spacing:-.02em}
.dt-lead{margin:4px 0 0;color:var(--mut);max-width:62ch}
.dt-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dt-field select{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:0 10px;height:36px}
.dt-btn{display:inline-flex;gap:6px;align-items:center;justify-content:center;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:0 12px;height:36px;white-space:nowrap}
.dt-btn:hover:not(:disabled){border-color:var(--mut)}
.dt-btn:disabled{opacity:.45;cursor:not-allowed}
.dt-btn.icon{padding:0;width:36px}
.dt-btn.sm{height:32px;padding:0 10px}
.dt-btn.icon.sm{width:32px;padding:0}
.dt-btn.primary{background:var(--ink);border-color:var(--ink);color:var(--surface);font-weight:600}
.dt-btn.primary:hover:not(:disabled){opacity:.9;border-color:var(--ink)}
.dt-btn.ghost{background:transparent;border-color:transparent;color:var(--mut)}
.dt-btn.ghost:hover:not(:disabled){color:var(--ink);border-color:var(--line)}

.dt-tabs{display:flex;gap:2px;margin:20px 0 16px;border-bottom:1px solid var(--line)}
.dt-tabs button{background:none;border:0;border-bottom:2px solid transparent;padding:10px 14px;color:var(--mut);margin-bottom:-1px}
.dt-tabs button:hover{color:var(--ink)}
.dt-tabs button.on{color:var(--ink);border-bottom-color:var(--ink);font-weight:600}

.dt-card{background:var(--surface);border:1px solid var(--line);border-radius:12px}
.dt-overview{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:12px}
.dt-overview.solo{grid-template-columns:1fr}
.dt-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dt-kpi{padding:16px 18px;display:flex;flex-direction:column;gap:2px;min-width:0}
.dt-kpi.hero{grid-column:1/-1;padding:20px 22px}
.dt-label{color:var(--mut);font-size:13px}
.dt-kpi strong{font-size:26px;letter-spacing:-.02em;line-height:1.2}
.dt-kpi.hero strong{font-size:40px;line-height:1.1}
.dt-delta{font-size:12.5px;font-weight:500}
.dt-delta.up{color:var(--unpaid)}.dt-delta.down{color:var(--clear)}.dt-delta.flat{color:var(--mut);font-weight:400}

.dt-trend{padding:16px 18px;display:flex;flex-direction:column}
.dt-trend h3{margin:0 0 8px;font-size:13px;font-weight:500;color:var(--mut)}
.dt-bars{flex:1;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;min-height:150px}
.dt-col{display:grid;grid-template-rows:18px 1fr 20px;background:none;border:0;padding:0;border-radius:8px;min-width:0}
.dt-colval{font-size:12px;font-weight:600;text-align:center}
.dt-colbar{display:flex;align-items:flex-end;justify-content:center}
.dt-colbar i{display:block;width:70%;max-width:44px;background:var(--line);border-radius:5px 5px 2px 2px;transition:height .25s ease,background .15s}
.dt-col:hover .dt-colbar i{background:var(--mut)}
.dt-col.on .dt-colbar i{background:var(--ink)}
.dt-collbl{font-size:12px;color:var(--mut);text-align:center;padding-top:4px}
.dt-col.on .dt-collbl{color:var(--ink);font-weight:600}

.dt-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:18px 0 10px}
.dt-search{display:flex;align-items:center;gap:8px;flex:1 1 240px;max-width:340px;height:36px;padding:0 10px;background:var(--surface);border:1px solid var(--line);border-radius:8px;color:var(--mut)}
.dt-search:focus-within{border-color:var(--focus)}
.dt-search input{flex:1;min-width:0;border:0;outline:0;background:none;color:var(--ink)}
.dt-search kbd{font:inherit;font-size:11px;border:1px solid var(--line);border-radius:4px;padding:0 5px;color:var(--mut)}
.dt-seg{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:2px;gap:2px;flex-wrap:wrap}
.dt-seg button{background:none;border:0;border-radius:6px;height:30px;padding:0 10px;color:var(--mut);display:flex;gap:6px;align-items:center}
.dt-seg button span{font-size:12px;opacity:.75}
.dt-seg button:hover{color:var(--ink)}
.dt-seg button.on{background:var(--ink);color:var(--surface)}
.dt-seg.tight{margin-left:auto}

.dt-bulk{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:var(--ink);color:var(--surface);border-radius:10px;padding:8px 8px 8px 16px;margin-bottom:10px}
.dt-bulk>div{display:flex;gap:6px;flex-wrap:wrap}
.dt-bulk .dt-btn{background:transparent;color:var(--surface);border-color:color-mix(in srgb,var(--surface) 30%,transparent)}
.dt-bulk .dt-btn:hover:not(:disabled){border-color:var(--surface)}
.dt-bulk .dt-btn.ghost{border-color:transparent}

.dt-tablecard{overflow:hidden}
.dt-tablewrap{overflow:auto;max-height:min(68vh,720px)}
.dt-table{width:100%;border-collapse:separate;border-spacing:0}
.dt-table th{position:sticky;top:0;z-index:1;background:var(--raise);border-bottom:1px solid var(--line);text-align:left;font-weight:500;color:var(--mut);font-size:12.5px;padding:0 14px;height:40px;white-space:nowrap}
.dt-table td{padding:14px;border-bottom:1px solid var(--line2);vertical-align:middle}
.dt-table.compact td{padding:7px 14px}
.dt-table .num{text-align:right}
.dt-table .c-check{width:44px;padding-right:0}
.dt-table .mut{color:var(--mut)}
.dt-table tbody tr:not(.skel){cursor:pointer}
.dt-table tbody tr:not(.skel):hover{background:var(--raise)}
.dt-table tbody tr.sel{background:color-mix(in srgb,var(--focus) 8%,transparent)}
.dt-table tbody tr.active{box-shadow:inset 3px 0 0 var(--ink)}
.dt-table tbody tr:focus-visible{outline-offset:-2px}
.dt-table input[type=checkbox]{width:16px;height:16px;accent-color:var(--ink)}
.dt-sortbtn{display:inline-flex;align-items:center;gap:4px;background:none;border:0;padding:0;color:inherit;height:100%}
.dt-sortbtn svg{opacity:.4}
.dt-sortbtn.on{color:var(--ink)}.dt-sortbtn.on svg{opacity:1}
.dt-table th.num .dt-sortbtn{flex-direction:row-reverse}
.dt-who{display:flex;flex-direction:column;min-width:0}
.dt-who b{font-weight:600}
.dt-who small{color:var(--mut)}
.dt-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:2px 10px 2px 8px;font-size:12.5px;font-weight:500;white-space:nowrap}
.dt-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.dt-badge.unpaid{color:var(--unpaid);background:var(--unpaid-bg)}
.dt-badge.partial{color:var(--partial);background:var(--partial-bg)}
.dt-badge.clear{color:var(--clear);background:var(--clear-bg)}
.dt-amt{display:flex;flex-direction:column;gap:5px;align-items:flex-end;min-width:110px}
.dt-amt b{font-size:15px}
.dt-amt b.zero{color:var(--clear);font-weight:500}
.dt-bar{display:block;width:100%;height:4px;background:var(--line2);border-radius:2px;overflow:hidden}
.dt-bar em{display:block;height:100%;background:var(--unpaid);border-radius:2px}
.dt-bar.paid em{background:var(--clear)}
.dt-bar.lg{height:8px;border-radius:4px}
.dt-amt .dt-bar{max-width:140px}
.dt-table tr.skel td{padding:10px 14px}
.dt-table tr.skel span{display:block;height:34px;border-radius:6px;background:linear-gradient(90deg,var(--line2) 25%,var(--raise) 50%,var(--line2) 75%);background-size:200% 100%;animation:dt-sh 1.3s linear infinite}
@keyframes dt-sh{to{background-position:-200% 0}}
.dt-state{padding:48px 16px;text-align:center;display:grid;gap:8px;justify-items:center}
.dt-state p{margin:0;color:var(--mut);max-width:44ch}
.dt-state .dt-btn{margin-top:6px}
.dt-pager{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line);color:var(--mut)}
.dt-pager>div{display:flex;gap:8px;align-items:center}
.dt-pager .dt-field select{height:32px}

.dt-scrim{position:fixed;inset:0;background:rgba(8,14,26,.45);z-index:40;animation:dt-fade .18s ease-out}
.dt-drawer{position:fixed;top:0;right:0;bottom:0;width:min(460px,100vw);z-index:41;background:var(--surface);color:var(--ink);box-shadow:var(--shadow);display:flex;flex-direction:column;animation:dt-slide .2s ease-out}
@keyframes dt-fade{from{opacity:0}}
@keyframes dt-slide{from{transform:translateX(24px);opacity:0}}
.dt-dr-top{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line)}
.dt-dr-nav{display:flex;gap:6px;align-items:center;color:var(--mut);font-size:12.5px}
.dt-dr-nav span{margin-left:6px}
.dt-dr-body{flex:1;overflow:auto;padding:20px;display:grid;gap:20px;align-content:start}
.dt-dr-id h3{margin:0;font-size:20px;letter-spacing:-.01em}
.dt-dr-id small{color:var(--mut)}
.dt-dr-amount{display:flex;justify-content:space-between;align-items:flex-end;gap:12px}
.dt-dr-amount strong{display:block;font-size:34px;letter-spacing:-.02em;line-height:1.15;color:var(--unpaid)}
.dt-dr-amount strong.zero{color:var(--clear)}
.dt-sec h4{margin:0 0 8px;font-size:13px;font-weight:600}
.dt-sum{display:flex;justify-content:space-between;color:var(--mut);margin-bottom:8px}
.dt-sum b{color:var(--ink);margin-left:4px}
.dt-ledger{border:1px solid var(--line);border-radius:10px;overflow:hidden}
.dt-lrow{display:grid;grid-template-columns:1fr auto;gap:4px 12px;padding:12px 14px}
.dt-lrow+.dt-lrow{border-top:1px solid var(--line2)}
.dt-lrow .dt-bar{grid-column:1/-1}
.dt-lrow small{grid-column:1/-1;color:var(--mut)}
.dt-lid{font-weight:600}
.dt-lrow b{color:var(--unpaid)}
.dt-raw{margin:0;padding:10px 14px;color:var(--mut);font-size:12.5px}
.dt-chips{display:flex;flex-wrap:wrap;gap:6px}
.dt-chip{background:var(--raise);border:1px solid var(--line);border-radius:6px;padding:2px 8px;font-size:12.5px}
.dt-none{margin:0;color:var(--mut)}
.dt-foot{margin:0;color:var(--mut);font-size:12.5px}
.dt-dr-actions{display:flex;gap:8px;flex-wrap:wrap;padding:14px 16px;border-top:1px solid var(--line);background:var(--raise)}
.dt-dr-actions .primary{flex:1 1 140px}

.dt-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;background:var(--ink);color:var(--surface);padding:10px 16px;border-radius:10px;box-shadow:var(--shadow);animation:dt-slide .2s ease-out;max-width:calc(100vw - 32px)}
.dt-toast.err{background:var(--unpaid);color:#fff}

@media (prefers-reduced-motion:reduce){.dt *{animation:none!important;transition:none!important}}
@media (max-width:980px){.dt-overview{grid-template-columns:1fr}.hide-md{display:none}}
@media (max-width:640px){
  .dt{padding:14px;border-radius:0}
  .hide-sm{display:none}
  .dt-kpi.hero strong{font-size:32px}
  .dt-seg.tight{margin-left:0}
  .dt-search{max-width:none}
}
`;
