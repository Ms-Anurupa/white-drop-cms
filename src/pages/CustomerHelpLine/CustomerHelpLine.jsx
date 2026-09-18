import { useEffect, useState } from "react";
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  X,
} from "lucide-react";
import contactUsStore from "@/zustand/Store/contactusStore";

const DATE_FILTERS = [
  { label: "All", value: "" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const CustomerHelpLine = () => {
  // Individual primitive/function selectors — an object-literal selector here
  // creates a new reference every render and caused the Inventory.jsx crash.
  const contacts = contactUsStore((s) => s.contacts);
  const pagination = contactUsStore((s) => s.pagination);
  const filter = contactUsStore((s) => s.filter);
  const fromDate = contactUsStore((s) => s.fromDate);
  const toDate = contactUsStore((s) => s.toDate);
  const loading = contactUsStore((s) => s.loading);
  const error = contactUsStore((s) => s.error);
  const fetchContactUsReqs = contactUsStore((s) => s.fetchContactUsReqs);
  const setFilter = contactUsStore((s) => s.setFilter);
  const setDateRange = contactUsStore((s) => s.setDateRange);
  const setPage = contactUsStore((s) => s.setPage);

  // Local draft inputs so the API isn't called on every keystroke — synced
  // from the store so an external reset (e.g. `reset()`) clears them too.
  const [draftFrom, setDraftFrom] = useState(fromDate);
  const [draftTo, setDraftTo] = useState(toDate);

  useEffect(() => {
    setDraftFrom(fromDate);
    setDraftTo(toDate);
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchContactUsReqs();
  }, [fetchContactUsReqs]);

  const isPartialDraft = Boolean(draftFrom) !== Boolean(draftTo);
  const isDirty = draftFrom !== fromDate || draftTo !== toDate;

  const handleApplyRange = () => {
    if (isPartialDraft) return;
    setDateRange(draftFrom, draftTo);
  };

  const handleClearRange = () => {
    setDraftFrom("");
    setDraftTo("");
    setDateRange("", "");
  };

  const { page, totalPages, total } = pagination;

  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            Customer Help Line
          </h1>

          {/* PRESET DATE FILTER */}
          <div className="flex flex-wrap gap-2">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value || "all"}
                onClick={() => setFilter(f.value)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === f.value && !fromDate && !toDate
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM DATE RANGE */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-gray-500">
            From
            <input
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="ml-2 px-2 py-1.5 text-xs sm:text-sm rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="text-xs text-gray-500">
            To
            <input
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(e) => setDraftTo(e.target.value)}
              className="ml-2 px-2 py-1.5 text-xs sm:text-sm rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <button
            onClick={handleApplyRange}
            disabled={isPartialDraft || !isDirty}
            className="cursor-pointer px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-blue-600 text-white shadow-sm disabled:opacity-40"
          >
            Apply
          </button>

          {(fromDate || toDate) && (
            <button
              onClick={handleClearRange}
              className="cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm text-gray-500 hover:bg-slate-100"
            >
              <X size={14} /> Clear
            </button>
          )}

          {isPartialDraft && (
            <span className="text-xs text-amber-600">
              Pick both a from and a to date.
            </span>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Loading requests...</span>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-red-500 gap-2">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <Inbox size={28} />
          <span className="text-sm">No contact requests found.</span>
        </div>
      )}

      {!loading && !error && contacts.length > 0 && (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition align-top"
                    >
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {c.email}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">{c.subject}</td>
                      <td className="p-3 text-gray-600 max-w-xs">
                        <p className="line-clamp-2" title={c.message}>
                          {c.message}
                        </p>
                      </td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= MOBILE CARD VIEW ================= */}
          <div className="md:hidden space-y-3">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm p-4 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium text-gray-800">{c.name}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-700">{c.subject}</p>
                <p className="text-sm text-gray-500">{c.message}</p>

                <p className="text-xs text-gray-600 flex items-center gap-1 pt-1">
                  <Mail size={12} /> {c.email}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-600">
          Page {page} of {totalPages || 1} · {total} total
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1 || loading}
            className="cursor-pointer p-2 rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="cursor-pointer p-2 rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerHelpLine;
