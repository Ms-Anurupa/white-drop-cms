/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Trash2,
  Users,
} from "lucide-react";
import customerStore from "../../zustand/Store/customerStore";
import { toast } from "react-toastify";
import { useConfirm } from "../../components/ConfirmProvider";
import useDebounce from "../../utils/useDebounce";
import DateFilter from "../../components/DateFilter";
import Loader from "../../components/Loader";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const JOIN_FILTERS = [
  { key: "all", label: "All time", countLabel: "Total customers" },
  { key: "today", label: "Today", countLabel: "Joined today" },
  { key: "week", label: "This week", countLabel: "Joined this week" },
  { key: "month", label: "This month", countLabel: "Joined this month" },
];

const formatDate = (value) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const matchesJoinFilter = (customer, filter) => {
  if (filter === "all") return true;

  const joined = new Date(customer.createdAt);
  if (Number.isNaN(joined.getTime())) return false;

  const now = new Date();

  if (filter === "today") {
    return joined.toDateString() === now.toDateString();
  }

  if (filter === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return joined >= weekAgo;
  }

  if (filter === "month") {
    return (
      joined.getMonth() === now.getMonth() &&
      joined.getFullYear() === now.getFullYear()
    );
  }

  if (filter === "year") {
    return joined.getFullYear() === now.getFullYear();
  }

  return true;
};

const Customer = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [joinFilter, setJoinFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { confirm } = useConfirm();
  const getAllCustomers = customerStore((state) => state.getAllCustomers);
  const customers = customerStore((state) => state.customers);
  const exportCustomerDetails = customerStore(
    (state) => state.exportCustomerDetails,
  );
  const deleteCustomerDetails = customerStore(
    (state) => state.deleteCustomerDetails,
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // true only when the user has picked just one end of the range —
  // in that state we hold off calling the API entirely
  const isPartialDateRange = Boolean(fromDate) !== Boolean(toDate);

  const buildQueryParams = () => ({
    search: debouncedSearch,
    page,
    limit: pageSize,
    fromDate,
    toDate,
  });

  useEffect(() => {
    if (isPartialDateRange) return; // wait for the second date before calling
    const load = async () => {
      try {
        setLoading(true);
        await getAllCustomers(buildQueryParams());
        setPage(1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, fromDate, toDate, getAllCustomers]);

  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };

  const filteredCustomers = useMemo(
    () => customers.filter((c) => matchesJoinFilter(c, joinFilter)),
    [customers, joinFilter],
  );

  const joinCounts = useMemo(
    () => ({
      all: customers.length,
      today: customers.filter((c) => matchesJoinFilter(c, "today")).length,
      week: customers.filter((c) => matchesJoinFilter(c, "week")).length,
      month: customers.filter((c) => matchesJoinFilter(c, "month")).length,
      year: customers.filter((c) => matchesJoinFilter(c, "year")).length,
    }),
    [customers],
  );

  const totalPages = Math.max(
    Math.ceil(filteredCustomers.length / pageSize),
    1,
  );
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filteredCustomers.slice(start, start + pageSize);

  const handleExport = async () => {
    try {
      const file = await exportCustomerDetails();
      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "customers.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Customer data exported successfully");
    } catch {
      toast.error("Failed to export customer details");
    }
  };

  const handleCustomerDelete = async (customerId) => {
    try {
      const confirmMessage = await confirm({
        title: "Delete customer",
        message: "This will permanently delete the customer. Continue?",
      });

      if (!confirmMessage) return;

      await deleteCustomerDetails({ id: customerId });
      if (!isPartialDateRange) {
        await getAllCustomers(buildQueryParams());
      }

      toast.success("Customer deleted");
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    const addRange = (from, to) => {
      for (let i = from; i <= to; i++) pages.push(i);
    };

    if (totalPages <= 7) {
      addRange(1, totalPages);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, currentPage - windowSize);
    const right = Math.min(totalPages - 1, currentPage + windowSize);

    if (left > 2) pages.push("ellipsis-left");
    addRange(left, right);
    if (right < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);

    return pages;
  };

  if (loading) {
    return <Loader text="Loading Customer Details..." />;
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 bg-gray-50 min-h-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Manage customer data, wallets &amp; subscriptions</span>
            <span className="text-blue-600 font-medium">
              {JOIN_FILTERS.find((f) => f.key === joinFilter)?.countLabel}:{" "}
              {joinCounts[joinFilter]}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>

          <button
            onClick={handleExport}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <DateFilter
        filters={JOIN_FILTERS.map((f) => ({ ...f, count: joinCounts[f.key] }))}
        activeFilter={joinFilter}
        onFilterChange={(key) => {
          setJoinFilter(key);
          setPage(1);
        }}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onClear={clearDates}
      />

      {/* ── TABLE CARD — no inner scroll, the page itself scrolls ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* MOBILE VIEW */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <EmptyState />
          ) : (
            paginated.map((c, index) => (
              <div key={c?.userUid} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">
                        #{start + index + 1}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {c?.customer_name ?? "-"}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{c?.phone_num}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full shrink-0">
                    {c?.subscription || "NA"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Wallet balance</p>
                    <p className="font-medium text-gray-800">
                      ₹{c?.wallet_balance ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Joined on</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(c?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center gap-1.5">
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    onClick={() => handleCustomerDelete(c?.userUid)}
                    className="flex-1 py-2 text-xs font-medium rounded-lg border border-red-100 text-red-600 hover:bg-red-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Sl No.",
                  "Name",
                  "Phone number",
                  "Wallet balance",
                  "Joined on",
                  "Subscription",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                paginated.map((c, index) => (
                  <tr key={c?.userUid} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-gray-400">
                      {start + index + 1}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {c?.customer_name ?? "-"}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {c?.phone_num}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      ₹{c?.wallet_balance ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(c?.createdAt)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                        {c?.subscription || "NA"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button
                          title="View customer"
                          className="p-2 cursor-pointer rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="border-t border-gray-100 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              {filteredCustomers.length === 0
                ? "No results"
                : `Showing ${start + 1}–${Math.min(
                    start + pageSize,
                    filteredCustomers.length,
                  )} of ${filteredCustomers.length}`}
            </span>

            <label className="flex items-center gap-1.5">
              <span className="hidden md:inline">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="cursor-pointer text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <PageButton
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              label="First page"
            >
              <ChevronsLeft size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>

            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((p, i) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`min-w-8 h-8 px-1 cursor-pointer rounded-md text-xs font-medium transition ${
                      p === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={`${p}-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs"
                  >
                    …
                  </span>
                ),
              )}
            </div>

            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              label="Last page"
            >
              <ChevronsRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const PageButton = ({ children, onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="w-8 h-8 cursor-pointer rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
    {children}
  </button>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
    <Users size={32} className="text-gray-300" />
    <p className="text-sm font-medium text-gray-500">No customers found</p>
    <p className="text-xs text-gray-400">
      Try adjusting your search or filters
    </p>
  </div>
);

export default Customer;
