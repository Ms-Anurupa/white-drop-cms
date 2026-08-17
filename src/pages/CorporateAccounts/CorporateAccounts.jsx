/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Search,
  Building2,
  Eye,
  MapPin,
  Phone,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import corporateDataStore from "../../zustand/Store/corporateDataStore";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SplitButton, SplitButtonItem } from "../../components/SplitButton"; 

const ACCOUNT_STATUS_VARIANT = {
  APPROVED: "success",
  INREVIEW: "warning",
  REJECTED: "danger",
};

const ACCOUNT_STATUS_DOT = {
  APPROVED: "bg-green-500",
  INREVIEW: "bg-yellow-500",
  REJECTED: "bg-red-500",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_STYLES = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  INREVIEW: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700",
  DEACTIVATED: "bg-gray-100 text-gray-600",
};

const STATUS_DOT = {
  APPROVED: "bg-emerald-500",
  INREVIEW: "bg-amber-500",
  REJECTED: "bg-red-500",
  DEACTIVATED: "bg-gray-400",
};

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "APPROVED", label: "Approved" },
  { value: "INREVIEW", label: "In Review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const ACCOUNT_STATUS_OPTIONS = [
  "APPROVED",
  "INREVIEW",
  "REJECTED",
  "DEACTIVATED",
];
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CorporateAccounts = () => {
  const getCorporateAccounts = corporateDataStore(
    (state) => state.getCorporateAccounts,
  );
  const corporateOrderAcc = corporateDataStore(
    (state) => state.corporateOrderAcc,
  );
  const updateCorporateStatus = corporateDataStore(
    (state) => state.updateCorporateStatus,
  );
  const loading = corporateDataStore((state) => state.loading);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [localAccounts, setLocalAccounts] = useState([]);
  const [hoveredAccount, setHoveredAccount] = useState(null); // { account, anchor }
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setLocalAccounts(corporateOrderAcc || []);
  }, [corporateOrderAcc]);

  const accounts = localAccounts;
  const hasAccounts = accounts.length > 0;
  const start = (page - 1) * pageSize;
  const isLastPage = accounts.length < pageSize;

  const showAddressPopover = (e, account) => {
    const anchor = e.currentTarget.getBoundingClientRect();
    setPopoverPos(null);
    setHoveredAccount({ account, anchor });
  };

  const hideAddressPopover = () => {
    setHoveredAccount(null);
    setPopoverPos(null);
  };

  useLayoutEffect(() => {
    if (!hoveredAccount || !popoverRef.current) return;

    const { anchor } = hoveredAccount;
    const { width, height } = popoverRef.current.getBoundingClientRect();
    const margin = 12;
    const gap = 8;

    let left = anchor.left;
    if (left + width + margin > window.innerWidth) {
      left = window.innerWidth - width - margin;
    }
    left = Math.max(left, margin);

    const spaceBelow = window.innerHeight - anchor.bottom;
    const spaceAbove = anchor.top;

    let top;
    if (spaceBelow >= height + gap + margin || spaceBelow >= spaceAbove) {
      top = anchor.bottom + gap;
      top = Math.min(top, window.innerHeight - margin - height);
    } else {
      top = anchor.top - height - gap;
    }
    top = Math.max(top, margin);

    setPopoverPos({ top, left });
  }, [hoveredAccount]);

  // debounced fetch on search / status / pageSize change — resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      getCorporateAccounts({
        search,
        status,
        page: 1,
        limit: pageSize,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [getCorporateAccounts, search, status, pageSize]);

  // plain page-change fetch
  useEffect(() => {
    getCorporateAccounts({
      search,
      status,
      page,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusChange = async (account, status) => {
    // Save old status in case API fails
    const previousStatus = account.status;

    // Optimistic UI update
    setLocalAccounts((prev) =>
      prev.map((item) => (item.id === account.id ? { ...item, status } : item)),
    );

    try {
      await updateCorporateStatus({
        accountId: account.id,
        status,
      });

      toast.success("Status updated");

      // Optional: fetch latest data from server
      getCorporateAccounts({
        search,
        status: "",
        page,
        limit: pageSize,
      });
    } catch (error) {
      // Roll back on failure
      setLocalAccounts((prev) =>
        prev.map((item) =>
          item.id === account.id ? { ...item, status: previousStatus } : item,
        ),
      );

      toast.error("Failed to update status");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  if (loading) return <Loader text="Loading corporate accounts..." />;

  return (
    <div className="py-6 sm:px-2 lg:p-6 space-y-2 bg-gray-50">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Corporate Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all corporate accounts
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:ml-auto">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, GST, contact..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-white border border-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <button
            onClick={() =>
              navigate("/dashboard/corporate-accounts/create-corporate-account")
            }
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg
      bg-blue-600 text-white text-sm font-medium hover:bg-blue-700
      transition whitespace-nowrap cursor-pointer shrink-0"
          >
            <Building2 size={16} />
            Create Corporate Account
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* MOBILE VIEW */}
        <div className="block lg:hidden divide-y divide-gray-100">
          {!hasAccounts ? (
            <EmptyState />
          ) : (
            accounts.map((account, idx) => (
              <div key={account.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">
                        #{start + idx + 1}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {account.businessName}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Serial #{account.serialNumber}
                    </p>
                  </div>
                  <StatusPill status={account.status} />
                </div>

                <div className="mt-3 text-xs text-gray-500 leading-relaxed space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-700">GST:</span>
                    {account.gstNo || "-"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} className="shrink-0" />
                    {account.contactNo || "-"}
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>
                      {[account.address, account.location?.landmark]
                        .filter(Boolean)
                        .join(", ") || "No address on file"}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Created {formatDate(account.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-fixed text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Sl No.
                </th>
                <th className="w-64 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Business
                </th>
                <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  GST No.
                </th>
                <th className="w-36 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Contact
                </th>
                <th className="w-36 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Status
                </th>
                <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Created
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {!hasAccounts ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                accounts.map((account, idx) => (
                  <tr key={account.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-gray-400">
                      {start + idx + 1}
                    </td>

                    <td
                      className="px-4 py-3.5 cursor-default"
                      onMouseEnter={(e) => showAddressPopover(e, account)}
                      onMouseLeave={hideAddressPopover}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building2
                          size={13}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="font-medium text-gray-900 truncate">
                          {account.businessName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        Serial #{account.serialNumber}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 truncate">
                      {account.gstNo || "-"}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {account.contactNo || "-"}
                    </td>

                    <td className="px-4 py-3.5">
                      <AccountStatusSelect
                        account={account}
                        onChange={handleStatusChange}
                        className="w-32"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(account.createdAt)}
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
              {accounts.length === 0
                ? "No results"
                : `Showing ${start + 1}–${start + accounts.length}`}
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Page {page}</span>

            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage((p) => p + 1)}
              disabled={isLastPage}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>

      {/* ADDRESS POPOVER */}
      {hoveredAccount && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-72 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2 pointer-events-none transition-opacity duration-100"
          style={
            popoverPos
              ? { top: popoverPos.top, left: popoverPos.left, opacity: 1 }
              : { top: 0, left: 0, opacity: 0 }
          }
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Registered address
          </p>
          <p className="text-sm font-medium text-gray-900">
            {hoveredAccount.account.businessName}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {hoveredAccount.account.contactNo}
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {[
              hoveredAccount.account.address,
              hoveredAccount.account.location?.landmark,
            ]
              .filter(Boolean)
              .join(", ") || "No address details available"}
          </p>
        </div>
      )}
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

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        STATUS_DOT[status] || "bg-gray-400"
      }`}
    />
    {status || "UNKNOWN"}
  </span>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
    <PackageSearch size={32} className="text-gray-300" />
    <p className="text-sm font-medium text-gray-500">
      No corporate accounts found
    </p>
    <p className="text-xs text-gray-400">
      Try adjusting your search or filters
    </p>
  </div>
);


const AccountStatusSelect = ({
  account,
  onChange,
  disabled,
  className = "w-32",
}) => {
  const variant = ACCOUNT_STATUS_VARIANT[account.status] || "neutral";
  const dot = ACCOUNT_STATUS_DOT[account.status] || "bg-gray-400";

  return (
    <SplitButton
      variant={variant}
      disabled={disabled}
      className={className}
      onClick={() => {}}
      menuContent={
        <>
          {ACCOUNT_STATUS_OPTIONS.map((status) => (
            <SplitButtonItem
              key={status}
              onClick={() => onChange(account, status)}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ACCOUNT_STATUS_DOT[status] || "bg-gray-400"
                    }`}
                  />
                  <span>{status}</span>
                </div>
                {account.status === status && (
                  <span className="text-blue-600">✓</span>
                )}
              </div>
            </SplitButtonItem>
          ))}
        </>
      }
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span>{account.status}</span>
      </div>
    </SplitButton>
  );
};

export default CorporateAccounts;
