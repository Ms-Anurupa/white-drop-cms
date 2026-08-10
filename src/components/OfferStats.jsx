import React from "react";
import { formatNumber } from "../utils/offerUtils";

const StatCard = ({ icon, iconClass, value, label }) => {
  return (
    <div className="flex h-[64px] min-w-[145px] items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 shadow-sm">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-md text-[15px] ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[16px] font-semibold leading-none text-slate-800">
          {value}
        </p>

        <p className="mt-1 text-[9px] text-slate-500">{label}</p>
      </div>
    </div>
  );
};

const OfferStats = ({ active = 0, scheduled = 0, redemptions = 0 }) => {
  return (
    <div className="mb-5 flex flex-wrap gap-2.5">
      <StatCard
        icon="✦"
        iconClass="bg-emerald-50 text-emerald-600"
        value={active}
        label="Active offers"
      />

      <StatCard
        icon="▣"
        iconClass="bg-blue-50 text-blue-600"
        value={scheduled}
        label="Scheduled"
      />

      <StatCard
        icon="↗"
        iconClass="bg-violet-50 text-violet-600"
        value={formatNumber(redemptions)}
        label="Total redemptions"
      />
    </div>
  );
};

export default OfferStats;
