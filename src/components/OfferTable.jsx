import React, { useState } from "react";
import { Trash2, Loader2, MoreHorizontal, Power } from "lucide-react";

import useOfferStore from "../zustand/Store/offerStore";

import {
  OFFER_ICONS,
  OFFER_ICON_CLASSES,
  formatDate,
  formatNumber,
  getOfferTypeName,
  getRedemptions,
  getStatusLabel,
} from "../utils/offerUtils";

const getStatusClasses = (status) => {
  switch (status) {
    case "ACTIVE":
      return {
        wrapper: "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500",
      };

    case "SCHEDULED":
      return {
        wrapper: "bg-blue-50 text-blue-600",
        dot: "bg-blue-500",
      };

    case "PAUSED":
      return {
        wrapper: "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
      };

    case "EXPIRED":
      return {
        wrapper: "bg-slate-100 text-slate-500",
        dot: "bg-slate-400",
      };

    default:
      return {
        wrapper: "bg-slate-100 text-slate-500",
        dot: "bg-slate-400",
      };
  }
};

const OfferTable = ({
  offers = [],
  loading = false,
  onEditOffer,
  onDeleteSuccess,
}) => {
  const { deleteOffer } = useOfferStore();

  const [deletingOfferId, setDeletingOfferId] = useState(null);

  const handleDeleteOffer = async (e, offer) => {
    e.stopPropagation();

    const isCurrentlyActive = offer.calculatedStatus === "ACTIVE";

    const newStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";

    const actionText = isCurrentlyActive ? "deactivate" : "activate";

    const offerName = offer.offerLabel || offer.offerCode || offer.offerId;

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${offerName}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingOfferId(offer.offerId);

      await deleteOffer({
        offerId: offer.offerId,
        status: newStatus,
      });

      // Refresh offers after status update
      await getAllOffers();
    } catch (error) {
      console.error(`Failed to ${actionText} offer:`, error);
    } finally {
      setDeletingOfferId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse">
          {/* ================================================================
              HEADER
          ================================================================= */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="w-[24%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                OFFER
              </th>

              <th className="w-[14%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                TYPE
              </th>

              <th className="w-[14%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                VALID FROM
              </th>

              <th className="w-[14%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                VALID TO
              </th>

              <th className="w-[13%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                STATUS
              </th>

              <th className="w-[11%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
                REDEMPTIONS
              </th>

              <th className="w-[10%] px-3 py-3 text-right text-[9px] font-semibold tracking-wide text-slate-500">
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* ================================================================
              BODY
          ================================================================= */}

          <tbody>
            {/* LOADING */}

            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="h-48 text-center text-[11px] text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#6655df] border-t-transparent" />

                    <span>Loading offers...</span>
                  </div>
                </td>
              </tr>
            ) : offers.length === 0 ? (
              /* EMPTY */

              <tr>
                <td colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <span className="text-[15px] text-slate-400">%</span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-600">
                      No offers found
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      Try adjusting your filters or search.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              /* OFFERS */

              offers.map((offer, index) => {
                const status = offer.calculatedStatus;

                const statusClasses = getStatusClasses(status);

                const isDeleting = deletingOfferId === offer.offerId;

                return (
                  <tr
                    key={offer.offerId}
                    onClick={() => {
                      if (!isDeleting) {
                        onEditOffer?.(offer);
                      }
                    }}
                    className={`group border-b border-slate-100 bg-white transition-all last:border-b-0 ${
                      isDeleting
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-slate-50/70"
                    }`}
                  >
                    {/* ====================================================
                        OFFER
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[13px] transition-transform group-hover:scale-[1.03] ${
                            OFFER_ICON_CLASSES[index % 5]
                          }`}
                        >
                          {OFFER_ICONS[index % 5]}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[270px] truncate text-[11px] font-semibold text-slate-700">
                            {offer.offerLabel || "-"}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            {offer.offerCode || offer.offerId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ====================================================
                        TYPE
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <span className="text-[10px] text-slate-500">
                        {getOfferTypeName(offer)}
                      </span>
                    </td>

                    {/* ====================================================
                        FROM
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <span className="whitespace-nowrap text-[10px] text-slate-500">
                        {formatDate(offer.fromDate)}
                      </span>
                    </td>

                    {/* ====================================================
                        TO
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <span className="whitespace-nowrap text-[10px] text-slate-500">
                        {formatDate(offer.toDate)}
                      </span>
                    </td>

                    {/* ====================================================
                        STATUS
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium ${statusClasses.wrapper}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                        />

                        {getStatusLabel(status)}
                      </span>
                    </td>

                    {/* ====================================================
                        REDEMPTIONS
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {formatNumber(getRedemptions(offer))}
                      </span>
                    </td>

                    {/* ====================================================
                        ACTIONS
                    ===================================================== */}

                    <td className="px-3 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Delete */}

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => handleDeleteOffer(e, offer)}
                          title={
                            offer.calculatedStatus === "ACTIVE"
                              ? "Deactivate offer"
                              : "Activate offer"
                          }
                          className={`flex h-7 w-7 items-center justify-center rounded-md transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            offer.calculatedStatus === "ACTIVE"
                              ? "text-slate-400 hover:bg-red-50 hover:text-red-500"
                              : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-500"
                          }`}
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : offer.calculatedStatus === "ACTIVE" ? (
                            <Trash2 size={14} />
                          ) : (
                            <Power size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfferTable;
