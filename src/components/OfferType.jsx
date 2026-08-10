import React, { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  X,
  Power,
  PowerOff,
  Tag,
  AlertCircle,
  Loader2,
  ListTree,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  CircleOff,
  Database,
} from "lucide-react";

import useOfferStore from "../zustand/Store/offerStore";

/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const THEME_VARS = {
  "--bg": "#F7F8FC",
  "--panel": "#FFFFFF",
  "--panel-soft": "#F8FAFC",
  "--panel-2": "#F1F5F9",
  "--line": "#E7EAF0",
  "--line-dark": "#D8DDE7",
  "--text": "#111827",
  "--muted": "#64748B",
  "--muted-2": "#94A3B8",
  "--primary": "#5B5BD6",
  "--primary-dark": "#4848B8",
  "--primary-soft": "rgba(91, 91, 214, 0.09)",
  "--danger": "#E5484D",
  "--danger-soft": "rgba(229, 72, 77, 0.08)",
  "--success": "#159A72",
  "--success-soft": "rgba(21, 154, 114, 0.09)",
  "--warning": "#D97706",
};

/* ============================================================================
   SCOPED CSS
============================================================================ */

const SCOPED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

#offer-type-root {
  font-family: 'DM Sans', system-ui, sans-serif;
}

#offer-type-root .display {
  font-family: 'Manrope', sans-serif;
}

#offer-type-root .mono {
  font-family: 'JetBrains Mono', monospace;
}

#offer-type-root button {
  font-family: inherit;
  cursor: pointer;
}

#offer-type-root input {
  font-family: inherit;
}

#offer-type-root .scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}

#offer-type-root .scrollbar::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

#offer-type-root .scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

#offer-type-root .scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 10px;
}

#offer-type-root .fadein {
  animation: offerFade 0.22s ease both;
}

@keyframes offerFade {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#offer-type-root .card-hover {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

#offer-type-root .card-hover:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 35px rgba(15, 23, 42, 0.07),
    0 3px 8px rgba(15, 23, 42, 0.04);
  border-color: #D9DDF0 !important;
}

#offer-type-root .search-input:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 4px var(--primary-soft);
}

#offer-type-root .filter-pill {
  transition: all 160ms ease;
}

#offer-type-root .filter-pill:hover {
  transform: translateY(-1px);
}

#offer-type-root .property-row {
  transition: background 150ms ease;
}

