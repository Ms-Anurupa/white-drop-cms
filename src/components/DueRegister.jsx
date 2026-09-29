import useDueRegisterStore from "@/zustand/Store/dueRegisterStore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw
} from "lucide-react";
const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const monthLabel = (month) => {
  if (!month) return "—";

  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAccountName = (row) => {
  if (row?.userId) {
    return row?.user?.customer_name || "Unknown customer";
  }

  if (row?.corpoAccId) {
    return row?.corpAcc?.businessName || "Unknown company";
  }

  return "Unknown account";
};

const getAccountId = (row) => {
  if (row?.userId) {
    return row?.user?.phone_num || row.userId;
  }

  if (row?.corpoAccId) {
    return row?.corpAcc?.contactNo || row.corpoAccId;
  }

  return "—";
};

const getAccountType = (row) => {
  if (row?.userId) return "USER";
  if (row?.corpoAccId) return "CORPORATE";
  return "UNKNOWN";
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "?";

  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const normalizeRow = (row) => {
  const currentDue = Number(row?.currentMonthDue ?? row?.dueAmount ?? 0);

  const previousDue = Number(row?.previousMonthDue ?? 0);

  const cumulativeDue = Number(
    row?.cumulativeDueAmount ?? previousDue + currentDue,
  );

  return {
    ...row,

    displayName: getAccountName(row),
    displayId: getAccountId(row),
    accountType: getAccountType(row),

    currentDue,
    previousDue,
    cumulativeDue,
  };
};

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),

  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </>
  ),

  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),

  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),

  left: <path d="m15 18-6-6 6-6" />,

  right: <path d="m9 18 6-6-6-6" />,

  up: <path d="m6 15 6-6 6 6" />,

  down: <path d="m6 9 6 6 6-6" />,

  sort: (
    <>
      <path d="m8 10 4-4 4 4" />
      <path d="m8 14 4 4 4-4" />
    </>
  ),

  send: (
    <>
      <path d="M21 3 10 14" />
      <path d="M21 3 14 21l-4-7-7-4z" />
    </>
  ),
};

const Icon = ({ name, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

const SortButton = ({ field, label, sortBy, sortOrder, onSort }) => {
  const active = sortBy === field;

  return (
    <button
      type="button"
      className={`dt-sortbtn ${active ? "active" : ""}`}
      onClick={() => onSort(field)}
    >
      <span>{label}</span>

      <Icon
        name={active ? (sortOrder === "asc" ? "up" : "down") : "sort"}
        size={13}
      />
    </button>
  );
};

const TypeBadge = ({ type }) => {
  if (type === "USER") {
    return <span className="dt-type user">Customer</span>;
  }

  if (type === "CORPORATE") {
    return <span className="dt-type corporate">Corporate</span>;
  }

  return <span className="dt-type">—</span>;
};

const AmountCell = ({ value, max }) => {
  const amount = Number(value) || 0;

  const ratio = max > 0 ? Math.min(1, Math.max(0, amount / max)) : 0;

  const level =
    amount <= 0 ? "zero" : ratio > 0.66 ? "high" : ratio > 0.33 ? "mid" : "low";

  return (
    <div className="dt-amount">
      <strong className={amount <= 0 ? "zero" : ""}>{inr(amount)}</strong>

      <span className="dt-amount-bar">
        <i className={level} style={{ width: `${ratio * 100}%` }} />
      </span>
    </div>
  );
};

export default function DueTrackerPro({
  onOpenAccount,
  onSendReminder,
  onRecordPayment,
  theme = "auto",
}) {
  const {
    rows,
    pagination,
    filters,
    loading,
    error,

    fetchDueRegister,

    manuallySyncDues,

    setMonth,
    setType,
    setSearch,
    setLimit,
    setSort,

    nextPage,
    previousPage,
  } = useDueRegisterStore();

  const { month, type, search, page, limit, sortBy, sortOrder } = filters;

  const [query, setQuery] = useState(search || "");
  const [selected, setSelected] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [density, setDensity] = useState("comfortable");
  const [toast, setToast] = useState(null);

  const searchRef = useRef(null);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocusRef = useRef(null);

  const normalizedRows = useMemo(() => rows.map(normalizeRow), [rows]);

  const activeRow = useMemo(
    () => normalizedRows.find((row) => row.id === activeId) || null,
    [normalizedRows, activeId],
  );

  const maxCurrentDue = useMemo(
    () => Math.max(1, ...normalizedRows.map((row) => row.currentDue)),
    [normalizedRows],
  );

  const pageCurrentTotal = useMemo(
    () => normalizedRows.reduce((sum, row) => sum + row.currentDue, 0),
    [normalizedRows],
  );

  const pagePreviousTotal = useMemo(
    () => normalizedRows.reduce((sum, row) => sum + row.previousDue, 0),
    [normalizedRows],
  );

  const pageCumulativeTotal = useMemo(
    () => normalizedRows.reduce((sum, row) => sum + row.cumulativeDue, 0),
    [normalizedRows],
  );

  const selectedRows = useMemo(
    () => normalizedRows.filter((row) => selected.has(row.id)),
    [normalizedRows, selected],
  );

  const selectedTotal = useMemo(
    () => selectedRows.reduce((sum, row) => sum + row.currentDue, 0),
    [selectedRows],
  );

  const allOnPage =
    normalizedRows.length > 0 &&
    normalizedRows.every((row) => selected.has(row.id));

  const someOnPage = normalizedRows.some((row) => selected.has(row.id));

  // True while the user's typing hasn't been sent to the server yet (debounce) or is loading
  const searching = query.trim() !== (search || "") || (loading && !!search);

  const notify = (message, tone = "ok") => {
    setToast({
      message,
      tone,
    });
  };

  /*
   * Initial API call
   */
  useEffect(() => {
    fetchDueRegister();
  }, []);

  /*
   * Debounced search
   */
  useEffect(() => {
    const currentSearch = search || "";

    if (query === currentSearch) {
      return;
    }

    const timer = setTimeout(() => {
      setSearch(query.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [query, search, setSearch]);

  /*
   * Fetch whenever server-side filters change.
   *
   * The initial request is handled separately above.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDueRegister();
    }, 0);

    return () => clearTimeout(timer);
  }, [month, type, search, page, limit, sortBy, sortOrder]);

  /*
   * Clear selected rows whenever server-side page/filter changes.
   */
  useEffect(() => {
    setSelected(new Set());
    setActiveId(null);
  }, [month, type, search, page, limit, sortBy, sortOrder]);

  /*
   * Keep local search synchronized with store.
   */
  useEffect(() => {
    setQuery(search || "");
  }, [search]);

  /*
   * Toast auto-hide
   */
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "/" &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape" && activeId) {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId]);

  const handleTypeChange = (value) => {
    setType(value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSort = (field) => {
    setSort(field);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
  };

  const handleRefresh = async () => {
    try {
      await fetchDueRegister();
      notify("Due register refreshed");
    } catch {
      notify("Unable to refresh due register", "error");
    }
  };

  const handleResync = async () => {
    try {
      await manuallySyncDues();
      await fetchDueRegister();
      notify("Due register resynced");
    } catch {
      notify("Unable to refresh due register", "error");
    }
  };

  const toggleRow = (id) => {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const togglePage = () => {
    setSelected((current) => {
      const next = new Set(current);

      if (allOnPage) {
        normalizedRows.forEach((row) => {
          next.delete(row.id);
        });
      } else {
        normalizedRows.forEach((row) => {
          next.add(row.id);
        });
      }

      return next;
    });
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const openDrawer = (row, element) => {
    lastFocusRef.current = element;
    setActiveId(row.id);
  };

  const closeDrawer = () => {
    setActiveId(null);

    requestAnimationFrame(() => {
      lastFocusRef.current?.focus?.();
    });
  };

  const handleReminder = async (rowsToRemind) => {
    if (!onSendReminder) {
      notify("Send reminder action is not configured", "error");
      return;
    }

    try {
      await onSendReminder(rowsToRemind);

      notify(
        `Reminder sent for ${rowsToRemind.length} ${
          rowsToRemind.length === 1 ? "account" : "accounts"
        }`,
      );
    } catch (err) {
      notify(err?.message || "Unable to send reminder", "error");
    }
  };

  const handleRecordPayment = (row) => {
    if (!onRecordPayment) {
      notify("Record payment action is not configured", "error");
      return;
    }

    onRecordPayment(row);
  };

  const handleOpenAccount = (row) => {
    if (!onOpenAccount) {
      notify("Open account action is not configured", "error");
      return;
    }

    onOpenAccount(row);
  };

  const exportCsv = () => {
    const exportRows = selectedRows.length > 0 ? selectedRows : normalizedRows;

    if (!exportRows.length) {
      notify("There are no rows to export", "error");
      return;
    }

    const header = [
      "Account Type",
      "Account",
      "Account ID",
      "Month",
      "Current Due",
      "Previous Due",
      "Cumulative Due",
      "Created At",
      "Updated At",
    ];

    const body = exportRows.map((row) =>
      [
        row.accountType,
        row.displayName,
        row.displayId,
        row.month,
        row.currentDue,
        row.previousDue,
        row.cumulativeDue,
        row.createdAt || "",
        row.updatedAt || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = [header.join(","), ...body].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `due-register-${month}-${type}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    notify(
      `Exported ${exportRows.length} ${
        exportRows.length === 1 ? "row" : "rows"
      }`,
    );
  };

  const resetSearch = () => {
    setQuery("");
    setSearch("");
    searchRef.current?.focus();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      if (query) {
        event.preventDefault();
        event.stopPropagation();
        resetSearch();
      } else {
        searchRef.current?.blur();
      }
    }

    // Enter applies the search immediately without waiting for the debounce
    if (event.key === "Enter") {
      event.preventDefault();
      setSearch(query.trim());
    }
  };

  const trapDrawerTab = (event) => {
    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }

    const elements = [
      ...drawerRef.current.querySelectorAll(
        "button,input,select,textarea,a,[tabindex]:not([tabindex='-1'])",
      ),
    ].filter((element) => !element.disabled);

    if (!elements.length) return;

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (activeId) {
      requestAnimationFrame(() => {
        closeRef.current?.focus();
      });
    }
  }, [activeId]);

  const currentStart =
    pagination.totalRecords === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1;

  const currentEnd =
    pagination.totalRecords === 0
      ? 0
      : Math.min(
          pagination.currentPage * pagination.pageSize,
          pagination.totalRecords,
        );

  return (
    <section className="dt" data-theme={theme}>
      <style>{CSS}</style>

      {/* HEADER */}
      <header className="dt-head">
        <div>
          <div className="dt-title-row">
            <h2>Due Register</h2>
            <span className="dt-record-count">
              {pagination.totalRecords} records
            </span>
          </div>

          <p className="dt-lead">
            Track current, previous and cumulative outstanding dues for{" "}
            <strong>{monthLabel(month)}</strong>.
          </p>
        </div>

        <div className="dt-actions flex flex-wrap items-center gap-3">
          <label className="dt-field">
            <span className="dt-sr">Month</span>
            <input type="month" value={month} onChange={handleMonthChange} />
          </label>

          <button
            type="button"
            className="dt-btn flex-row"
            onClick={handleResync}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh"
          >
            <span className="flex items-center justify-center gap-2 whitespace-nowrap">
              <RefreshCw size={18} className={loading ? "dt-spin" : ""} />
              {loading ? "Resyncing..." : "Resync"}
            </span>
          </button>

          <button
            type="button"
            className="dt-btn icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh"
          >
            <span className={loading ? "dt-spin" : ""}>
              <Icon name="refresh" />
            </span>
          </button>

          <button
            type="button"
            className="dt-btn primary"
            onClick={exportCsv}
            disabled={loading || normalizedRows.length === 0}
          >
            <Icon name="download" />
            {selected.size > 0 ? `Export ${selected.size}` : "Export"}
          </button>
        </div>
      </header>

      {/* ACCOUNT TYPE */}
      <div className="dt-tabs" role="tablist" aria-label="Account type">
        {[
          ["ALL", "All accounts"],
          ["USER", "Customers"],
          ["CORPORATE", "Corporate"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={type === value}
            className={type === value ? "on" : ""}
            onClick={() => handleTypeChange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="dt-summary-grid">
        <div className="dt-card dt-summary-card highlight">
          <span className="dt-label">Cumulative due</span>

          <strong>{loading ? "—" : inr(pageCumulativeTotal)}</strong>

          <small>Previous + current due on this page</small>
        </div>

        <div className="dt-card dt-summary-card">
          <span className="dt-label">
            <i className="dt-dot current" />
            Current month
          </span>

          <strong>{loading ? "—" : inr(pageCurrentTotal)}</strong>

          <small>{pagination.pageSize} records per page</small>
        </div>

        <div className="dt-card dt-summary-card">
          <span className="dt-label">
            <i className="dt-dot previous" />
            Previous dues
          </span>

          <strong>{loading ? "—" : inr(pagePreviousTotal)}</strong>

          <small>Before {monthLabel(month)}</small>
        </div>

        <div className="dt-card dt-summary-card">
          <span className="dt-label">
            <i className="dt-dot total" />
            Total records
          </span>

          <strong>{loading ? "—" : pagination.totalRecords}</strong>

          <small>Matching current filters</small>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="dt-toolbar">
        <div className={`dt-search ${query ? "has-value" : ""}`} role="search">
          <label htmlFor="dt-search-input" className="dt-search-icon">
            <Icon name="search" size={17} />
          </label>

          <input
            id="dt-search-input"
            ref={searchRef}
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by customer, company or phone"
            aria-label="Search due register"
          />

          {searching && (
            <span className="dt-search-spinner" aria-hidden="true" />
          )}

          {query && (
            <button
              type="button"
              className="dt-search-clear"
              onClick={resetSearch}
              aria-label="Clear search"
              title="Clear (Esc)"
            >
              <Icon name="close" size={13} />
            </button>
          )}
        </div>

        <label className="dt-field">
          <span className="dt-sr">Rows per page</span>

          <select value={limit} onChange={handleLimitChange}>
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} / page
              </option>
            ))}
          </select>
        </label>

        {search && !loading && (
          <span className="dt-search-meta">
            {pagination.totalRecords}{" "}
            {pagination.totalRecords === 1 ? "result" : "results"} for{" "}
            <b>"{search}"</b>
          </span>
        )}
      </div>

      {/* BULK ACTIONS */}
      {selected.size > 0 && (
        <div className="dt-bulk" role="region" aria-label="Bulk actions">
          <span>
            <b>{selected.size}</b> selected · {inr(selectedTotal)} due
          </span>

          <div>
            {onSendReminder && (
              <button
                type="button"
                className="dt-btn sm"
                onClick={() =>
                  handleReminder(
                    selectedRows.filter((row) => row.currentDue > 0),
                  )
                }
              >
                <Icon name="send" size={14} />
                Send reminders
              </button>
            )}

            <button type="button" className="dt-btn sm" onClick={exportCsv}>
              <Icon name="download" size={14} />
              Export selected
            </button>

            <button
              type="button"
              className="dt-btn sm ghost"
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="dt-card dt-tablecard">
        <div className="dt-tablewrap">
          <table className={`dt-table ${density}`}>
            <thead>
              <tr>
                <th className="c-check">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate = someOnPage && !allOnPage;
                      }
                    }}
                    onChange={togglePage}
                    disabled={loading || normalizedRows.length === 0}
                    aria-label="Select all"
                  />
                </th>

                <th>
                  <SortButton
                    field="createdAt"
                    label="Account"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th>Type</th>

                <th>
                  <SortButton
                    field="month"
                    label="Month"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th className="num">
                  <SortButton
                    field="dueAmount"
                    label="Current due"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th className="num hide-sm">Previous due</th>

                <th className="num">Cumulative due</th>

                <th className="hide-md">Updated</th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                Array.from({ length: 7 }, (_, index) => (
                  <tr key={`loading-${index}`} className="dt-skeleton-row">
                    <td colSpan={8}>
                      <span />
                    </td>
                  </tr>
                ))}

              {!loading &&
                !error &&
                normalizedRows.map((row) => {
                  const isSelected = selected.has(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={isSelected ? "selected" : ""}
                      tabIndex={0}
                      onClick={(event) => openDrawer(row, event.currentTarget)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          event.target === event.currentTarget
                        ) {
                          openDrawer(row, event.currentTarget);
                        }
                      }}
                    >
                      <td
                        className="c-check"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Select ${row.displayName}`}
                        />
                      </td>

                      <td>
                        <div className="dt-account-cell">
                          <span
                            className={`dt-avatar ${row.accountType.toLowerCase()}`}
                          >
                            {getInitials(row.displayName)}
                          </span>

                          <div className="dt-account">
                            <strong>{row.displayName}</strong>

                            <small>{row.displayId}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <TypeBadge type={row.accountType} />
                      </td>

                      <td>
                        <span className="dt-month">
                          {monthLabel(row.month)}
                        </span>
                      </td>

                      <td className="num">
                        <AmountCell
                          value={row.currentDue}
                          max={maxCurrentDue}
                        />
                      </td>

                      <td className="num hide-sm">
                        <span className="dt-money">{inr(row.previousDue)}</span>
                      </td>

                      <td className="num">
                        <strong className="dt-cumulative">
                          {inr(row.cumulativeDue)}
                        </strong>
                      </td>

                      <td className="hide-md">
                        <span className="dt-muted">
                          {formatDate(row.updatedAt || row.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {!loading && error && (
            <div className="dt-state">
              <strong>Couldn't load due register</strong>

              <p>{error}</p>

              <button type="button" className="dt-btn" onClick={handleRefresh}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && normalizedRows.length === 0 && (
            <div className="dt-state">
              <strong>No due-register records</strong>

              <p>
                No records were found for {monthLabel(month)}
                {search ? ` matching "${search}"` : ""}.
              </p>

              {search && (
                <button type="button" className="dt-btn" onClick={resetSearch}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && !error && pagination.totalRecords > 0 && (
          <div className="dt-pager">
            <span>
              Showing{" "}
              <b>
                {currentStart}–{currentEnd}
              </b>{" "}
              of <b>{pagination.totalRecords}</b> records
            </span>

            <div className="dt-pager-actions">
              <button
                type="button"
                className="dt-btn sm icon"
                onClick={previousPage}
                disabled={!pagination.hasPrevPage || loading}
                aria-label="Previous page"
              >
                <Icon name="left" />
              </button>

              <span className="dt-page-number">
                Page <b>{pagination.currentPage}</b> of{" "}
                <b>{pagination.totalPages}</b>
              </span>

              <button
                type="button"
                className="dt-btn sm icon"
                onClick={nextPage}
                disabled={!pagination.hasNextPage || loading}
                aria-label="Next page"
              >
                <Icon name="right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {activeRow && (
        <>
          <div className="dt-scrim" onClick={closeDrawer} />

          <aside
            className="dt-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dt-drawer-title"
            ref={drawerRef}
            onKeyDown={trapDrawerTab}
          >
            <div className="dt-drawer-header">
              <div className="dt-drawer-id">
                <span
                  className={`dt-avatar lg ${activeRow.accountType.toLowerCase()}`}
                >
                  {getInitials(activeRow.displayName)}
                </span>

                <div>
                  <span className="dt-label">
                    {activeRow.accountType === "CORPORATE"
                      ? "Corporate account"
                      : "Customer account"}
                  </span>

                  <h3 id="dt-drawer-title">{activeRow.displayName}</h3>

                  <small>{activeRow.displayId}</small>
                </div>
              </div>

              <button
                ref={closeRef}
                type="button"
                className="dt-btn icon sm"
                onClick={closeDrawer}
                aria-label="Close details"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="dt-drawer-body">
              <div className="dt-detail-month">
                <span className="dt-label">Register month</span>

                <strong>{monthLabel(activeRow.month)}</strong>
              </div>

              <div className="dt-detail-hero">
                <span className="dt-label">Current month due</span>

                <strong className={activeRow.currentDue > 0 ? "" : "zero"}>
                  {inr(activeRow.currentDue)}
                </strong>
              </div>

              <div className="dt-detail-grid">
                <div className="dt-detail-card">
                  <span>Previous due</span>

                  <strong>{inr(activeRow.previousDue)}</strong>
                </div>

                <div className="dt-detail-card highlight">
                  <span>Cumulative due</span>

                  <strong>{inr(activeRow.cumulativeDue)}</strong>
                </div>
              </div>

              <div className="dt-detail-section">
                <h4>Account information</h4>

                <div className="dt-info-list">
                  <div>
                    <span>Account type</span>

                    <TypeBadge type={activeRow.accountType} />
                  </div>

                  {activeRow.userId && (
                    <>
                      <div>
                        <span>Customer</span>

                        <b>{activeRow.user?.customer_name}</b>
                      </div>

                      <div>
                        <span>Phone</span>

                        <b>{activeRow.user?.phone_num}</b>
                      </div>
                    </>
                  )}

                  {activeRow.corpoAccId && (
                    <>
                      <div>
                        <span>Company</span>

                        <b>{activeRow.corpAcc?.businessName}</b>
                      </div>

                      <div>
                        <span>Contact</span>

                        <b>{activeRow.corpAcc?.contactNo}</b>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="dt-detail-section">
                <h4>Breakdown</h4>

                <div className="dt-timeline">
                  <div>
                    <span className="dot current" />

                    <div>
                      <strong>Current month</strong>

                      <small>{monthLabel(activeRow.month)}</small>
                    </div>

                    <b>{inr(activeRow.currentDue)}</b>
                  </div>

                  <div>
                    <span className="dot previous" />

                    <div>
                      <strong>Previous dues</strong>

                      <small>Before {monthLabel(activeRow.month)}</small>
                    </div>

                    <b>{inr(activeRow.previousDue)}</b>
                  </div>

                  <div>
                    <span className="dot cumulative" />

                    <div>
                      <strong>Cumulative</strong>

                      <small>Total outstanding</small>
                    </div>

                    <b>{inr(activeRow.cumulativeDue)}</b>
                  </div>
                </div>
              </div>

              <div className="dt-detail-section">
                <h4>Record information</h4>

                <div className="dt-info-list">
                  <div>
                    <span>Created</span>
                    <b>{formatDate(activeRow.createdAt)}</b>
                  </div>

                  <div>
                    <span>Updated</span>
                    <b>{formatDate(activeRow.updatedAt)}</b>
                  </div>
                </div>
              </div>
            </div>

            <div className="dt-drawer-actions">
              {onRecordPayment && (
                <button
                  type="button"
                  className="dt-btn primary"
                  disabled={activeRow.currentDue <= 0}
                  onClick={() => handleRecordPayment(activeRow)}
                >
                  Record payment
                </button>
              )}

              {onSendReminder && (
                <button
                  type="button"
                  className="dt-btn"
                  disabled={activeRow.currentDue <= 0}
                  onClick={() => handleReminder([activeRow])}
                >
                  <Icon name="send" size={14} />
                  Send reminder
                </button>
              )}

              {onOpenAccount && (
                <button
                  type="button"
                  className="dt-btn ghost"
                  onClick={() => handleOpenAccount(activeRow)}
                >
                  Open account
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`dt-toast ${toast.tone}`} role="status">
          {toast.message}
        </div>
      )}
    </section>
  );
}

const DARK_VARS = `
  --bg:#0a1216;
  --surface:#111c22;
  --raise:#16252d;
  --ink:#e6eef0;
  --mut:#8ea3aa;
  --line:#233640;
  --line2:#1a2a32;
  --focus:#4fd1c1;
  --accent:#4fd1c1;
  --accent-soft:rgba(79,209,193,.14);
  --warn:#f0a35e;
  --danger:#f0776b;
  --success:#5ad39a;
  --shadow:0 16px 48px rgba(0,0,0,.55);
`;

const CSS = `
.dt {
  --bg:#f3f6f6;
  --surface:#ffffff;
  --raise:#f8fafa;
  --ink:#10222a;
  --mut:#5b6e75;
  --line:#dde5e7;
  --line2:#ebf0f1;
  --focus:#0f766e;
  --accent:#0f766e;
  --accent-soft:rgba(15,118,110,.10);
  --warn:#b45309;
  --danger:#c2410c;
  --success:#067647;
  --shadow:0 16px 48px rgba(16,34,42,.20);

  position:relative;
  max-width:1280px;
  margin:0 auto;
  padding:28px;
  color:var(--ink);
  background:var(--bg);
  border-radius:16px;
  font-size:14px;
  line-height:1.45;
  font-variant-numeric:tabular-nums;
}

@media (prefers-color-scheme:dark) {
  .dt[data-theme="auto"] {
    ${DARK_VARS}
  }
}

.dt[data-theme="dark"] {
  ${DARK_VARS}
}

.dt * {
  box-sizing:border-box;
}

.dt button,
.dt input,
.dt select {
  font:inherit;
  color:inherit;
}

/* ---------- Cursor: everything clickable gets a pointer ---------- */
.dt button,
.dt [role="tab"],
.dt select,
.dt label,
.dt input[type="checkbox"],
.dt input[type="month"],
.dt input[type="month"]::-webkit-calendar-picker-indicator,
.dt-scrim,
.dt-table tbody tr:not(.dt-skeleton-row),
.dt-sortbtn {
  cursor:pointer;
}

.dt input[type="text"],
.dt input[type="search"] {
  cursor:text;
}

.dt button:disabled,
.dt input:disabled,
.dt select:disabled {
  cursor:not-allowed;
}

.dt-search-icon {
  cursor:text;
}

.dt :focus-visible {
  outline-offset:2px;
}

.dt-sr {
  position:absolute;
  width:1px;
  height:1px;
  overflow:hidden;
  clip:rect(0 0 0 0);
  white-space:nowrap;
}

/* ---------- Header ---------- */
.dt-head {
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:20px;
  flex-wrap:wrap;
}

.dt-title-row {
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
}

.dt-head h2 {
  margin:0;
  font-size:26px;
  line-height:1.2;
  letter-spacing:-.03em;
}

.dt-record-count {
  padding:3px 10px;
  border-radius:999px;
  background:var(--accent-soft);
  color:var(--accent);
  font-size:12px;
  font-weight:600;
}

.dt-lead {
  margin:6px 0 0;
  color:var(--mut);
}

.dt-lead strong {
  color:var(--ink);
}

.dt-actions {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.dt-field {
  position:relative;
}

.dt-field input,
.dt-field select {
  height:38px;
  border:1px solid var(--line);
  background:var(--surface);
  border-radius:10px;
  padding:0 12px;
  outline:none;
  transition:border-color .15s, box-shadow .15s;
}

.dt-field input:hover,
.dt-field select:hover {
  border-color:var(--mut);
}

.dt-field input:focus,
.dt-field select:focus {
  border-color:var(--focus);
  box-shadow:0 0 0 3px var(--accent-soft);
}

/* ---------- Buttons ---------- */
.dt-btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  height:38px;
  padding:0 14px;
  border:1px solid var(--line);
  background:var(--surface);
  border-radius:10px;
  white-space:nowrap;
  transition:border-color .15s, background .15s, transform .05s;
}

.dt-btn:hover:not(:disabled) {
  border-color:var(--mut);
  background:var(--raise);
}

.dt-btn:active:not(:disabled) {
  transform:translateY(1px);
}

.dt-btn:disabled {
  opacity:.45;
}

.dt-btn.icon {
  width:38px;
  padding:0;
}

.dt-btn.sm {
  height:32px;
  padding:0 10px;
  border-radius:8px;
}

.dt-btn.icon.sm {
  width:32px;
  padding:0;
}

.dt-btn.primary {
  color:#fff;
  background:var(--accent);
  border-color:var(--accent);
  font-weight:600;
}

.dt-btn.primary:hover:not(:disabled) {
  background:var(--accent);
  border-color:var(--accent);
  filter:brightness(1.1);
}

.dt[data-theme="dark"] .dt-btn.primary,
.dt[data-theme="auto"] .dt-btn.primary {
  color:#06211e;
}

.dt-btn.ghost {
  background:transparent;
  border-color:transparent;
  color:var(--mut);
}

.dt-btn.ghost:hover:not(:disabled) {
  background:var(--line2);
  border-color:transparent;
  color:var(--ink);
}

.dt-spin {
  display:inline-flex;
  animation:dt-rotate .8s linear infinite;
}

@keyframes dt-rotate {
  to { transform:rotate(360deg); }
}

/* ---------- Tabs ---------- */
.dt-tabs {
  display:inline-flex;
  gap:2px;
  margin:22px 0 16px;
  padding:3px;
  background:var(--line2);
  border-radius:11px;
}

.dt-tabs button {
  height:34px;
  padding:0 16px;
  border:0;
  border-radius:8px;
  background:none;
  color:var(--mut);
  transition:background .15s, color .15s;
}

.dt-tabs button:hover {
  color:var(--ink);
}

.dt-tabs button.on {
  color:var(--ink);
  background:var(--surface);
  box-shadow:0 1px 2px rgba(0,0,0,.08);
  font-weight:600;
}

/* ---------- Summary ---------- */
.dt-summary-grid {
  display:grid;
  grid-template-columns:1.5fr 1fr 1fr 1fr;
  gap:12px;
  margin-bottom:18px;
}

.dt-card {
  background:var(--surface);
  border:1px solid var(--line);
  border-radius:14px;
}

.dt-summary-card {
  min-height:118px;
  padding:16px 18px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:4px;
}

.dt-summary-card.highlight {
  background:var(--accent);
  border-color:var(--accent);
  color:#fff;
}

.dt[data-theme="dark"] .dt-summary-card.highlight {
  color:#06211e;
}

@media (prefers-color-scheme:dark) {
  .dt[data-theme="auto"] .dt-summary-card.highlight {
    color:#06211e;
  }
}

.dt-summary-card.highlight .dt-label,
.dt-summary-card.highlight small {
  color:inherit;
  opacity:.75;
}

.dt-summary-card strong {
  font-size:26px;
  line-height:1.15;
  letter-spacing:-.03em;
}

.dt-summary-card.highlight strong {
  font-size:32px;
}

.dt-summary-card small,
.dt-label {
  color:var(--mut);
  font-size:12.5px;
}

.dt-label {
  display:inline-flex;
  align-items:center;
  gap:7px;
}

.dt-dot {
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--mut);
  display:inline-block;
}

.dt-dot.current { background:var(--accent); }
.dt-dot.previous { background:var(--warn); }
.dt-dot.total { background:var(--mut); }

/* ---------- Toolbar / Search ---------- */
.dt-toolbar {
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
  margin:0 0 12px;
}

.dt-search {
  position:relative;
  height:42px;
  flex:1 1 320px;
  max-width:460px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 10px 0 14px;
  border:1px solid var(--line);
  background:var(--surface);
  border-radius:12px;
  color:var(--mut);
  box-shadow:0 1px 2px rgba(16,34,42,.04);
  transition:border-color .15s, box-shadow .15s, color .15s;
}

.dt-search:hover {
  border-color:var(--mut);
}

.dt-search:focus-within {
  border-color:var(--focus);
  color:var(--accent);
  box-shadow:0 0 0 4px var(--accent-soft);
}

.dt-search-icon {
  display:inline-flex;
  align-items:center;
  color:inherit;
}

.dt-search input {
  flex:1;
  min-width:0;
  height:100%;
  border:0;
  outline:0;
  background:none;
  color:var(--ink);
  font-size:14px;
}

.dt-search input::placeholder {
  color:var(--mut);
  opacity:.85;
}

.dt-search kbd {
  padding:1px 7px;
  border:1px solid var(--line);
  border-bottom-width:2px;
  border-radius:6px;
  background:var(--raise);
  color:var(--mut);
  font:inherit;
  font-size:11.5px;
  line-height:1.5;
}

.dt-search:focus-within kbd {
  display:none;
}

.dt-search-clear {
  width:24px;
  height:24px;
  flex:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0;
  border:0;
  border-radius:50%;
  background:var(--line2);
  color:var(--mut);
  transition:background .15s, color .15s;
}

.dt-search-clear:hover {
  background:var(--mut);
  color:var(--surface);
}

.dt-search-spinner {
  width:15px;
  height:15px;
  flex:none;
  border:2px solid var(--line);
  border-top-color:var(--accent);
  border-radius:50%;
  animation:dt-rotate .7s linear infinite;
}

.dt-search-meta {
  color:var(--mut);
  font-size:13px;
}

.dt-search-meta b {
  color:var(--ink);
  font-weight:600;
}

/* ---------- Bulk bar ---------- */
.dt-bulk {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
  padding:8px 8px 8px 16px;
  margin-bottom:12px;
  background:var(--ink);
  color:var(--surface);
  border-radius:12px;
}

.dt-bulk > div {
  display:flex;
  gap:6px;
  flex-wrap:wrap;
}

.dt-bulk .dt-btn {
  background:transparent;
  color:var(--surface);
  border-color:rgba(255,255,255,.25);
}

.dt-bulk .dt-btn:hover:not(:disabled) {
  background:rgba(255,255,255,.12);
  border-color:rgba(255,255,255,.5);
}

.dt-bulk .dt-btn.ghost {
  border-color:transparent;
  opacity:.8;
}

/* ---------- Table ---------- */
.dt-tablecard {
  overflow:hidden;
}

.dt-tablewrap {
  width:100%;
  overflow:auto;
}

.dt-table {
  width:100%;
  border-collapse:separate;
  border-spacing:0;
}

.dt-table th {
  position:sticky;
  top:0;
  z-index:2;
  height:44px;
  padding:0 14px;
  text-align:left;
  background:var(--raise);
  border-bottom:1px solid var(--line);
  color:var(--mut);
  font-size:12.5px;
  font-weight:600;
  white-space:nowrap;
}

.dt-table td {
  padding:13px 14px;
  border-bottom:1px solid var(--line2);
  vertical-align:middle;
}

.dt-table tbody tr:last-child td {
  border-bottom:0;
}

.dt-table.compact td {
  padding:8px 14px;
}

.dt-table .num {
  text-align:right;
}

.dt-table .num .dt-sortbtn {
  margin-left:auto;
}

.dt-table .c-check {
  width:44px;
  padding-right:0;
}

.dt-table tbody tr:not(.dt-skeleton-row) {
  transition:background .12s;
}

.dt-table tbody tr:not(.dt-skeleton-row):hover {
  background:var(--raise);
}

.dt-table tbody tr.selected {
  background:var(--accent-soft);
}

.dt-table tbody tr:focus-visible {
  outline-offset:-2px;
}

.dt-table input[type="checkbox"] {
  width:16px;
  height:16px;
  accent-color:var(--accent);
}

.dt-sortbtn {
  display:inline-flex;
  align-items:center;
  gap:5px;
  height:100%;
  padding:0;
  border:0;
  background:none;
  color:inherit;
  font-weight:inherit;
}

.dt-sortbtn:hover {
  color:var(--ink);
}

.dt-sortbtn.active {
  color:var(--accent);
}

.dt-account-cell {
  display:flex;
  align-items:center;
  gap:12px;
}

.dt-avatar {
  width:34px;
  height:34px;
  flex:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  background:var(--line2);
  color:var(--mut);
  font-size:12px;
  font-weight:700;
  letter-spacing:.02em;
}

.dt-avatar.user {
  background:rgba(37,99,235,.12);
  color:#2557c4;
}

.dt-avatar.corporate {
  background:rgba(180,83,9,.13);
  color:#a34a08;
}

.dt-avatar.lg {
  width:44px;
  height:44px;
  font-size:14px;
}

.dt-account {
  display:flex;
  flex-direction:column;
  min-width:150px;
}

.dt-account strong {
  font-weight:600;
}

.dt-account small {
  margin-top:1px;
  color:var(--mut);
  font-size:12px;
}

.dt-type {
  display:inline-flex;
  align-items:center;
  padding:3px 10px;
  border-radius:999px;
  background:var(--raise);
  border:1px solid var(--line);
  color:var(--mut);
  font-size:12px;
  white-space:nowrap;
}

.dt-type.user {
  color:#2457a6;
  background:#eaf2ff;
  border-color:#d6e5ff;
}

.dt-type.corporate {
  color:#7a4a00;
  background:#fff3d6;
  border-color:#f5dfaa;
}

.dt-month {
  color:var(--mut);
  white-space:nowrap;
}

.dt-amount {
  min-width:130px;
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:5px;
}

.dt-amount strong {
  font-size:14px;
}

.dt-amount strong.zero {
  color:var(--success);
}

.dt-amount-bar {
  width:100%;
  max-width:130px;
  height:4px;
  overflow:hidden;
  background:var(--line2);
  border-radius:4px;
}

.dt-amount-bar i {
  display:block;
  height:100%;
  background:var(--accent);
  border-radius:4px;
  transition:width .3s ease;
}

.dt-amount-bar i.mid { background:var(--warn); }
.dt-amount-bar i.high { background:var(--danger); }

.dt-money {
  color:var(--mut);
}

.dt-cumulative {
  font-size:14px;
}

.dt-muted {
  color:var(--mut);
  font-size:12px;
  white-space:nowrap;
}

.dt-skeleton-row td {
  padding:10px 14px;
}

.dt-skeleton-row span {
  display:block;
  height:38px;
  border-radius:8px;
  background:
    linear-gradient(
      90deg,
      var(--line2) 25%,
      var(--raise) 50%,
      var(--line2) 75%
    );
  background-size:200% 100%;
  animation:dt-skeleton 1.3s linear infinite;
}

@keyframes dt-skeleton {
  to {
    background-position:-200% 0;
  }
}

.dt-state {
  display:grid;
  justify-items:center;
  gap:8px;
  padding:56px 16px;
  text-align:center;
}

.dt-state strong {
  font-size:15px;
}

.dt-state p {
  max-width:45ch;
  margin:0 0 6px;
  color:var(--mut);
}

.dt-pager {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
  padding:12px 14px;
  color:var(--mut);
  border-top:1px solid var(--line);
  background:var(--raise);
}

.dt-pager-actions {
  display:flex;
  align-items:center;
  gap:8px;
}

.dt-page-number {
  min-width:105px;
  text-align:center;
  font-size:12.5px;
}

/* ---------- Drawer ---------- */
.dt-scrim {
  position:fixed;
  inset:0;
  z-index:40;
  background:rgba(8,18,22,.5);
  backdrop-filter:blur(2px);
}

.dt-drawer {
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  z-index:41;
  width:min(470px,100vw);
  display:flex;
  flex-direction:column;
  background:var(--surface);
  color:var(--ink);
  box-shadow:var(--shadow);
  animation:dt-drawer-in .2s ease-out;
}

@keyframes dt-drawer-in {
  from {
    transform:translateX(24px);
    opacity:0;
  }
}

.dt-drawer-header {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  padding:18px 20px;
  border-bottom:1px solid var(--line);
}

.dt-drawer-id {
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}

.dt-drawer-header h3 {
  margin:2px 0;
  font-size:20px;
  letter-spacing:-.02em;
  overflow-wrap:anywhere;
}

.dt-drawer-header small {
  color:var(--mut);
}

.dt-drawer-body {
  flex:1;
  overflow:auto;
  padding:20px;
}

.dt-detail-month {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding-bottom:18px;
  border-bottom:1px solid var(--line2);
}

.dt-detail-month strong {
  font-size:13px;
}

.dt-detail-hero {
  display:flex;
  flex-direction:column;
  gap:5px;
  padding:22px 0;
}

.dt-detail-hero strong {
  font-size:38px;
  line-height:1.1;
  letter-spacing:-.03em;
}

.dt-detail-hero strong.zero {
  color:var(--success);
}

.dt-detail-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.dt-detail-card {
  padding:14px;
  border:1px solid var(--line);
  border-radius:12px;
  background:var(--raise);
}

.dt-detail-card.highlight {
  border-color:var(--accent);
  background:var(--accent-soft);
}

.dt-detail-card span {
  display:block;
  color:var(--mut);
  font-size:12px;
  margin-bottom:5px;
}

.dt-detail-card strong {
  font-size:17px;
}

.dt-detail-section {
  margin-top:24px;
}

.dt-detail-section h4 {
  margin:0 0 10px;
  font-size:13px;
}

.dt-info-list {
  overflow:hidden;
  border:1px solid var(--line);
  border-radius:12px;
}

.dt-info-list > div {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:15px;
  padding:11px 13px;
}

.dt-info-list > div + div {
  border-top:1px solid var(--line2);
}

.dt-info-list span {
  color:var(--mut);
  font-size:12.5px;
}

.dt-info-list b {
  max-width:60%;
  text-align:right;
  overflow-wrap:anywhere;
  font-size:12.5px;
}

.dt-timeline {
  display:flex;
  flex-direction:column;
}

.dt-timeline > div {
  position:relative;
  display:grid;
  grid-template-columns:18px 1fr auto;
  gap:10px;
  align-items:start;
  padding:9px 0;
}

.dt-timeline .dot {
  width:9px;
  height:9px;
  margin-top:5px;
  border-radius:50%;
  background:var(--mut);
}

.dt-timeline .dot.current {
  background:var(--accent);
}

.dt-timeline .dot.previous {
  background:var(--warn);
}

.dt-timeline .dot.cumulative {
  background:var(--success);
}

.dt-timeline strong,
.dt-timeline small {
  display:block;
}

.dt-timeline strong {
  font-size:13px;
}

.dt-timeline small {
  color:var(--mut);
  font-size:11.5px;
  margin-top:2px;
}

.dt-timeline b {
  font-size:12.5px;
}

.dt-drawer-actions {
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  padding:14px 16px;
  border-top:1px solid var(--line);
  background:var(--raise);
}

.dt-drawer-actions .primary {
  flex:1 1 140px;
}

.dt-toast {
  position:fixed;
  left:50%;
  bottom:24px;
  z-index:60;
  transform:translateX(-50%);
  max-width:calc(100vw - 32px);
  padding:11px 18px;
  border-radius:10px;
  background:var(--ink);
  color:var(--surface);
  box-shadow:var(--shadow);
}

.dt-toast.error {
  background:#b42318;
  color:#fff;
}

/* ---------- Responsive ---------- */
@media (max-width:1050px) {
  .dt-summary-grid {
    grid-template-columns:repeat(2,1fr);
  }

  .hide-md {
    display:none;
  }
}

@media (max-width:700px) {
  .dt {
    padding:14px;
    border-radius:0;
  }

  .dt-actions {
    width:100%;
  }

  .dt-actions .dt-field {
    flex:1;
  }

  .dt-actions .dt-field input {
    width:100%;
  }

  .dt-tabs {
    display:flex;
    width:100%;
  }

  .dt-tabs button {
    flex:1;
    padding:0 8px;
  }

  .dt-toolbar {
    align-items:stretch;
  }

  .dt-search {
    max-width:none;
    flex-basis:100%;
  }

  .hide-sm {
    display:none;
  }

  .dt-pager {
    align-items:flex-start;
    flex-direction:column;
  }

  .dt-pager-actions {
    width:100%;
    justify-content:space-between;
  }
}

@media (max-width:480px) {
  .dt-summary-grid {
    grid-template-columns:1fr;
  }

  .dt-head h2 {
    font-size:22px;
  }

  .dt-detail-grid {
    grid-template-columns:1fr;
  }

  .dt-drawer {
    width:100vw;
  }
}

@media (prefers-reduced-motion:reduce) {
  .dt * {
    animation:none!important;
    transition:none!important;
  }
}
`;
