import React from "react";

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

const OfferTable = ({ offers = [], loading = false, onEditOffer }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="w-[30%] px-3 py-3 text-left text-[9px] font-semibold tracking-wide text-slate-500">
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

            <th className="w-10 px-2 py-3"></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={7}
                className="h-48 text-center text-[11px] text-slate-400"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#6655df] border-t-transparent" />
                  Loading offers...
                </div>
              </td>
            </tr>
          ) : offers.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="h-48 text-center text-[11px] text-slate-400"
              >
                No offers found
              </td>
            </tr>
          ) : (
            offers.map((offer, index) => {
              const status = offer.calculatedStatus;

              const statusClasses = getStatusClasses(status);

              return (
                <tr
                  key={offer.offerId}
                  onClick={() => onEditOffer?.(offer)}
                  className="group cursor-pointer border-b border-slate-100 bg-white transition hover:bg-slate-50"
                >
                  {/* OFFER */}

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[13px] ${
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

                  {/* TYPE */}

                  <td className="px-3 py-3">
                    <span className="text-[10px] text-slate-500">
                      {getOfferTypeName(offer)}
                    </span>
                  </td>

                  {/* FROM */}

                  <td className="px-3 py-3">
                    <span className="whitespace-nowrap text-[10px] text-slate-500">
                      {formatDate(offer.fromDate)}
                    </span>
                  </td>

                  {/* TO */}

                  <td className="px-3 py-3">
                    <span className="whitespace-nowrap text-[10px] text-slate-500">
                      {formatDate(offer.toDate)}
                    </span>
                  </td>

                  {/* STATUS */}

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

                  {/* REDEMPTIONS */}

                  <td className="px-3 py-3">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {formatNumber(getRedemptions(offer))}
                    </span>
                  </td>

                  {/* MENU */}

                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md p-1 text-[16px] leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OfferTable;
