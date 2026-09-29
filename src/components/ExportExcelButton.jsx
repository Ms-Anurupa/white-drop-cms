/* eslint-disable no-useless-assignment */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { X, FileSpreadsheet } from "lucide-react";
import { toast } from "react-toastify";
import excelStore from "@/zustand/Store/excelStore"; // Adjust this import path to match your project structure

const ExportExcelButton = ({ type, buttonText = "Export To Excel" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Connect directly to your Zustand store
  const { isDownloading, downloadExcel } = excelStore();

  // Modal form states
  const [dateType, setDateType] = useState("preset");
  const [presetSelection, setPresetSelection] = useState("this_month");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  // Reset modal state every time it opens
  useEffect(() => {
    if (isOpen) {
      setDateType("preset");
      setPresetSelection("this_month");
      setCustomFromDate("");
      setCustomToDate("");
    }
  }, [isOpen]);

  const calculatePresetDates = (preset) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (preset === "this_month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === "this_quarter") {
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
    } else if (preset === "this_year") {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    }

    const formatDt = (dt) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return {
      from: formatDt(startDate),
      to: formatDt(endDate),
    };
  };

  const handleGenerateClick = async () => {
    let finalFromDate = "";
    let finalToDate = "";

    if (dateType === "preset") {
      const dates = calculatePresetDates(presetSelection);
      finalFromDate = dates.from;
      finalToDate = dates.to;
    } else {
      finalFromDate = customFromDate;
      finalToDate = customToDate;

      if (!finalFromDate || !finalToDate) {
        toast.error("Please select both From and To dates.");
        return;
      }
      if (new Date(finalFromDate) > new Date(finalToDate)) {
        toast.error("'From' date cannot be later than 'To' date.");
        return;
      }
    }

    try {
      // Call your Zustand store directly
      await downloadExcel(type, finalFromDate, finalToDate);
      toast.success("Excel file downloaded successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to download Excel file.");
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isDownloading}
        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet size={18} className={isDownloading ? "animate-pulse text-blue-500" : ""} />
        {isDownloading ? "Exporting..." : buttonText}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white shadow-xl duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 text-gray-800">
                <FileSpreadsheet size={20} className="text-emerald-500" />
                <h2 className="text-base font-semibold">Export to Excel</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDownloading}
                className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Radio Selection */}
                <div className="flex gap-6 border-b border-gray-100 pb-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={dateType === "preset"}
                      onChange={() => setDateType("preset")}
                      disabled={isDownloading}
                      className="h-4 w-4 cursor-pointer text-blue-600 transition focus:ring-blue-500"
                    />
                    Pre-set Windows
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={dateType === "custom"}
                      onChange={() => setDateType("custom")}
                      disabled={isDownloading}
                      className="h-4 w-4 cursor-pointer text-blue-600 transition focus:ring-blue-500"
                    />
                    Custom Range
                  </label>
                </div>

                {/* Dynamic Inputs */}
                <div className="min-h-[70px]">
                  {dateType === "preset" ? (
                    <div className="animate-in fade-in duration-200">
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Select Timeframe <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={presetSelection}
                        onChange={(e) => setPresetSelection(e.target.value)}
                        disabled={isDownloading}
                        className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="this_month">This Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                          From Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={customFromDate}
                          onChange={(e) => setCustomFromDate(e.target.value)}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          disabled={isDownloading}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                          To Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={customToDate}
                          onChange={(e) => setCustomToDate(e.target.value)}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          disabled={isDownloading}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isDownloading}
                  className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateClick}
                  disabled={isDownloading}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  )}
                  {isDownloading ? "Exporting..." : "Export"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportExcelButton;