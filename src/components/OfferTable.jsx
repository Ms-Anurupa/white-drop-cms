import React, { useState } from "react";
import { Trash2, Loader2, X, Edit } from "lucide-react";
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

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const getStatusClasses = (status) => {
  switch (status) {
    case "ACTIVE":
      return { wrapper: "bg-[#ECFDF5] text-[#059669]", dot: "bg-[#059669]" };
    case "SCHEDULED":
      return { wrapper: "bg-[#EFF6FF] text-[#2563EB]", dot: "bg-[#2563EB]" };
    case "PAUSED":
      return { wrapper: "bg-[#FFFBEB] text-[#D97706]", dot: "bg-[#D97706]" };
    case "EXPIRED":
      return { wrapper: "bg-[#F1F5F9] text-[#64748B]", dot: "bg-[#64748B]" };
    default:
      return { wrapper: "bg-[#F1F5F9] text-[#64748B]", dot: "bg-[#64748B]" };
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

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    offer: null,
    action: null,
  });

  const openConfirmModal = (offer, action) => {
    setConfirmModal({ open: true, offer, action });
  };

  const closeConfirmModal = () => {
    if (deletingOfferId) return;
    setConfirmModal({ open: false, offer: null, action: null });
  };

  const handleDeleteOffer = async (offer) => {
    if (!offer) return;
    const isCurrentlyActive = offer.calculatedStatus === "ACTIVE";
    const newStatus = !isCurrentlyActive;
    const actionText = isCurrentlyActive ? "deactivate" : "activate";

    try {
      setDeletingOfferId(offer.offerId);
      await deleteOffer({ offerId: offer.offerId, status: newStatus });
      setConfirmModal({ open: false, offer: null, action: null });
      await getAllOffers();
      onDeleteSuccess?.();
    } catch (error) {
      console.error(`Failed to ${actionText} offer:`, error);
    } finally {
      setDeletingOfferId(null);
    }
  };

  const handleActionClick = (e, offer) => {
    e.stopPropagation();
    const status = offer.calculatedStatus;

    if (status === "EXPIRED") {
      onEditOffer?.(offer);
      return;
    }

    const isCurrentlyActive = status === "ACTIVE";
    openConfirmModal(offer, isCurrentlyActive ? "deactivate" : "activate");
  };

  const handleEditOffer = (offer) => {
    navigate(`/dashboard/offers/edit/${offer.offerId}`);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#E5E7F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7F0] bg-[#F7F8FC]/80">
                {[
                  "OFFER",
                  "TYPE",
                  "VALID FROM",
                  "VALID TO",
                  "STATUS",
                  "REDEMPTIONS",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-3 text-[9px] font-semibold tracking-[0.08em] text-[#9AA1B8] ${i === 0 ? "w-[24%] text-left" : "text-left"
                      }`}
                    style={mono}
                  >
                    {h}
                  </th>
                ))}
                <th
                  className="px-3 py-3 text-right text-[9px] font-semibold tracking-[0.08em] text-[#9AA1B8]"
                  style={mono}
                >
                  ACTIONS
                </th>
              </tr>
              {/* signature accent line under header */}
              <tr>
                <td
                  colSpan={7}
                  className="h-[2px] bg-gradient-to-r from-[#6655DF]/50 via-[#14B8A6]/40 to-transparent"
                />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="h-48 text-center text-[11px] text-[#9AA1B8]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#6655DF] border-t-transparent" />
                      <span style={mono}>Loading offers...</span>
                    </div>
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9]">
                        <span className="text-[15px] text-[#9AA1B8]">%</span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#5C6480]">
                        No offers found
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#9AA1B8]">
                        Try adjusting your filters or search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                offers.map((offer, index) => {
                  const status = offer.calculatedStatus;
                  const statusClasses = getStatusClasses(status);
                  const isDeleting = deletingOfferId === offer.offerId;

                  return (
                    <tr
                      key={offer.offerId}
                      onClick={() => !isDeleting && onEditOffer?.(offer)}
                      className={`group relative border-b border-[#F0F1F6] transition-all last:border-b-0 ${isDeleting
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-[#F7F8FC]"
                        }`}
                    >
                      <td className="relative px-3 py-3">
                        {/* left accent bar on hover */}
                        <span className="absolute left-0 top-0 h-full w-[2px] scale-y-0 bg-gradient-to-b from-[#6655DF] to-[#14B8A6] transition-transform duration-200 group-hover:scale-y-100" />
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[13px] transition-transform group-hover:scale-[1.05] ${OFFER_ICON_CLASSES[index % 5]
                              }`}
                          >
                            {OFFER_ICONS[index % 5]}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[270px] truncate text-[11px] font-semibold text-[#12151F]">
                              {offer.offerLabel || "-"}
                            </p>
                            <p
                              className="mt-0.5 truncate text-[9px] text-[#9AA1B8]"
                              style={mono}
                            >
                              {offer.offerCode || offer.offerId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="text-[10px] text-[#5C6480]">
                          {getOfferTypeName(offer)}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className="whitespace-nowrap text-[10px] text-[#5C6480]"
                          style={mono}
                        >
                          {formatDate(offer.fromDate)}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className="whitespace-nowrap text-[10px] text-[#5C6480]"
                          style={mono}
                        >
                          {formatDate(offer.toDate)}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium ${statusClasses.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                          />
                          {getStatusLabel(status)}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className="text-[11px] font-semibold text-[#12151F]"
                          style={mono}
                        >
                          {formatNumber(getRedemptions(offer))}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${status === "EXPIRED"
                                ? "cursor-not-allowed text-[#CBD1E0]"
                                : "cursor-pointer text-[#9AA1B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                              } disabled:opacity-50`}
                          >
                            {isDeleting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditOffer?.(offer);
                            }}
                            title="Edit offer"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#9AA1B8] transition-all hover:bg-[#6655DF]/10 hover:text-[#6655DF]"
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

      {confirmModal.open && confirmModal.offer && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]"
          onClick={closeConfirmModal}
        >
          <div
            className="w-full max-w-[380px] rounded-xl border border-[#E5E7F0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className="text-sm font-semibold text-[#12151F]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {confirmModal.action === "deactivate"
                    ? "Deactivate offer?"
                    : "Activate offer?"}
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-[#5C6480]">
                  {confirmModal.action === "deactivate"
                    ? "This offer will no longer be active for customers."
                    : "This offer will be activated for customers."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={!!deletingOfferId}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9AA1B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#5C6480] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] px-3 py-2.5">
              <p className="truncate text-[11px] font-semibold text-[#12151F]">
                {confirmModal.offer.offerLabel ||
                  confirmModal.offer.offerCode ||
                  confirmModal.offer.offerId}
              </p>
              {confirmModal.offer.offerCode && (
                <p className="mt-0.5 text-[9px] text-[#9AA1B8]" style={mono}>
                  {confirmModal.offer.offerCode}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={!!deletingOfferId}
                className="rounded-md border border-[#E5E7F0] px-3 py-2 text-[10px] font-medium text-[#5C6480] transition-colors hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOffer(confirmModal.offer)}
                disabled={!!deletingOfferId}
                className={`flex min-w-[90px] items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${confirmModal.action === "deactivate"
                    ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                    : "bg-[#059669] hover:bg-[#047857]"
                  }`}
              >
                {deletingOfferId ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
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
