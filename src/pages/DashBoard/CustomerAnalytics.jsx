import { useMemo, useState } from "react";
import AnalyticsShell from "./AnalyticsShell";
import { CURRENT_YEAR, buildStaticSeries } from "./analyticsHelpers";

const CUSTOMER_SOURCES = ["App", "Website", "Referral", "Corporate"];

const CustomersAnalytics = () => {
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
        { key: "customers", dailyBase: 32, categories: CUSTOMER_SOURCES },
        filters,
      ),
    [filters],
  );

  return (
    <AnalyticsShell
      id="customers"
      title="Customer Analytics"
      blurb="New customer acquisitions, by source."
      metric="New customers"
      categoryLabel="Source"
      hue="#7C3AED"
      managePath="/dashboard/customer"
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
    />
  );
};

export default CustomersAnalytics;
