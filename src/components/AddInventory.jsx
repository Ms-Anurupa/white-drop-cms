import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PackagePlus, Save } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import inventoryStore from "@/zustand/Store/inventoryStore";
import { toast } from "react-toastify";

const formatDateForInput = (date) => {
  if (!date) return "";

  // If date is in DD-MM-YYYY format, convert to YYYY-MM-DD for standard parsing
  if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    const [day, month, year] = date.split("-");
    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

const AddInventory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const inventoryId = searchParams.get("id");
  const isEditMode = Boolean(inventoryId);

  // Passed from the listing page:
  // - entryType: "OPENING" | "CLOSING" — forces the type, locked either way
  // - selectedDate: the row's opening date — locks the date field for Closing Entry
  // - existingDates: dates already used, to disable in the picker for fresh Opening entries
  const navState = location.state || {};
  const forcedEntryType = navState.entryType; // "OPENING" | "CLOSING"
  const lockedDate = navState.selectedDate
    ? formatDateForInput(navState.selectedDate)
    : null;

  // Zustand Actions
  const createOpeningInventory = inventoryStore(
    (state) => state.createOpeningInventory,
  );
  const updateInventoryClosingEntry = inventoryStore(
    (state) => state.updateInventoryClosingEntry,
  );
  const getMilkInventoryById = inventoryStore(
    (state) => state.getMilkInventoryById,
  );
  const clearInventoryData = inventoryStore(
    (state) => state.clearInventoryData,
  );
  const inventoryData = inventoryStore((state) => state.inventoryData);

  // Entry type is always derived/locked — never user-editable.
  // Fresh "Add entry" (no id, no state) => OPENING.
  const [entryType, setEntryType] = useState(
    forcedEntryType === "CLOSING" ? "CLOSING" : "OPENING",
  );

 

  const [formData, setFormData] = useState({
    entryDate: lockedDate || formatDateForInput(new Date()),
    openingQty: "",
    unit: "L",
    produced: "",
    bulkStockout: "",
    packetStockout: "",
    closingQty: "",
    wastageQty: "",
    wastageNote: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      if (!inventoryId) {
        clearInventoryData();
        return;
      }

      try {
        setLoading(true);
        setHasChanges(false);
        await getMilkInventoryById(inventoryId);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();

    return () => {
      clearInventoryData();
    };
  }, [inventoryId, getMilkInventoryById, clearInventoryData]);

  useEffect(() => {
    if (!isEditMode || !inventoryData) return;

    if (forcedEntryType === "CLOSING") {
      // Opened via the row's "Closing Entry" action — always Closing.
      setEntryType("CLOSING");
    } else if (
      inventoryData.closingQty !== null &&
      inventoryData.closingQty !== undefined
    ) {
      setEntryType("CLOSING");
    } else {
      setEntryType("OPENING");
    }

    setFormData({
      entryDate: lockedDate || formatDateForInput(inventoryData.entryDate) || formatDateForInput(new Date()),
      openingQty: inventoryData.openingQty ?? "",
      unit: inventoryData.unit ?? "L",
      produced: inventoryData.produced ?? "",
      bulkStockout: inventoryData.bulkStockout ?? "",
      packetStockout: inventoryData.packetStockout ?? "",
      closingQty: inventoryData.closingQty ?? "",
      wastageQty: inventoryData.wastageQty ?? "",
      wastageNote: inventoryData.wastageNote ?? "",
    });

    setHasChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData, isEditMode, forcedEntryType]);

  // Dates that already have an entry — disables them in the date picker.
  // Only relevant for fresh Opening entries; Closing entries have a locked date anyway.
  const usedDates = useMemo(() => {
    const raw = navState.existingDates || [];
    const normalized = raw.map((d) => formatDateForInput(d)).filter(Boolean);

    const ownDate = inventoryData?.entryDate || inventoryData?.dateTime;
    const ownFormatted = ownDate ? formatDateForInput(ownDate) : null;

    return new Set(normalized.filter((d) => d !== ownFormatted));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData]);

  // Entries can only be backdated up to 72 hours; no future dates.
  const minSelectableDate = useMemo(
    () => formatDateForInput(new Date(Date.now() - 72 * 60 * 60 * 1000)),
    [],
  );
  const maxSelectableDate = useMemo(() => formatDateForInput(new Date()), []);

  // Date field is disabled entirely for Closing entries (locked to the opening date).
  const isDateLocked = entryType === "CLOSING";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "entryDate") {
      if (isDateLocked) return; // safety net, input is disabled anyway
      if (usedDates.has(value)) {
        toast.error(
          "An entry already exists for this date. Pick another date.",
        );
        return;
      }
      if (value < minSelectableDate || value > maxSelectableDate) {
        toast.error("Entries can only be made for the past 72 hours.");
        return;
      }
    }

    if (name === "wastageQty") {
      const clearingWastage = value === "" || Number(value) <= 0;
      setFormData((prev) => ({
        ...prev,
        wastageQty: value,
        wastageNote: clearingWastage ? "" : prev.wastageNote,
      }));
      setHasChanges(true);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const buildPayload = () => {
    if (entryType === "OPENING") {
      return {
        dateTime: formData.entryDate, // e.g., "2026-09-11"
        unit: formData.unit,
        openingQty:
          formData.openingQty === "" ? 0 : Number(formData.openingQty),
      };
    }

    return {
      ...(inventoryId && { id: inventoryId }),
      dateTime: formData.entryDate,
      closingQty:
        formData.closingQty !== "" ? Number(formData.closingQty) : null,
      produced: formData.produced !== "" ? Number(formData.produced) : null,
      bulkStockout:
        formData.bulkStockout !== "" ? Number(formData.bulkStockout) : null,
      packetStockout:
        formData.packetStockout !== "" ? Number(formData.packetStockout) : null,
      wastageQty:
        formData.wastageQty !== "" ? Number(formData.wastageQty) : null,
      wastageNote: formData.wastageNote.trim() || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode && !hasChanges) return;

    try {
      setSubmitting(true);
      const payload = buildPayload();

      if (entryType === "CLOSING") {
        await updateInventoryClosingEntry(inventoryId, payload);
        toast.success("Closing inventory entry saved successfully!");
      } else if (entryType === "OPENING") {
        await createOpeningInventory(payload);
        toast.success("Opening inventory entry created successfully!");
      }

      navigate("/dashboard/inventory");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save inventory entry",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-gray-500">
          Loading inventory details...
        </div>
      </div>
    );
  }

  const hasWastageQty = formData.wastageQty !== "" && Number(formData.wastageQty) > 0;


  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-5">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </button>

          <div className="flex items-center gap-2">
            <PackagePlus size={22} className="text-teal-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Inventory Record" : "New Inventory Record"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update daily milk inventory entry."
              : "Record daily stock entry as an Opening submission."}
          </p>
        </div>

        {/* General Information */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            General Information
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-teal-700">
                Entry Type
              </label>
              {/* Locked — display only, cannot be changed by the user */}
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                  entryType === "OPENING"
                    ? "border-teal-300 bg-teal-50/50 text-teal-900"
                    : "border-amber-300 bg-amber-50/50 text-amber-900"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    entryType === "OPENING" ? "bg-teal-500" : "bg-amber-500"
                  }`}
                />
                {entryType === "OPENING" ? "Opening Entry" : "Closing Entry"}
              </div>
            </div>

            <div>
              <label
                htmlFor="entryDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Entry Date *
              </label>
              <input
                id="entryDate"
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                min={minSelectableDate}
                max={maxSelectableDate}
                required
                disabled={isDateLocked}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  isDateLocked
                    ? "border-gray-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "border-gray-200 focus:border-teal-500"
                }`}
              />
              {isDateLocked ? (
                <p className="mt-1 text-xs text-red-400 font-bold">
                  Closing entry date matches the recorded opening date.
                </p>
              ) : (
                <>
                  {usedDates.size > 0 && (
                    <p className="mt-1 text-xs text-red-400 font-bold">
                      Dates that already have an entry can't be selected.
                    </p>
                  )}
                  <p className="mt-1 text-xs text-red-400 font-bold">
                    Entries are limited to the past 72 hours.
                  </p>
                </>
              )}
            </div>

            <div>
              <label
                htmlFor="unit"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Unit of Measurement
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={entryType === "CLOSING"}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  entryType === "CLOSING"
                    ? "border-gray-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "border-gray-200 bg-white focus:border-teal-500"
                }`}
              >
                <option value="L">Litre (L)</option>
                <option value="ML">Millilitre (ML)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="G">Gram (G)</option>
              </select>
              {entryType === "CLOSING" && (
                <p className="mt-1 text-xs text-red-400 font-bold">
                  Unit matches the recorded opening entry.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* OPENING ENTRY SECTION */}
        {entryType === "OPENING" && (
          <div className="space-y-4 rounded-2xl border border-teal-100 bg-teal-50/30 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-teal-900">
              1. Opening Stock
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="openingQty"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Opening Quantity *
                </label>
                <input
                  id="openingQty"
                  type="number"
                  name="openingQty"
                  value={formData.openingQty}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required={entryType === "OPENING"}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* CLOSING ENTRY SECTION */}
        {entryType === "CLOSING" && (
          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                1. Stock Movement & Production
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="produced"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Produced Qty
                  </label>
                  <input
                    id="produced"
                    type="number"
                    name="produced"
                    value={formData.produced}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Addition to stock"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bulkStockout"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Bulk Stockout Qty
                  </label>
                  <input
                    id="bulkStockout"
                    type="number"
                    name="bulkStockout"
                    value={formData.bulkStockout}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Bulk dispatched"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="packetStockout"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Packet Stockout Qty
                  </label>
                  <input
                    id="packetStockout"
                    type="number"
                    name="packetStockout"
                    value={formData.packetStockout}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Packets dispatched"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-amber-900">
                2. Closing Stock & Wastage
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="closingQty"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Closing Quantity *
                  </label>
                  <input
                    id="closingQty"
                    type="number"
                    name="closingQty"
                    value={formData.closingQty}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter closing quantity"
                    required={entryType === "CLOSING"}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wastageQty"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Wastage Quantity{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="wastageQty"
                    type="number"
                    name="wastageQty"
                    value={formData.wastageQty}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Spoilage or leaks"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="wastageNote"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Wastage Note / Remarks
                  </label>
                  <textarea
                    id="wastageNote"
                    name="wastageNote"
                    value={formData.wastageNote}
                    onChange={handleChange}
                    rows={3}
                    disabled={!hasWastageQty}
                    placeholder={
                      hasWastageQty
                        ? "Reasons for wastage or additional notes"
                        : "Enter a wastage quantity to add a note"
                    }
                    className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 ${
                      hasWastageQty
                        ? "border-gray-200 bg-white focus:border-teal-500"
                        : "border-gray-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            disabled={submitting}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          {(!isEditMode || hasChanges) && (
            <button
              type="submit"
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? `Update ${
                      entryType === "OPENING" ? "Opening" : "Closing"
                    } Entry`
                  : `Save ${
                      entryType === "OPENING" ? "Opening" : "Closing"
                    } Entry`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddInventory;