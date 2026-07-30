/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bike,
  UserRound,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CalendarRange,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import deliveryPartnerStore from "../../zustand/Store/deliveryPartnerStore";
import noDoc from "../../assets/images/nodoc.svg";
import Loader from "../../components/Loader";
import useSignedImages from "../../hooks/useSignedImages";
import { toast } from "react-toastify";

const PAGE_LIMIT = 8;

const getFullName = (p) => {
  const name = [p?.firstName, p?.lastName].filter(Boolean).join(" ");
  return name || "Not Provided";
};

const getInitials = (p) => {
  const name = [p?.firstName, p?.lastName].filter(Boolean).join(" ");
  if (!name) return <UserRound size={16} />;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Builds a windowed page list with ellipses, e.g. [1, "...", 4, 5, 6, "...", 12]
const getPageNumbers = (current, total) => {
  if (total <= 1) return [1];
  const delta = 1;
  const range = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");
  range.unshift(1);
  if (total > 1) range.push(total);
  return range;
};

// Truncated area-covered text with a hover tooltip, shown only when
// the text actually overflows its column width.
const AreaCoverCell = ({ text }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [text]);

  if (!text) {
    return <span className="italic text-gray-400">Not Assigned</span>;
  }

  const handleMouseEnter = () => {
    if (!isTruncated || !textRef.current) return;
    const rect = textRef.current.getBoundingClientRect();
    const tooltipWidth = 256; // matches max-w-xs, keeps tooltip width fixed
    const left = Math.min(rect.left, window.innerWidth - tooltipWidth - 16);
    setTooltipPos({ top: rect.bottom + 8, left: Math.max(left, 8) });
    setShowTooltip(true);
  };

  return (
    <>
      <span className="flex items-center gap-1.5 text-gray-600 max-w-[180px]">
        <MapPin size={14} className="text-gray-400 shrink-0" />

        <span
          ref={textRef}
          className="truncate"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {text}
        </span>
      </span>
      {showTooltip &&
        isTruncated &&
        createPortal(
          <div
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
            className="fixed z-100 w-64 text-gray-950 bg-white text-xs shadow-gray-500 rounded-lg px-3 py-2 shadow-lg leading-relaxed pointer-events-none break-words"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
};

const DeliveryPartnerList = () => {
  const getDeliveryPersons = deliveryPartnerStore(
    (state) => state.getDeliveryPersons,
  );
  const partners = deliveryPartnerStore((state) => state.partners);
  const pagination = deliveryPartnerStore((state) => state.pagination) || {};
  const updateStatusDelPerson = deliveryPartnerStore(
    (state) => state.updateStatusDelPerson,
  );
  const loading = deliveryPartnerStore((state) => state.loading);
  const imageUrls = useSignedImages(
    partners,
    "photo",
    "delPersonDocs",
    "deliveryPersonId",
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  const totalPages = pagination.totalPages || 1;
  const total = pagination.total ?? partners.length;

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getDeliveryPersons({
        search: search.trim(),
        page,
        limit: PAGE_LIMIT,
        fromDate,
        toDate,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [search, page, fromDate, toDate, getDeliveryPersons]);

  const handleStatusChange = async (active, deliveryPersonId) => {
    try {
      await updateStatusDelPerson({ deliveryPersonId, status: active });
      toast.success("Status updated successfully");
      await getDeliveryPersons({
        search: search.trim(),
        page,
        limit: PAGE_LIMIT,
        fromDate,
        toDate,
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
  };

  const activeOnPage = partners.filter((p) => p?.active).length;
  const verifiedOnPage = partners.filter((p) => p?.documentsVerified).length;

  if (loading) {
    return <Loader text="Loading delivery partners..." />;
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Delivery Partners
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage riders, verify documents, and track onboarding.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition"
          />
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total partners",
            value: total,
            icon: Users,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
          },
          {
            label: "Active (this page)",
            value: activeOnPage,
            icon: CheckCircle2,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
          },
          {
            label: "Inactive (this page)",
            value: partners.length - activeOnPage,
            icon: XCircle,
            iconBg: "bg-gray-100",
            iconColor: "text-gray-500",
          },
          {
            label: "Docs verified (this page)",
            value: verifiedOnPage,
            icon: ShieldCheck,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}
            >
              <stat.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-semibold text-gray-900 leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* DATE FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm pb-2">
          <CalendarRange size={16} />
          <span className="font-medium">Joined date</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {(fromDate || toDate) && (
          <button
            onClick={clearDateFilter}
            className="h-8.5 px-4 rounded-lg border border-red-200
          text-red-600 text-sm hover:bg-red-50 transition shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}

        <p className="text-xs text-gray-400 ml-auto pb-2">
          {total} partner{total === 1 ? "" : "s"} found
        </p>
      </div>

      {partners.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 text-sm">
          No delivery partners match these filters.
        </div>
      )}

      {partners.length > 0 && (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="p-3 w-14">SL.NO.</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Vehicle No.</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Area Covered</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {partners.map((p, idx) => {
                    const serialNo = (page - 1) * PAGE_LIMIT + idx + 1;

                    return (
                      <tr
                        key={p?.deliveryPersonId}
                        className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="p-3 text-sm text-gray-400 font-medium">
                          {serialNo}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                              {p?.photo?.length > 0 ? (
                                <img
                                  src={imageUrls[p.deliveryPersonId] || noDoc}
                                  alt={getFullName(p)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getInitials(p)
                              )}
                            </div>
                            <span
                              className={
                                p?.firstName
                                  ? "font-medium text-gray-800"
                                  : "italic text-gray-400"
                              }
                            >
                              {getFullName(p)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Bike size={14} className="text-gray-400" />
                            {p?.vehicleNumber || "Not Provided"}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" />
                            {p?.phoneNo || "Not Provided"}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {formatDate(p?.createdAt)}
                        </td>
                        <td className="p-3">
                          <select
                            value={p.active ? "true" : "false"}
                            onChange={(e) =>
                              handleStatusChange(
                                e.target.value === "true",
                                p.deliveryPersonId,
                              )
                            }
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer outline-none transition ${
                              p.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            <option value="true">● Active</option>
                            <option value="false">● Inactive</option>
                          </select>
                        </td>
                        <td className="p-3 text-sm text-black bg-white">
                          <AreaCoverCell text={p?.areaCovered} />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/deliveryPartnerDetails/${p?.deliveryPersonId}`,
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= MOBILE CARD VIEW ================= */}
          <div className="md:hidden space-y-3">
            {partners.map((p, idx) => {
              const serialNo = (page - 1) * PAGE_LIMIT + idx + 1;

              return (
                <div
                  key={p?.deliveryPersonId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs text-gray-400">
                      SL.NO. {serialNo}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                        p?.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p?.active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {p?.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                      {p?.photo?.length > 0 ? (
                        <img
                          src={imageUrls[p.deliveryPersonId] || noDoc}
                          alt={getFullName(p)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(p)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={
                          p?.firstName
                            ? "font-medium text-sm text-gray-800"
                            : "italic text-gray-400 text-sm"
                        }
                      >
                        {getFullName(p)}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 text-xs mt-0.5">
                        <Bike size={12} />
                        {p?.vehicleNumber || "No vehicle on file"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} /> {p?.phoneNo || "Not Provided"}
                    </p>
                    <p className="text-gray-400">
                      Joined {formatDate(p?.createdAt)}
                    </p>
                    <p className="flex items-start gap-1.5">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      {p?.areaCovered ? (
                        <span className="p-3 text-sm text-black bg-white">
                          {p.areaCovered}
                        </span>
                      ) : (
                        <span className="italic text-gray-400">
                          Area not assigned
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/deliveryPartnerDetails/${p?.deliveryPersonId}`,
                      )
                    }
                    className="w-full mt-1 py-2 cursor-pointer rounded-xl bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500">
              Showing page {page} of {totalPages} · {total} total
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPreviousPage && page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers(page, totalPages).map((num, i) =>
                num === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      num === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={!pagination.hasNextPage && page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryPartnerList;
