import { useEffect } from "react";
import { productAnalyticsStore } from "@/zustand/Store/analyticsStore";
import AnalyticsShell from "./AnalyticsShell";

const ProductAnalytics = () => {
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
    getProductAnalytics,
  } = productAnalyticsStore();

  useEffect(() => {
    getProductAnalytics().catch(() => {});
  }, [getProductAnalytics]);

  return (
    <AnalyticsShell
      id="product"
      title="Product Sales"
      blurb="Units sold for each product category."
      metric="Units sold"
      categoryLabel="Product"
      hue="#2563EB"
      managePath="/dashboard/product"
      labels={labels}
      per={per}
      rows={rows}
      loading={loading}
      status={status}
      onRetry={() => getProductAnalytics().catch(() => {})}
      filters={filters}
      setFilters={setFilters}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      compare={compare}
      setCompare={setCompare}
      resetFilters={resetFilters}
    />
  );
};

export default ProductAnalytics;
