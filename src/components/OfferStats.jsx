import React from "react";
import { formatNumber } from "../utils/offerUtils";

const StatCard = ({ icon, iconClass, value, label }) => {
  return (
    <div className="flex h-[64px] min-w-[145px] items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-md text-[15px] ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[16px] font-semibold leading-none text-slate-800 dark:text-slate-100">
          {value}
        </p>

        <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
};

const OfferStats = ({ active = 0, scheduled = 0, redemptions = 0 }) => {
  return (
    <div className="mb-5 flex flex-wrap gap-2.5">
      <StatCard
        icon="✦"
        iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
        value={active}
        label="Active offers"
      />

      <StatCard
        icon="▣"
        iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
        value={scheduled}
        label="Scheduled"
      />

      <StatCard
        icon="↗"
        iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300"
        value={formatNumber(redemptions)}
        label="Total redemptions"
      />
    </div>
  );
};

export default OfferStats;
