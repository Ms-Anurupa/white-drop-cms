import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  TrendingUp,
  ShoppingBag,
  Building2,
  Store,
  ClipboardList,
  RefreshCw,
  X,
  IndianRupee,
} from "lucide-react";

const Sales = () => {
  const [search, setSearch] = useState("");
  const [saleType, setSaleType] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const salesData = [
    {
      id: "clx001sales",
      saleDate: "2026-09-14T10:30:00",
      saleValue: 12500,
      saleType: "CORPORATE",
      details: {
        customer: "ABC Technologies Pvt Ltd",
        items: 24,
        paymentMode: "ONLINE",
      },
      refId: "ORD-20260914-001",
    },
    {
      id: "clx002sales",
      saleDate: "2026-09-14T11:15:00",
      saleValue: 2450,
      saleType: "RETAIL",
      details: {
        customer: "Rahul Sharma",
        items: 6,
        paymentMode: "COD",
      },
      refId: "ORD-20260914-002",
    },
    {
      id: "clx003sales",
      saleDate: "2026-09-14T12:05:00",
      saleValue: 5800,
      saleType: "ADHOC",
      details: {
        customer: "Walk-in Customer",
        items: 12,
        paymentMode: "ONLINE",
      },
      refId: "ADH-20260914-001",
    },
    {
      id: "clx004sales",
      saleDate: "2026-09-13T09:45:00",
      saleValue: 8999,
      saleType: "SUBSCRIPTION",
      details: {
        customer: "Green Valley Apartments",
        items: 30,
        paymentMode: "ONLINE",
      },
      refId: "SUB-20260913-001",
    },
    {
      id: "clx005sales",
      saleDate: "2026-09-13T13:20:00",
      saleValue: 4200,
      saleType: "RETAIL",
      details: {
        customer: "Priya Das",
        items: 10,
        paymentMode: "COD",
      },
      refId: "ORD-20260913-004",
    },
    {
      id: "clx006sales",
      saleDate: "2026-09-12T10:10:00",
      saleValue: 18500,
      saleType: "CORPORATE",
      details: {
        customer: "MIPL Industries",
        items: 42,
        paymentMode: "ONLINE",
      },
      refId: "COR-20260912-003",
    },
    {
      id: "clx007sales",
      saleDate: "2026-09-12T16:40:00",
      saleValue: 1650,
      saleType: "ADHOC",
      details: {
        customer: "Special Order Customer",
        items: 4,
        paymentMode: "COD",
      },
      refId: "ADH-20260912-002",
    },
    {
      id: "clx008sales",
      saleDate: "2026-09-11T11:25:00",
      saleValue: 7200,
      saleType: "SUBSCRIPTION",
      details: {
        customer: "Lake View Residency",
        items: 25,
        paymentMode: "ONLINE",
      },
      refId: "SUB-20260911-002",
    },
    {
      id: "clx009sales",
      saleDate: "2026-09-11T14:30:00",
      saleValue: 3150,
      saleType: "RETAIL",
      details: {
        customer: "Sourav Roy",
        items: 8,
        paymentMode: "COD",
      },
      refId: "ORD-20260911-008",
    },
    {
      id: "clx010sales",
      saleDate: "2026-09-10T10:15:00",
      saleValue: 15200,
      saleType: "CORPORATE",
      details: {
        customer: "Orion Enterprises",
        items: 36,
        paymentMode: "ONLINE",
      },
      refId: "COR-20260910-001",
    },
    {
      id: "clx011sales",
      saleDate: "2026-09-10T15:10:00",
      saleValue: 2750,
      saleType: "RETAIL",
      details: {
        customer: "Ananya Sen",
        items: 7,
        paymentMode: "COD",
      },
      refId: "ORD-20260910-012",
    },
    {
      id: "clx012sales",
      saleDate: "2026-09-09T12:50:00",
      saleValue: 6400,
      saleType: "ADHOC",
      details: {
        customer: "Special Order Customer",
        items: 15,
        paymentMode: "ONLINE",
      },
      refId: "ADH-20260909-004",
    },
  ];

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    const parsedDate = new Date(date);

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getSaleTypeClass = (type) => {
    switch (type) {
      case "CORPORATE":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "RETAIL":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "ADHOC":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "SUBSCRIPTION":
        return "border-violet-200 bg-violet-50 text-violet-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const getSaleTypeIcon = (type) => {
    switch (type) {
      case "CORPORATE":
        return Building2;

      case "RETAIL":
        return Store;

      case "ADHOC":
        return ClipboardList;

      case "SUBSCRIPTION":
        return RefreshCw;

      default:
        return ShoppingBag;
    }
  };

  const filteredSales = useMemo(() => {
    let result = [...salesData];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((sale) => {
        return (
          sale.refId?.toLowerCase().includes(searchValue) ||
          sale.saleType?.toLowerCase().includes(searchValue) ||
          sale.details?.customer?.toLowerCase().includes(searchValue)
        );
      });
    }

    if (saleType !== "ALL") {
      result = result.filter((sale) => sale.saleType === saleType);
    }

    if (dateFilter === "TODAY") {
      result = result.filter((sale) => sale.saleDate.startsWith("2026-09-14"));
    }

    if (dateFilter === "YESTERDAY") {
      result = result.filter((sale) => sale.saleDate.startsWith("2026-09-13"));
    }

    return result;
  }, [search, saleType, dateFilter]);

  const totalSales = salesData.reduce((sum, sale) => sum + sale.saleValue, 0);

  const totalTransactions = salesData.length;

  const corporateSales = salesData
    .filter((sale) => sale.saleType === "CORPORATE")
    .reduce((sum, sale) => sum + sale.saleValue, 0);

  const retailSales = salesData
    .filter((sale) => sale.saleType === "RETAIL")
    .reduce((sum, sale) => sum + sale.saleValue, 0);

  const adhocSales = salesData
    .filter((sale) => sale.saleType === "ADHOC")
    .reduce((sum, sale) => sum + sale.saleValue, 0);

  const subscriptionSales = salesData
    .filter((sale) => sale.saleType === "SUBSCRIPTION")
    .reduce((sum, sale) => sum + sale.saleValue, 0);

  const clearFilters = () => {
    setSearch("");
    setSaleType("ALL");
    setDateFilter("ALL");
    setPage(1);
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-4 lg:p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <TrendingUp size={19} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Sales
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Track and monitor sales across all channels.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <CalendarDays size={16} />
          Sales Report
        </button>
      </div>

      {/* Main Sales Card */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
          {/* Total Sales */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                    Total Sales
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <IndianRupee size={20} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-600">
                  <TrendingUp size={12} />
                  12.4%
                </span>

                <span>vs previous period</span>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-100/50" />
            <div className="absolute -bottom-14 right-20 h-28 w-28 rounded-full bg-blue-100/40" />
          </div>

          {/* Transactions */}
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Transactions
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {totalTransactions}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total recorded sales
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ShoppingBag size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Type Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Corporate */}
        <button
          type="button"
          onClick={() => {
            setSaleType(saleType === "CORPORATE" ? "ALL" : "CORPORATE");
            setPage(1);
          }}
          className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            saleType === "CORPORATE"
              ? "border-blue-400 ring-2 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 size={17} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Corporate
            </span>
          </div>

          <p className="mt-4 text-lg font-bold text-slate-900">
            {formatCurrency(corporateSales)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Corporate sales</p>
        </button>

        {/* Retail */}
        <button
          type="button"
          onClick={() => {
            setSaleType(saleType === "RETAIL" ? "ALL" : "RETAIL");
            setPage(1);
          }}
          className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            saleType === "RETAIL"
              ? "border-emerald-400 ring-2 ring-emerald-100"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Store size={17} />
            </div>

            <span className="text-xs font-medium text-slate-400">Retail</span>
          </div>

          <p className="mt-4 text-lg font-bold text-slate-900">
            {formatCurrency(retailSales)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Retail sales</p>
        </button>

        {/* Adhoc */}
        <button
          type="button"
          onClick={() => {
            setSaleType(saleType === "ADHOC" ? "ALL" : "ADHOC");
            setPage(1);
          }}
          className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            saleType === "ADHOC"
              ? "border-orange-400 ring-2 ring-orange-100"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <ClipboardList size={17} />
            </div>

            <span className="text-xs font-medium text-slate-400">Adhoc</span>
          </div>

          <p className="mt-4 text-lg font-bold text-slate-900">
            {formatCurrency(adhocSales)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Adhoc sales</p>
        </button>

        {/* Subscription */}
        <button
          type="button"
          onClick={() => {
            setSaleType(saleType === "SUBSCRIPTION" ? "ALL" : "SUBSCRIPTION");
            setPage(1);
          }}
          className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            saleType === "SUBSCRIPTION"
              ? "border-violet-400 ring-2 ring-violet-100"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <RefreshCw size={17} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              Subscription
            </span>
          </div>

          <p className="mt-4 text-lg font-bold text-slate-900">
            {formatCurrency(subscriptionSales)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Subscription sales</p>
        </button>
      </div>

      {/* Filters + Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filter Header */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by reference, customer or type..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={saleType}
                  onChange={(e) => {
                    setSaleType(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-44"
                >
                  <option value="ALL">All Sale Types</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="RETAIL">Retail</option>
                  <option value="ADHOC">Adhoc</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                </select>
              </div>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-40"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                </select>
              </div>

              {(search || saleType !== "ALL" || dateFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sale Date
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Reference
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sale Type
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Items
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sale Value
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const TypeIcon = getSaleTypeIcon(sale.saleType);

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                    >
                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {formatDate(sale.saleDate)}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatTime(sale.saleDate)}
                        </p>
                      </td>

                      {/* Reference */}
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-slate-700">
                          {sale.refId}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {sale.id}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getSaleTypeClass(
                            sale.saleType,
                          )}`}
                        >
                          <TypeIcon size={12} />
                          {sale.saleType}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {sale.details?.customer || "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {sale.details?.paymentMode || "-"}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {sale.details?.items || 0}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-800">
                          {formatCurrency(sale.saleValue)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View sale"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <ShoppingBag size={22} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No sales found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredSales.length > 0 ? 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {filteredSales.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredSales.length}
            </span>{" "}
            sales
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronsLeft size={15} />
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white"
            >
              {page}
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
