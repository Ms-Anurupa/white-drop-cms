import { useEffect } from "react";
import AnalyticsShell from "./AnalyticsShell";
import { orderAnalyticsStore } from "@/zustand/Store/analyticsStore";

const ORDER_TYPES = [
  { key: "MINI", label: "Mini Order" },
  { key: "SUBSCRIPTION", label: "Subscription Order" },
  { key: "CORPORATE", label: "Corporate Order" },
  { key: "ADHOC", label: "Adhoc Sale" },
  { key: "SPECIAL", label: "Special Order" },
];

const HUE = "#EA580C";

const OrdersAnalytics = () => {
  const {
    labels,
    per,
    rows,
    loading,
    filters,
    selectedCategory,
    compare,
    status,
    setFilters,
    setSelectedCategory,
    setCompare,
    resetFilters,
    getOrderAnalytics,
  } = orderAnalyticsStore();

  useEffect(() => {
    getOrderAnalytics().catch(() => {});
  }, [getOrderAnalytics]);

  const filteredRows = selectedCategory
    ? rows.filter(
        (row) => row.key === selectedCategory || row.name === selectedCategory,
      )
    : rows;

  const orderTypePills = (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E6E8EC] bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <span className="mr-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        Order Types:
      </span>
      <button
        type="button"
        onClick={() => setSelectedCategory(null)}
        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
          selectedCategory === null
            ? "text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
        style={selectedCategory === null ? { background: HUE } : undefined}
      >
        All Orders
      </button>
      {ORDER_TYPES.map((orderType) => {
        const isSel = selectedCategory === orderType.key;
        return (
          <button
            key={orderType.key}
            type="button"
            onClick={() => setSelectedCategory(isSel ? null : orderType.key)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
              isSel
                ? "text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
            style={isSel ? { background: HUE } : undefined}
          >
            {orderType.label}
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
      rows={filteredRows}
      loading={loading}
      status={status}
      filters={filters}
      setFilters={setFilters}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      compare={compare}
      setCompare={setCompare}
      resetFilters={resetFilters}
      subToolbar={orderTypePills}
    />
  );
};

export default OrdersAnalytics;
