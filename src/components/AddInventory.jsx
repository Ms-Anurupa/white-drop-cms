import { useEffect, useState } from "react";
import { ArrowLeft, PackagePlus, Save } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import inventoryStore from "@/zustand/Store/inventoryStore";
import { toast } from "react-toastify";

const formatDateForInput = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

const AddInventory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

 const inventoryId = searchParams.get("id");
 const isEditMode = Boolean(inventoryId);

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

  const [entryType, setEntryType] = useState("OPENING");

  const [formData, setFormData] = useState({
    entryDate: formatDateForInput(new Date()),
    openingQty: "",
    unit: "L",
    rate: "",
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

    if (
      inventoryData.closingQty !== null &&
      inventoryData.closingQty !== undefined
    ) {
      setEntryType("CLOSING");
    } else {
      setEntryType("OPENING");
    }

    setFormData({
      entryDate:
        inventoryData.entryDate || inventoryData.dateTime
          ? formatDateForInput(
              inventoryData.entryDate || inventoryData.dateTime,
            )
          : formatDateForInput(new Date()),
      openingQty: inventoryData.openingQty ?? "",
      unit: inventoryData.unit ?? "L",
      rate: inventoryData.rate ?? "",
      produced: inventoryData.produced ?? "",
      bulkStockout: inventoryData.bulkStockout ?? "",
      packetStockout: inventoryData.packetStockout ?? "",
      closingQty: inventoryData.closingQty ?? "",
      wastageQty: inventoryData.wastageQty ?? "",
      wastageNote: inventoryData.wastageNote ?? "",
    });

    setHasChanges(false);
  }, [inventoryData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleEntryTypeChange = (e) => {
    const type = e.target.value;
    setEntryType(type);
    setHasChanges(true);
  };

const buildPayload = () => {
  if (entryType === "OPENING") {
    return {
      dateTime: formData.entryDate, // e.g., "2026-09-11"
      unit: formData.unit,
      openingQty: formData.openingQty === "" ? 0 : Number(formData.openingQty),
      rate: formData.rate !== "" ? Number(formData.rate) : null,
    };
  }

  return {
    ...(inventoryId && { id: inventoryId }),
    dateTime: formData.entryDate,
    closingQty: formData.closingQty !== "" ? Number(formData.closingQty) : null,
    produced: formData.produced !== "" ? Number(formData.produced) : null,
    bulkStockout:
      formData.bulkStockout !== "" ? Number(formData.bulkStockout) : null,
    packetStockout:
      formData.packetStockout !== "" ? Number(formData.packetStockout) : null,
    rate: formData.rate !== "" ? Number(formData.rate) : null,
    wastageQty: formData.wastageQty !== "" ? Number(formData.wastageQty) : null,
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
      // Handles updating closing entries
      await updateInventoryClosingEntry(inventoryId, payload);
      toast.success("Closing inventory entry saved successfully!");
    } else if (entryType === "OPENING") {
      // Handles creating opening entries (POST /admin/createInvOpeningEntry)
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
              : "Record daily stock entry by selecting Opening or Closing submission."}
          </p>
        </div>

        {/* General Information */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            General Information
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="entryType"
                className="mb-1.5 block text-sm font-semibold text-teal-700"
              >
                Entry Type *
              </label>
              <select
                id="entryType"
                name="entryType"
                value={entryType}
                onChange={handleEntryTypeChange}
                className="w-full rounded-lg border border-teal-300 bg-teal-50/50 px-3 py-2 text-sm font-medium text-teal-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="OPENING">Opening Entry</option>
                <option value="CLOSING">Closing Entry</option>
              </select>
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
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
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
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="L">Litre (L)</option>
                <option value="ML">Millilitre (ML)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="G">Gram (G)</option>
              </select>
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

              <div>
                <label
                  htmlFor="rate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Opening Rate (₹/L)
                </label>
                <input
                  id="rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Rate per unit"
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    placeholder="End of day count"
                    required={entryType === "CLOSING"}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rate"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Rate (₹/L)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Rate per unit"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wastageQty"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Wastage Quantity
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

                <div className="md:col-span-3">
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
                    placeholder="Reasons for wastage or additional notes"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
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
};;

export default AddInventory;
