/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  MapPin,
  PackageSearch,
  Phone,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import corporateDataStore from "../../zustand/Store/corporateDataStore";

/* ─────────────────────────── constants ─────────────────────────── */

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const NEEDS_REASON = ["REJECTED", "DEACTIVATED"];

const STATUS_META = {
  APPROVED: {
    label: "Approved",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  INREVIEW: {
    label: "In review",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },
  DEACTIVATED: {
    label: "Deactivated",
    pill: "bg-gray-100 text-gray-600 ring-gray-500/20",
    dot: "bg-gray-400",
  },
};

const STATUS_ORDER = ["APPROVED", "INREVIEW", "REJECTED", "DEACTIVATED"];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  ...STATUS_ORDER.map((value) => ({ value, label: STATUS_META[value].label })),
];

const REASON_SUGGESTIONS = {
  REJECTED: ["Incomplete documents", "Invalid GST number", "Duplicate account"],
  DEACTIVATED: [
    "Requested by customer",
    "Inactive account",
    "Policy violation",
  ],
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAddress = (account) =>
  [account.address, account.location?.landmark].filter(Boolean).join(", ");

/* ─────────────────────────── page ─────────────────────────── */

const CorporateAccounts = () => {
  const navigate = useNavigate();

  const getCorporateAccounts = corporateDataStore(
    (state) => state.getCorporateAccounts,
  );
  const accounts = corporateDataStore((state) => state.corporateOrderAcc) || [];
  const updateCorporateStatus = corporateDataStore(
    (state) => state.updateCorporateStatus,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [reasonModal, setReasonModal] = useState(null); // { account, status }
  const [savingId, setSavingId] = useState(null);

  const requestRef = useRef(0);

  const hasAccounts = accounts.length > 0;
  const isFiltered = Boolean(debouncedSearch || status);
  const start = (page - 1) * pageSize;
  const isLastPage = accounts.length < pageSize;

  /* ── debounce search; always return to page 1 ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── single fetch path for every filter / page change ── */
  const fetchAccounts = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);

    try {
      await getCorporateAccounts({
        search: debouncedSearch,
        status,
        page,
        limit: pageSize,
      });
    } catch (error) {
      console.error("Failed to load corporate accounts:", error);
      toast.error("Couldn't load corporate accounts. Try again.");
    } finally {
      // ignore results of superseded requests
      if (requestId === requestRef.current) {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    }
  }, [getCorporateAccounts, debouncedSearch, status, page, pageSize]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /* ── handlers ── */
  const changeStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  const changePageSize = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setPage(1);
  };

  const saveCorporateStatus = async (account, nextStatus, notes) => {
    setSavingId(account.id);
    try {
      await updateCorporateStatus({
        accountId: account.id,
        status: nextStatus,
        notes,
      });
      setReasonModal(null);
      toast.success(
        `${account.businessName} marked ${STATUS_META[nextStatus].label.toLowerCase()}`,
      );
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to update corporate status:", error);
      toast.error("Couldn't update the status. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = (account, nextStatus) => {
    if (account.status === nextStatus) return;
    if (NEEDS_REASON.includes(nextStatus)) {
      setReasonModal({ account, status: nextStatus });
      return;
    }
    saveCorporateStatus(account, nextStatus, "");
  };

  const showSkeleton = loading && !hasLoadedOnce;
  const isRefreshing = loading && hasLoadedOnce;

  return (
    <div className="min-h-full space-y-5 bg-gray-50 px-3 py-6 sm:px-4 lg:p-6">
      {/* ── header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Corporate accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, approve and manage business accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/corporate-accounts/create-corporate-account")
          }
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus size={16} aria-hidden="true" />
          New corporate account
        </button>
      </header>

      {/* ── card ── */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* toolbar */}
        <div className="space-y-3 border-b border-gray-100 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by business, GST or contact"
                aria-label="Search corporate accounts"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Filter by status"
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0"
            >
              {STATUS_FILTERS.map((option) => {
                const active = status === option.value;
                return (
                  <button
                    key={option.value || "all"}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => changeStatusFilter(option.value)}
                    className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                      active
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.value && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_META[option.value].dot}`}
                      />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isFiltered && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                Filtered
                {debouncedSearch && (
                  <>
                    {" "}
                    by{" "}
                    <strong className="font-medium text-gray-700">
                      “{debouncedSearch}”
                    </strong>
                  </>
                )}
                {status && <> · {STATUS_META[status].label}</>}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* loading bar for refetches (table stays visible) */}
        <div className="h-0.5 bg-transparent" aria-hidden="true">
          {isRefreshing && (
            <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] bg-blue-500" />
          )}
        </div>
        <style>{`@keyframes slide{0%{margin-left:-33%}100%{margin-left:100%}}
@media (prefers-reduced-motion: reduce){.animate-\\[slide_1s_ease-in-out_infinite\\]{animation:none}}`}</style>

        <div
          aria-busy={loading}
          className={`transition-opacity ${isRefreshing ? "opacity-60" : ""}`}
        >
          {/* ── mobile cards ── */}
          <div className="divide-y divide-gray-100 lg:hidden">
            {showSkeleton ? (
              <SkeletonCards />
            ) : !hasAccounts ? (
              <EmptyState
                isFiltered={isFiltered}
                onClear={clearFilters}
                onCreate={() =>
                  navigate(
                    "/dashboard/corporate-accounts/create-corporate-account",
                  )
                }
              />
            ) : (
              accounts.map((account) => (
                <article key={account.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-gray-900">
                        {account.businessName}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Serial #{account.serialNumber} · Created{" "}
                        {formatDate(account.createdAt)}
                      </p>
                    </div>
                    <StatusMenu
                      account={account}
                      onChange={handleStatusChange}
                      busy={savingId === account.id}
                    />
                  </div>

                  <dl className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <dt className="w-10 shrink-0 text-xs text-gray-400">
                        GST
                      </dt>
                      <dd className="min-w-0 truncate">
                        <GstValue value={account.gstNo} />
                      </dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="w-10 shrink-0 text-xs text-gray-400">
                        <Phone size={13} aria-label="Contact" />
                      </dt>
                      <dd>
                        <ContactValue value={account.contactNo} />
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <dt className="w-10 shrink-0 pt-0.5 text-xs text-gray-400">
                        <MapPin size={13} aria-label="Address" />
                      </dt>
                      <dd className="min-w-0">
                        {formatAddress(account) || (
                          <span className="text-gray-400">
                            No address on file
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {NEEDS_REASON.includes(account.status) && (
                    <NoteBlock notes={account.notes} />
                  )}
                </article>
              ))
            )}
          </div>

          {/* ── desktop table ── */}
          <div className="hidden max-h-[calc(100vh-22rem)] min-h-[320px] overflow-auto lg:block">
            <table className="w-full min-w-[1000px] table-fixed text-sm">
              <caption className="sr-only">Corporate accounts</caption>
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_theme(colors.gray.100)]">
                <tr className="text-left text-xs font-medium text-gray-500">
                  <th scope="col" className="w-14 px-4 py-3">
                    #
                  </th>
                  <th scope="col" className="w-[30%] px-4 py-3">
                    Business
                  </th>
                  <th scope="col" className="w-44 px-4 py-3">
                    GST number
                  </th>
                  <th scope="col" className="w-40 px-4 py-3">
                    Contact
                  </th>
                  <th scope="col" className="w-40 px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Reason
                  </th>
                  <th scope="col" className="w-32 px-4 py-3">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {showSkeleton ? (
                  <SkeletonRows />
                ) : !hasAccounts ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        isFiltered={isFiltered}
                        onClear={clearFilters}
                        onCreate={() =>
                          navigate(
                            "/dashboard/corporate-accounts/create-corporate-account",
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  accounts.map((account, idx) => {
                    const address = formatAddress(account);
                    return (
                      <tr
                        key={account.id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-4 py-3.5 tabular-nums text-gray-400">
                          {start + idx + 1}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                              <Building2 size={15} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium text-gray-900"
                                title={account.businessName}
                              >
                                {account.businessName}
                              </p>
                              <p
                                className="truncate text-xs text-gray-500"
                                title={address || undefined}
                              >
                                {address || `Serial #${account.serialNumber}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <GstValue value={account.gstNo} />
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <ContactValue value={account.contactNo} />
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusMenu
                            account={account}
                            onChange={handleStatusChange}
                            busy={savingId === account.id}
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          {NEEDS_REASON.includes(account.status) ? (
                            <ReasonCell notes={account.notes} />
                          ) : (
                            <span className="text-gray-300" aria-label="None">
                              —
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-gray-500">
                          {formatDate(account.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── pagination ── */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span aria-live="polite">
              {hasAccounts
                ? `Showing ${start + 1}–${start + accounts.length}`
                : "No results"}
            </span>

            <label className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
                className="cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <nav className="flex items-center gap-2" aria-label="Pagination">
            <span className="text-xs text-gray-500">Page {page}</span>
            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>
            <PageButton
              onClick={() => setPage((p) => p + 1)}
              disabled={isLastPage || loading}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>
          </nav>
        </div>
      </section>

      {reasonModal && (
        <ReasonModal
          account={reasonModal.account}
          status={reasonModal.status}
          saving={savingId !== null}
          onClose={() => setReasonModal(null)}
          onConfirm={(notes) =>
            saveCorporateStatus(reasonModal.account, reasonModal.status, notes)
          }
        />
      )}
    </div>
  );
};

/* ─────────────────────────── status menu ─────────────────────────── */

const StatusMenu = ({ account, onChange, busy }) => {
  const meta = STATUS_META[account.status];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = () => {
    if (open) return setOpen(false);
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = STATUS_ORDER.length * 36 + 8;
    const openUp = window.innerHeight - rect.bottom < menuHeight + 16;
    setPos({
      left: rect.left,
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector("[role=menuitem]")?.focus();

    const close = () => setOpen(false);
    const onMouseDown = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        close();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const onMenuKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...menuRef.current.querySelectorAll("[role=menuitem]")];
    const current = items.indexOf(document.activeElement);
    const next =
      e.key === "ArrowDown"
        ? (current + 1) % items.length
        : (current - 1 + items.length) % items.length;
    items[next].focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Status for ${account.businessName}: ${meta?.label || "Unknown"}. Change status`}
        className={`inline-flex h-7 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait ${
          meta?.pill || "bg-gray-100 text-gray-600 ring-gray-500/20"
        }`}
      >
        {busy ? (
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
        ) : (
          <span
            className={`h-1.5 w-1.5 rounded-full ${meta?.dot || "bg-gray-400"}`}
          />
        )}
        {meta?.label || "Unknown"}
        <ChevronDown size={12} aria-hidden="true" className="opacity-60" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={onMenuKeyDown}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          {STATUS_ORDER.map((value) => {
            const selected = account.status === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onChange(account, value);
                }}
                className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_META[value].dot}`}
                  />
                  {STATUS_META[value].label}
                </span>
                {selected && (
                  <Check
                    size={14}
                    className="text-blue-600"
                    aria-label="Current"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

/* ─────────────────────────── reason modal ─────────────────────────── */

const ReasonModal = ({ account, status, saving, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const isReject = status === "REJECTED";
  const trimmed = reason.trim();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !saving) closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [saving]);

  const submit = (e) => {
    e.preventDefault();
    if (!trimmed || saving) return;
    onConfirm(trimmed);
  };

  const addSuggestion = (text) =>
    setReason((current) =>
      current.trim() ? `${current.trim()}. ${text}` : text,
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reason-title"
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="reason-title"
              className="text-lg font-semibold text-gray-900"
            >
              {isReject ? "Reject account" : "Deactivate account"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a reason for {isReject ? "rejecting" : "deactivating"}{" "}
              <span className="font-medium text-gray-700">
                {account.businessName}
              </span>
              . It's saved with the account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5">
          <label
            htmlFor="account-reason"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Reason
          </label>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {REASON_SUGGESTIONS[status].map((text) => (
              <button
                key={text}
                type="button"
                disabled={saving}
                onClick={() => addSuggestion(text)}
                className="cursor-pointer rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>

          <textarea
            id="account-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(e);
            }}
            placeholder="Explain why this account is being changed"
            rows={4}
            maxLength={1000}
            autoFocus
            disabled={saving}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
          />
          <p className="mt-1 text-right text-xs tabular-nums text-gray-400">
            {reason.length}/1000
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 cursor-pointer rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !trimmed}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving
                ? "Saving…"
                : isReject
                  ? "Reject account"
                  : "Deactivate account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────── small pieces ─────────────────────────── */

const GstValue = ({ value }) => {
  if (!value) return <span className="text-gray-300">—</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("GST number copied");
    } catch {
      toast.error("Couldn't copy the GST number");
    }
  };

  return (
    <span className="group inline-flex max-w-full items-center gap-1.5">
      <span className="truncate font-mono text-[13px] text-gray-700">
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy GST number ${value}`}
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
      >
        <Copy size={12} />
      </button>
    </span>
  );
};

const ContactValue = ({ value }) =>
  value ? (
    <a
      href={`tel:${value}`}
      className="text-gray-700 hover:text-blue-600 hover:underline"
    >
      {value}
    </a>
  ) : (
    <span className="text-gray-300">—</span>
  );

const NoteBlock = ({ notes }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs font-medium text-gray-500">Reason</p>
    <p className="mt-1 break-words text-sm text-gray-700">
      {notes || "No reason provided"}
    </p>
  </div>
);

const PageButton = ({ children, onClick, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

const EmptyState = ({ isFiltered, onClear, onCreate }) => {
  const Icon = isFiltered ? SearchX : PackageSearch;
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {isFiltered ? "No matching accounts" : "No corporate accounts yet"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {isFiltered
            ? "Try a different search term or status."
            : "Create the first corporate account to get started."}
        </p>
      </div>
      {isFiltered ? (
        <button
          type="button"
          onClick={onClear}
          className="h-9 cursor-pointer rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={14} />
          New corporate account
        </button>
      )}
    </div>
  );
};

const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-100 ${className}`} />
);

const SkeletonRows = () =>
  Array.from({ length: 6 }).map((_, i) => (
    <tr key={i}>
      <td className="px-4 py-4">
        <Bar className="h-3 w-5" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Bar className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Bar className="h-3 w-40" />
            <Bar className="h-2.5 w-52" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Bar className="h-3 w-28" />
      </td>
      <td className="px-4 py-4">
        <Bar className="h-3 w-24" />
      </td>
      <td className="px-4 py-4">
        <Bar className="h-6 w-24 rounded-full" />
      </td>
      <td className="px-4 py-4">
        <Bar className="h-3 w-32" />
      </td>
      <td className="px-4 py-4">
        <Bar className="h-3 w-20" />
      </td>
    </tr>
  ));

const SkeletonCards = () =>
  Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="space-y-3 p-4">
      <div className="flex justify-between gap-3">
        <div className="space-y-1.5">
          <Bar className="h-3.5 w-40" />
          <Bar className="h-2.5 w-32" />
        </div>
        <Bar className="h-6 w-20 rounded-full" />
      </div>
      <Bar className="h-3 w-48" />
      <Bar className="h-3 w-36" />
    </div>
  ));

  const ReasonCell = ({ notes }) => {
    const textRef = useRef(null);
    const closeTimer = useRef(null);
    const [pop, setPop] = useState(null); // { left, top } or { left, bottom }

    const open = () => {
      clearTimeout(closeTimer.current);
      const el = textRef.current;
      // Only show the popover when the text is actually cut off
      if (!el || el.scrollHeight <= el.clientHeight + 1) return;

      const rect = el.getBoundingClientRect();
      const width = 320;
      const margin = 12;
      const left = Math.min(
        Math.max(rect.left, margin),
        window.innerWidth - width - margin,
      );
      const spaceBelow = window.innerHeight - rect.bottom;

      setPop(
        spaceBelow > 220
          ? { left, top: rect.bottom + 8 }
          : { left, bottom: window.innerHeight - rect.top + 8 },
      );
    };

    // small delay so the pointer can move from the text into the popover
    const scheduleClose = () => {
      closeTimer.current = setTimeout(() => setPop(null), 120);
    };

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    useEffect(() => {
      if (!pop) return;
      const close = () => setPop(null);
      const onKeyDown = (e) => e.key === "Escape" && close();
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("scroll", close, true);
        window.removeEventListener("resize", close);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [pop]);

    if (!notes) {
      return <span className="text-sm text-gray-400">No reason provided</span>;
    }

    return (
      <>
        <p
          ref={textRef}
          tabIndex={0}
          onMouseEnter={open}
          onMouseLeave={scheduleClose}
          onFocus={open}
          onBlur={scheduleClose}
          className="line-clamp-2 cursor-default break-words rounded text-sm text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {notes}
        </p>

        {pop && (
          <div
            role="tooltip"
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
            style={{ left: pop.left, top: pop.top, bottom: pop.bottom }}
            className="fixed z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
          >
            <p className="mb-1.5 text-xs font-medium text-gray-500">Reason</p>
            <p className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
              {notes}
            </p>
          </div>
        )}
      </>
    );
  };

export default CorporateAccounts;