#offer-type-root .property-row:hover {
  background: #EEF1F7 !important;
}
`;

/* ============================================================================
   ACCENT PALETTE
============================================================================ */

const ACCENT_PALETTE = [
  "#0284C7",
  "#D97706",
  "#7C3AED",
  "#059669",
  "#65A30D",
  "#2563EB",
  "#DB2777",
  "#EA580C",
  "#0D9488",
];

function accentFor(name = "") {
  let h = 0;

  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }

  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/* ============================================================================
   SCOPED STYLES
============================================================================ */

function useScopedStyles() {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = SCOPED_CSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

/* ============================================================================
   ICON BADGE
============================================================================ */

function IconBadge({ Icon, color, size = 15 }) {
  return (
    <span
      style={{
        width: size + 18,
        height: size + 18,
        background: `${color}12`,
        color,
        border: `1px solid ${color}20`,
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-xl"
    >
      <Icon size={size} />
    </span>
  );
}

/* ============================================================================
   CONFIRM DIALOG
============================================================================ */

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        background: "rgba(15,23,42,0.42)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="fadein w-full max-w-[410px] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="p-6">
          <div className="flex items-start gap-3">
            <IconBadge
              Icon={AlertCircle}
              color={danger ? "#E5484D" : "#5B5BD6"}
              size={18}
            />

            <div className="min-w-0">
              <div
                className="display text-[15px] font-bold"
                style={{ color: "var(--text)" }}
              >
                {title}
              </div>

              <div
                className="mt-1.5 text-[13px] leading-5"
                style={{ color: "var(--muted)" }}
              >
                {body}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-2 px-6 py-4"
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--panel-soft)",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-[12px] font-semibold disabled:opacity-50"
            style={{
              color: "var(--muted)",
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
            style={{
              background: danger ? "var(--danger)" : "var(--primary)",
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SKELETON CARD
============================================================================ */

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl p-5"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-100" />

          <div>
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-48 rounded bg-slate-100" />
          </div>
        </div>

        <div className="h-7 w-16 rounded-full bg-slate-100" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/* ============================================================================
   OFFER TYPE COMPONENT
============================================================================ */

const OfferType = () => {
  useScopedStyles();

  // =========================================================
  // ZUSTAND
  // =========================================================

  const getAllOfferTypes = useOfferStore((state) => state.getAllOfferTypes);

  const offerTypes = useOfferStore((state) => state.offerTypes);

  const loading = useOfferStore((state) => state.loading);

  const error = useOfferStore((state) => state.error);

  const updateOfferTypeStatus = useOfferStore(
    (state) => state.updateOfferTypeStatus,
  );

  const deleteOfferType = useOfferStore((state) => state.deleteOfferType);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================================================
  // FETCH OFFER TYPES
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchOfferTypes = async () => {
      try {
        const response = await getAllOfferTypes({
          page,
          limit,
          search: debouncedSearch,
          status,
        });

        if (cancelled) return;

        /*
         * Expected API response:
         *
         * {
         *   offerTypes: [],
         *   pagination: {
         *     page,
         *     limit,
         *     total,
         *     totalPages
         *   }
         * }
         */

        if (response?.pagination) {
          setPagination(response.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch offer types:", error);
      }
    };

    fetchOfferTypes();

    return () => {
      cancelled = true;
    };
  }, [getAllOfferTypes, page, limit, debouncedSearch, status]);

  // =========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =========================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // =========================================================
  // STATUS COUNTERS
  // =========================================================

  const activeCount = useMemo(
    () => offerTypes.filter((item) => item.isActive).length,
    [offerTypes],
  );

  const inactiveCount = useMemo(
    () => offerTypes.filter((item) => !item.isActive).length,
    [offerTypes],
  );

  // =========================================================
  // STATUS TOGGLE
  // =========================================================

  const handleToggleStatus = async (offerType) => {
    if (statusLoadingId) return;

    const nextStatus = !offerType.isActive;

    try {
      setStatusLoadingId(offerType.offerTypeId);

      await updateOfferTypeStatus({
        offerTypeId: offerType.offerTypeId,
        status: nextStatus,
      });

      await getAllOfferTypes({
        page,
        limit,
        search: debouncedSearch,
        status,
      });
    } catch (err) {
      console.error("Failed to update offer type status:", err);
    } finally {
      setStatusLoadingId(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handlePermanentDelete = (offerType) => {
    setConfirmDelete(offerType);
  };

  const confirmPermanentDelete = async () => {
    const offerType = confirmDelete;

    if (!offerType) return;

    try {
      setDeleteLoading(true);

      await deleteOfferType({
        offerTypeId: offerType.offerTypeId,
      });

      setConfirmDelete(null);

      /*
       * If deleting the last item from a page,
       * move back one page.
       */
      if (offerTypes.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await getAllOfferTypes({
          page,
          limit,
          search: debouncedSearch,
          status,
        });
      }
    } catch (err) {
      console.error("Failed to permanently delete offer type:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const handleStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(1, pagination?.totalPages || 1);

  const totalItems = pagination?.total || 0;

  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;

  const endItem = Math.min(page * limit, totalItems);

  // =========================================================
  // FILTER BUTTON
  // =========================================================

  const FilterButton = ({ value, label, icon: Icon, count }) => {
    const active = status === value;

    return (
      <button
        type="button"
        onClick={() => handleStatusFilter(value)}
        className="filter-pill flex h-9 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold"
        style={{
          background: active ? "var(--text)" : "var(--panel)",
          color: active ? "#FFFFFF" : "var(--muted)",
          border: active ? "1px solid var(--text)" : "1px solid var(--line)",
          boxShadow: active ? "0 4px 12px rgba(15,23,42,0.12)" : "none",
        }}
      >
        <Icon size={14} />

        {label}

        {typeof count === "number" && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px]"
            style={{
              background: active ? "rgba(255,255,255,0.14)" : "var(--panel-2)",
              color: active ? "#FFFFFF" : "var(--muted-2)",
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      id="offer-type-root"
      style={{
        ...THEME_VARS,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* =====================================================
          HEADER / HERO
      ====================================================== */}

      <div
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FBFCFE 100%)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="mx-auto max-w-[1500px] px-6 pb-5 pt-7">
          {/* TOP ROW */}

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            {/* TITLE */}

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  <Database size={12} />
                  Configuration
                </span>
              </div>

              <h1
                className="display text-[28px] font-extrabold tracking-[-0.035em] md:text-[32px]"
                style={{
                  color: "var(--text)",
                }}
              >
                Offer Types
              </h1>

              <p
                className="mt-1.5 max-w-[600px] text-[13px] leading-5"
                style={{
                  color: "var(--muted)",
                }}
              >
                Manage the reusable rule schemas that power your offer engine.
              </p>
            </div>

            {/* SEARCH */}

            <div className="w-full xl:w-[390px]">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{
                    color: "var(--muted-2)",
                  }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or description..."
                  className="search-input h-11 w-full rounded-xl pl-10 pr-10 text-[12px]"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                    boxShadow: "0 3px 12px rgba(15,23,42,0.03)",
                  }}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "var(--muted-2)",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FILTER / META ROW */}

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold"
                style={{
                  color: "var(--muted-2)",
                }}
              >
                <SlidersHorizontal size={13} />
                FILTER
              </div>

              <FilterButton value="" label="All" icon={ListTree} />

              <FilterButton
                value="active"
                label="Active"
                icon={CheckCircle2}
                count={activeCount}
              />

              <FilterButton
                value="inactive"
                label="Inactive"
                icon={CircleOff}
                count={inactiveCount}
              />
            </div>

            <div
              className="text-[11px]"
              style={{
                color: "var(--muted-2)",
              }}
            >
              {loading ? (
                "Refreshing..."
              ) : (
                <>
                  Showing{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {startItem}-{endItem}
                  </strong>{" "}
                  of{" "}
                  <strong style={{ color: "var(--text)" }}>{totalItems}</strong>{" "}
                  offer types
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-6 py-6">
        {/* ERROR */}

        {error && (
          <div
            className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-[12px]"
            style={{
              background: "var(--danger-soft)",
              border: "1px solid rgba(229,72,77,0.16)",
              color: "var(--danger)",
            }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: limit }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : offerTypes.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================== */

          <div
            className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl px-6 text-center"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "var(--panel-2)",
                color: "var(--muted-2)",
              }}
            >
              {search || status ? <Search size={23} /> : <Tag size={23} />}
            </div>

            <h3
              className="display text-[15px] font-bold"
              style={{
                color: "var(--text)",
              }}
            >
              {search || status
                ? "No matching offer types"
                : "No offer types yet"}
            </h3>

            <p
              className="mt-1.5 max-w-[400px] text-[12px] leading-5"
              style={{
                color: "var(--muted)",
              }}
            >
              {search || status
                ? "Try changing your search term or selecting a different status filter."
                : "Offer types will appear here once they are configured."}
            </p>

            {(search || status) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="mt-5 rounded-lg px-4 py-2 text-[12px] font-semibold"
                style={{
                  background: "var(--text)",
                  color: "#fff",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                OFFER TYPE GRID
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {offerTypes.map((item) => {
                const properties = item.offerRule?.properties || {};

                const required = item.offerRule?.required || [];

                const isActive = item.isActive !== false;

                const accent = accentFor(item.name?.trim() || "?");

                const propertyCount = Object.keys(properties).length;

                const isStatusUpdating = statusLoadingId === item.offerTypeId;

                return (
                  <div
                    key={item.offerTypeId}
                    className="card-hover overflow-hidden rounded-2xl"
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {/* CARD TOP ACCENT */}

                    <div
                      style={{
                        height: "3px",
                        background: isActive
                          ? `linear-gradient(90deg, ${accent}, ${accent}55)`
                          : "var(--line-dark)",
                      }}
                    />

                    {/* CARD HEADER */}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <IconBadge
                            Icon={Tag}
                            color={isActive ? accent : "#94A3B8"}
                            size={17}
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h2
                                className="display truncate text-[14px] font-bold"
                                style={{
                                  color: "var(--text)",
                                }}
                                title={item.name}
                              >
                                {item.name?.trim()}
                              </h2>
                            </div>

                            <div className="mt-1.5 flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wide"
                                style={{
                                  background: isActive
                                    ? "var(--success-soft)"
                                    : "var(--panel-2)",
                                  color: isActive
                                    ? "var(--success)"
                                    : "var(--muted-2)",
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    background: "currentColor",
                                  }}
                                />

                                {isActive ? "Active" : "Inactive"}
                              </span>

                              <span
                                className="text-[10px]"
                                style={{
                                  color: "var(--muted-2)",
                                }}
                              >
                                {propertyCount}{" "}
                                {propertyCount === 1
                                  ? "property"
                                  : "properties"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            title="Delete permanently"
                            onClick={() => handlePermanentDelete(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                            style={{
                              color: "var(--danger)",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            type="button"
                            title={isActive ? "Deactivate" : "Activate"}
                            disabled={isStatusUpdating}
                            onClick={() => handleToggleStatus(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 disabled:opacity-50"
                            style={{
                              color: isActive
                                ? "var(--success)"
                                : "var(--muted-2)",
                            }}
                          >
                            {isStatusUpdating ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : isActive ? (
                              <Power size={14} />
                            ) : (
                              <PowerOff size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      {item.description && (
                        <p
                          className="mt-4 line-clamp-2 text-[11px] leading-5"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* PROPERTY SECTION */}

                    <div className="px-5 pb-5">
                      <div className="mb-2.5 flex items-center justify-between">
                        <div
                          className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            color: "var(--muted-2)",
                          }}
                        >
                          <ListTree size={11} />
                          Rule Schema
                        </div>

                        <span
                          className="rounded-md px-2 py-1 text-[9px] font-bold"
                          style={{
                            background: "var(--panel-2)",
                            color: "var(--muted)",
                          }}
                        >
                          {propertyCount}
                        </span>
                      </div>

                      {propertyCount === 0 ? (
                        <div
                          className="rounded-xl p-4 text-center"
                          style={{
                            background: "var(--panel-soft)",
                            border: "1px dashed var(--line-dark)",
                          }}
                        >
                          <span
                            className="text-[10px]"
                            style={{
                              color: "var(--muted-2)",
                            }}
                          >
                            No properties configured
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {Object.entries(properties).map(
                            ([key, definition]) => (
                              <div
                                key={key}
                                className="property-row rounded-xl p-3"
                                style={{
                                  background: "var(--panel-soft)",
                                  border: "1px solid var(--line)",
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div
                                      className="mono truncate text-[10px] font-medium"
                                      style={{
                                        color: "var(--text)",
                                      }}
                                    >
                                      {key}
                                    </div>

                                    {definition?.description && (
                                      <div
                                        className="mt-1 text-[10px] leading-4"
                                        style={{
                                          color: "var(--muted-2)",
                                        }}
                                      >
                                        {definition.description}
                                      </div>
                                    )}
                                  </div>

                                  <span
                                    className="shrink-0 rounded-md px-1.5 py-1 text-[8px] font-bold uppercase"
                                    style={{
                                      background: "var(--panel-2)",
                                      color: "var(--muted)",
                                    }}
                                  >
                                    {definition?.type || "string"}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                  {definition?.enum?.length > 0 && (
                                    <span
                                      className="rounded-md px-1.5 py-1 text-[9px]"
                                      style={{
                                        background: "var(--primary-soft)",
                                        color: "var(--primary)",
                                      }}
                                    >
                                      {definition.enum.join(" · ")}
                                    </span>
                                  )}

                                  {(definition?.minimum !== undefined ||
                                    definition?.maximum !== undefined) && (
                                    <span
                                      className="rounded-md px-1.5 py-1 text-[9px]"
                                      style={{
                                        background: "var(--panel-2)",
                                        color: "var(--muted)",
                                      }}
                                    >
                                      {definition.minimum ?? "−"} →{" "}
                                      {definition.maximum ?? "∞"}
                                    </span>
                                  )}

                                  {required.includes(key) && (
                                    <span
                                      className="rounded-md px-1.5 py-1 text-[8px] font-bold uppercase"
                                      style={{
                                        background: "var(--danger-soft)",
                                        color: "var(--danger)",
                                      }}
                                    >
                                      Required
                                    </span>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER */}

                    <div
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{
                        borderTop: "1px solid var(--line)",
                        background: "rgba(248,250,252,0.55)",
                      }}
                    >
                      <span
                        className="text-[10px]"
                        style={{
                          color: "var(--muted-2)",
                        }}
                      >
                        Schema configuration
                      </span>

                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: "var(--text)",
                        }}
                      >
                        {required.length} required
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}

            <div
              className="mt-6 flex flex-col gap-3 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <div
                className="text-[11px]"
                style={{
                  color: "var(--muted)",
                }}
              >
                Page <strong style={{ color: "var(--text)" }}>{page}</strong> of{" "}
                <strong style={{ color: "var(--text)" }}>{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((pageNumber) => {
                    if (totalPages <= 5) return true;

                    return (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - page) <= 1
                    );
                  })
                  .map((pageNumber, index, pages) => {
                    const previousPage = pages[index - 1];

                    const showEllipsis =
                      previousPage && pageNumber - previousPage > 1;

                    return (
                      <React.Fragment key={pageNumber}>
                        {showEllipsis && (
                          <span
                            className="flex h-8 w-8 items-center justify-center text-[11px]"
                            style={{
                              color: "var(--muted-2)",
                            }}
                          >
                            …
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold"
                          style={{
                            background:
                              page === pageNumber
                                ? "var(--text)"
                                : "var(--panel)",
                            color:
                              page === pageNumber ? "#FFFFFF" : "var(--muted)",
                            border:
                              page === pageNumber
                                ? "1px solid var(--text)"
                                : "1px solid var(--line)",
                          }}
                        >
                          {pageNumber}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Offer Type Permanently"
        body={`Are you sure you want to permanently delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
        loading={deleteLoading}
        onConfirm={confirmPermanentDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setConfirmDelete(null);
          }
        }}
      />
    </div>
  );
};

export default OfferType;
