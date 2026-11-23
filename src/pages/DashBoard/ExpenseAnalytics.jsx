import { useEffect } from "react";
import { expenseAnalyticsStore } from "@/zustand/Store/analyticsStore";
import AnalyticsShell from "./AnalyticsShell";

const ExpensesAnalytics = () => {
    const {
        labels,
        per,
        rows,
        loading,
        filters,
        selectedCategory,
        compare,
        status,

        getExpenseAnalytics,
        setFilters,
        setSelectedCategory,
        setCompare,
        resetFilters,
    } = expenseAnalyticsStore();

    useEffect(() => {
        getExpenseAnalytics().catch(() => { });
    }, [getExpenseAnalytics]);

    return (
        <AnalyticsShell
            id="expenses"
            title="Expense Analytics"
            blurb="Where the money goes, by expense type."
            metric="Spend"
            categoryLabel="Expense"
            prefix="₹"
            hue="#0D9488"
            managePath="/dashboard/expense"
            labels={labels}
            per={per}
            rows={rows}
            loading={loading}
            status={status}
            onRetry={() => getExpenseAnalytics().catch(() => { })}
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

export default ExpensesAnalytics;
