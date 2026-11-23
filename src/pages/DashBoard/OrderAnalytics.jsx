import { useMemo, useState } from "react";
import AnalyticsShell from "./AnalyticsShell";
import { CURRENT_YEAR, buildStaticSeries } from "./analyticsHelpers";

const ORDER_TYPES = [
  "Mini Order",
  "Subscription Order",
  "Corporate Order",
  "Adhoc Order",
  "Special Order",
];

const HUE = "#EA580C";

const OrdersAnalytics = () => {
  const [filters, setFilters] = useState({
    year: CURRENT_YEAR,
    month: null,
    week: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [compare, setCompare] = useState(true);

  const { labels, per, rows } = useMemo(
    () =>
      buildStaticSeries(
        { key: "orders", dailyBase: 240, categories: ORDER_TYPES },
        filters,
      ),
    [filters],
  );

  const orderTypePills = (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-2.5">
      <span className="mr-1 text-[11px] font-bold text-slate-500">
        Order Types:
      </span>
      <button
        type="button"
        onClick={() => setSelectedCategory(null)}
        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
          selectedCategory === null
            ? "text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        style={selectedCategory === null ? { background: HUE } : undefined}
      >
        All Orders
      </button>
      {ORDER_TYPES.map((orderType) => {
        const isSel = selectedCategory === orderType;
        return (
          <button
            key={orderType}
            type="button"
            onClick={() => setSelectedCategory(isSel ? null : orderType)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
              isSel
                ? "text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            style={isSel ? { background: HUE } : undefined}
          >
            {orderType}
          </button>
        );
      })}
    </div>
  );

  return (
    <AnalyticsShell
      id="orders"
      title="Order Analytics"
      blurb="Orders placed across Mini, Subscription, Corporate, Adhoc, and Special orders."
      metric="Orders"
      categoryLabel="Order Type"
      hue={HUE}
      managePath="/dashboard/orders"
      labels={labels}
      per={per}
      rows={rows}
      filters={filters}
      setFilters={setFilters}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      compare={compare}
      setCompare={setCompare}
      resetFilters={() => {
        setFilters({ year: CURRENT_YEAR, month: null, week: null });
        setSelectedCategory(null);
      }}
      subToolbar={orderTypePills}
    />
  );
};

export default OrdersAnalytics;
