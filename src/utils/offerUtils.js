export const STATUS_TABS = [
  {
    key: "ALL",
    label: "All",
  },
  {
    key: "ACTIVE",
    label: "Active",
  },
  {
    key: "EXPIRED",
    label: "Expired",
  },
];

export const OFFER_ICONS = ["✦", "ϟ", "♧", "✣", "🎟"];

export const OFFER_ICON_CLASSES = [
  "bg-cyan-50 text-cyan-600 border-cyan-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-violet-50 text-violet-600 border-violet-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-pink-50 text-pink-600 border-pink-100",
];

/* =========================================================
   OFFER STATUS
========================================================= */

export const getOfferStatus = (offer) => {
  if (!offer) {
    return "EXPIRED";
  }

  const now = new Date();

  const fromDate = new Date(offer.fromDate);

  const toDate = new Date(offer.toDate);

  if (Number.isNaN(fromDate.getTime())) {
    return "EXPIRED";
  }

  if (Number.isNaN(toDate.getTime())) {
    return "EXPIRED";
  }

  if (!offer.isActive) {
    return "PAUSED";
  }

  if (now < fromDate) {
    return "SCHEDULED";
  }

  if (now > toDate) {
    return "EXPIRED";
  }

  return "ACTIVE";
};

/* =========================================================
   STATUS LABEL
========================================================= */

export const getStatusLabel = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "SCHEDULED":
      return "Scheduled";

    case "PAUSED":
      return "Paused";

    case "EXPIRED":
      return "Expired";

    default:
      return status || "-";
  }
};

/* =========================================================
   DATE FORMAT
========================================================= */

export const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   NUMBER FORMAT
========================================================= */

export const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

/* =========================================================
   OFFER TYPE
========================================================= */

export const getOfferTypeName = (offer) => {
  if (!offer?.offerType) {
    return "-";
  }

  if (typeof offer.offerType === "string") {
    return offer.offerType;
  }

  return offer.offerType.name || "-";
};

/* =========================================================
   REDEMPTIONS
========================================================= */

export const getRedemptions = (offer) => {
  return (
    offer?.redemptions ??
    offer?.totalRedemptions ??
    offer?._count?.orderItems ??
    0
  );
};
