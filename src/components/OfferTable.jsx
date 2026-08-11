import React, { useState } from "react";
import { Trash2, Loader2, Power, X, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const { deleteOffer, getAllOffers } = useOfferStore();
const navigate = useNavigate();
  const [deletingOfferId, setDeletingOfferId] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    offer: null,
    action: null,
  });

  const openConfirmModal = (offer, action) => {
    setConfirmModal({
      open: true,
      offer,
      action,
    });
  };

  const closeConfirmModal = () => {
    if (deletingOfferId) return;

    setConfirmModal({
      open: false,
      offer: null,
      action: null,
    });
  };

  const handleDeleteOffer = async (offer) => {
    if (!offer) return;

    const isCurrentlyActive = offer.calculatedStatus === "ACTIVE";

    const newStatus = !isCurrentlyActive;

    const actionText = isCurrentlyActive
      ? "deactivate"
      : "activate";

    try {
      setDeletingOfferId(offer.offerId);

      await deleteOffer({
        offerId: offer.offerId,
        status: newStatus,
      });

      // Close confirmation modal
      setConfirmModal({
        open: false,
        offer: null,
        action: null,
      });

      // Refresh offers
      await getAllOffers();

      // Notify parent if required
      onDeleteSuccess?.();
    } catch (error) {
      console.error(
        `Failed to ${actionText} offer:`,
        error
      );
    } finally {
      setDeletingOfferId(null);
    }
  };

  const handleActionClick = (e, offer) => {
    e.stopPropagation();

    const status = offer.calculatedStatus;

    /*
     * EXPIRED OFFER
     *
     * Do not show confirmation.
     * Directly open the edit page so the user can
     * select a new timeline.
     */
    if (status === "EXPIRED") {
      onEditOffer?.(offer);
      return;
    }

    /*
     * ACTIVE / SCHEDULED / PAUSED
     *
     * Show confirmation modal before changing status.
     */
    const isCurrentlyActive = status === "ACTIVE";

    openConfirmModal(
      offer,
      isCurrentlyActive ? "deactivate" : "activate"
    );
  };

  const handleEditOffer = (offer) => {
    navigate(`/dashboard/offers/edit/${offer.offerId}`);
  };
  return (
    <>
      {/* ================================================================
          OFFER TABLE
      ================================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            {/* ============================================================
                HEADER
            ============================================================= */}

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

            {/* ============================================================
                BODY
            ============================================================= */}

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
                        <span className="text-[15px] text-slate-400">
                          %
                        </span>
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

                  const statusClasses =
                    getStatusClasses(status);

                  const isDeleting =
                    deletingOfferId === offer.offerId;

                  const isCurrentlyActive =
                    status === "ACTIVE";

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
                      {/* ==================================================
                          OFFER
                      =================================================== */}

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

                      {/* ==================================================
                          TYPE
                      =================================================== */}

                      <td className="px-3 py-3">
                        <span className="text-[10px] text-slate-500">
                          {getOfferTypeName(offer)}
                        </span>
                      </td>

                      {/* ==================================================
                          FROM
                      =================================================== */}

                      <td className="px-3 py-3">
                        <span className="whitespace-nowrap text-[10px] text-slate-500">
                          {formatDate(offer.fromDate)}
                        </span>
                      </td>

                      {/* ==================================================
                          TO
                      =================================================== */}

                      <td className="px-3 py-3">
                        <span className="whitespace-nowrap text-[10px] text-slate-500">
                          {formatDate(offer.toDate)}
                        </span>
                      </td>

                      {/* ==================================================
                          STATUS
                      =================================================== */}

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

                      {/* ==================================================
                          REDEMPTIONS
                      =================================================== */}

                      <td className="px-3 py-3">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {formatNumber(getRedemptions(offer))}
                        </span>
                      </td>

                      {/* ==================================================
                              ACTIONS
                          =================================================== */}

                      <td className="px-3 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            disabled={isDeleting || status === "EXPIRED"}
                            onClick={(e) => {
                              e.stopPropagation();

                              if (status === "EXPIRED") return;

                              handleActionClick(e, offer);
                            }}
                            title={
                              status === "EXPIRED"
                                ? "Expired offers cannot be deleted"
                                : "Delete offer"
                            }
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                              status === "EXPIRED"
                                ? "cursor-not-allowed text-slate-300"
                                : "cursor-pointer text-slate-400 hover:bg-red-50 hover:text-red-500"
                            } disabled:opacity-50`}
                          >
                            {isDeleting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditOffer?.(offer);
                            }}
                            title="Edit offer"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-500"
                          >
                            <Edit size={14} />
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

      {/* ================================================================
          CONFIRMATION MODAL
      ================================================================= */}

      {confirmModal.open && confirmModal.offer && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]"
          onClick={closeConfirmModal}
        >
          <div
            className="w-full max-w-[380px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {confirmModal.action === "deactivate"
                    ? "Deactivate offer?"
                    : "Activate offer?"}
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {confirmModal.action === "deactivate"
                    ? "This offer will no longer be active for customers."
                    : "This offer will be activated for customers."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={!!deletingOfferId}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* OFFER INFO */}

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="truncate text-[11px] font-semibold text-slate-700">
                {confirmModal.offer.offerLabel ||
                  confirmModal.offer.offerCode ||
                  confirmModal.offer.offerId}
              </p>

              {confirmModal.offer.offerCode && (
                <p className="mt-0.5 text-[9px] text-slate-400">
                  {confirmModal.offer.offerCode}
                </p>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={!!deletingOfferId}
                className="rounded-md border border-slate-200 px-3 py-2 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDeleteOffer(confirmModal.offer)
                }
                disabled={!!deletingOfferId}
                className={`flex min-w-[90px] items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmModal.action === "deactivate"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {deletingOfferId ? (
                  <>
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : confirmModal.action === "deactivate" ? (
                  "Deactivate"
                ) : (
                  "Activate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfferTable;

