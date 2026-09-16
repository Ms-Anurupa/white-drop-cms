import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import expenseStore, { PAGE_LIMIT } from "../zustand/Store/expenseStore"; // adjust path
import CategorySelect from "../components/CategorySelect"; // adjust path

const DATE_PILLS = [
    { label: "All", value: "" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This week", value: "this_week" },
    { label: "This month", value: "this_month" },
    { label: "Custom", value: "custom" },
];

const inr = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(n) || 0);

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

const SummaryCard = ({ label, amount, accent = false }) => (
    <div
        className={[
            "rounded-xl border px-4 py-3",
            accent ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white",
        ].join(" ")}
    >
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <p
            className={[
                "mt-1 text-lg font-semibold tracking-tight",
                accent ? "text-blue-700" : "text-gray-900",
            ].join(" ")}
        >
            {inr(amount)}
        </p>
    </div>
);

const ExpenseListing = () => {
    const navigate = useNavigate();

    const expenses = expenseStore((s) => s.expenses);
    const pagination = expenseStore((s) => s.pagination);
    const meta = expenseStore((s) => s.meta);
    const loading = expenseStore((s) => s.loading);
    const error = expenseStore((s) => s.error);
    const filters = expenseStore((s) => s.filters);
    const getExpenseListing = expenseStore((s) => s.getExpenseListing);
    const setFilter = expenseStore((s) => s.setFilter);
    const setDateFilter = expenseStore((s) => s.setDateFilter);
    const setPage = expenseStore((s) => s.setPage);
    const resetFilters = expenseStore((s) => s.resetFilters);

    /* One effect owns fetching — every filter change flows through here. */
    useEffect(() => {
        if (filters.dateFilter === "custom" && (!filters.dateFrom || !filters.dateTo)) return;

        const t = setTimeout(getExpenseListing, filters.vendor ? 400 : 0);

        return () => clearTimeout(t);
    }, [
        filters.page,
        filters.limit,
        filters.category,
        filters.dateFilter,
        filters.dateFrom,
        filters.dateTo,
        filters.vendor,
        getExpenseListing,
    ]);

    const serial = (idx) => (pagination.page - 1) * PAGE_LIMIT + idx + 1;

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                        Expenses
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {pagination.total} recorded{" "}
                        {pagination.total === 1 ? "expense" : "expenses"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard/create-expense")}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Create expense
                </button>
            </div>

            {/* Summary */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <SummaryCard label="Today" amount={meta.today} />
                <SummaryCard label="Yesterday" amount={meta.yesterday} />
                <SummaryCard label="This week" amount={meta.this_week} />
                <SummaryCard label="This month" amount={meta.this_month} />
                <SummaryCard
                    label={filters.dateFilter ? "Filtered total" : "All time"}
                    amount={meta.totalAmount}
                    accent
                />
            </div>

            {/* Filters */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {DATE_PILLS.map((pill) => {
                        const active = filters.dateFilter === pill.value;
                        return (
                            <button
                                key={pill.label}
                                type="button"
                                onClick={() => setDateFilter(pill.value)}
                                className={[
                                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                    active
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-gray-600 hover:bg-slate-200",
                                ].join(" ")}
                            >
                                {pill.label}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-slate-100 hover:text-gray-900"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={filters.vendor}
                            onChange={(e) => setFilter("vendor", e.target.value)}
                            placeholder="Search by vendor"
                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400"
                        />
                    </div>

                    <CategorySelect
                        value={filters.category}
                        onChange={(id) => setFilter("category", id)}
                        placeholder="All categories"
                        allowClear
                    />

                    {filters.dateFilter === "custom" && (
                        <>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                max={filters.dateTo || undefined}
                                onChange={(e) => setFilter("dateFrom", e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
                            />
                            <input
                                type="date"
                                value={filters.dateTo}
                                min={filters.dateFrom || undefined}
                                onChange={(e) => setFilter("dateTo", e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
                            />
                        </>
                    )}
                </div>

                {filters.dateFilter === "custom" &&
                    (!filters.dateFrom || !filters.dateTo) && (
                        <p className="mt-2 text-xs text-amber-600">
                            Pick both dates to apply the range.
                        </p>
                    )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Quantity</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Purchase date</th>
                                <th className="px-4 py-3 text-right">Price</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-50">
                                        <td colSpan={7} className="px-4 py-4">
                                            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                                        </td>
                                    </tr>
                                ))}

                            {!loading &&
                                expenses.map((expense, idx) => (
                                    <tr
                                        key={expense.id}
                                        className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/60"
                                    >
                                        <td className="px-4 py-3 text-gray-400">{serial(idx)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">
                                                {expense.itemName}
                                            </p>
                                            {expense.notes && (
                                                <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                                                    {expense.notes}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                {expense.category?.name || expense.category || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {expense.quantity
                                                ? `${expense.quantity} ${expense.unit || ""}`.trim()
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {expense.vendor || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(expense.purchaseDate)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {inr(expense.price)}
                                        </td>
                                    </tr>
                                ))}

                            {!loading && expenses.length === 0 && !error && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-14 text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            No expenses here yet
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Record your first one to start tracking spend.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => navigate("/dashboard/create-expense")}
                                            className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Create expense
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-14 text-center">
                                        <p className="text-sm text-red-600">{error}</p>
                                        <button
                                            type="button"
                                            onClick={getExpenseListing}
                                            className="mt-3 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-slate-50"
                                        >
                                            Try again
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setPage(pagination.page - 1)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={!pagination.hasNextPage}
                                onClick={() => setPage(pagination.page + 1)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseListing;
