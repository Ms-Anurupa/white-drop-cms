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

  const createInventory = inventoryStore((state) => state.createInventory);

  const getMilkInventoryById = inventoryStore(
    (state) => state.getMilkInventoryById,
  );

  const clearInventoryData = inventoryStore(
    (state) => state.clearInventoryData,
  );

  const inventoryData = inventoryStore((state) => state.inventoryData);

  const [formData, setFormData] = useState({
    entryDate: formatDateForInput(new Date()),
    qty: "",
    unit: "L",
    rate: "",
    type: "OPENING",
    wastageQty: "",
    remarks: "",
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

    setFormData({
      entryDate: inventoryData.entryDate
        ? formatDateForInput(inventoryData.entryDate)
        : formatDateForInput(new Date()),

      qty: inventoryData.qty ?? "",
      unit: inventoryData.unit ?? "L",
      rate: inventoryData.rate ?? "",
      type: inventoryData.type ?? "OPENING",
      wastageQty: inventoryData.wastageQty ?? "",
      remarks: inventoryData.remarks ?? "",
    });

    setHasChanges(false);
  }, [inventoryData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      if (name === "type") {
        if (value === "OPENING") {
          updatedData.wastageQty = "";
          updatedData.remarks = "";
        }

        if (value === "CLOSING") {
          updatedData.rate = "";
        }
      }

      return updatedData;
    });

    setHasChanges(true);
  };

  const buildPayload = () => {
    const payload = {
      entryDate: formData.entryDate,
      qty: Number(formData.qty),
      unit: formData.unit,
      type: formData.type,
    };

    if (formData.type === "OPENING") {
      payload.rate = formData.rate === "" ? null : Number(formData.rate);

      payload.wastageQty = null;
      payload.remarks = null;
    }

    if (formData.type === "CLOSING") {
      payload.rate = null;

      payload.wastageQty =
        formData.wastageQty === "" ? null : Number(formData.wastageQty);

      payload.remarks = formData.remarks.trim() || null;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode && !hasChanges) return;

    try {
      setSubmitting(true);

      const payload = buildPayload();

      console.log(
        isEditMode ? "UPDATE INVENTORY PAYLOAD:" : "CREATE INVENTORY PAYLOAD:",
        payload,
      );

      await createInventory(payload);
      toast.success("Inventory entry created successfully");

      navigate("/dashboard/inventory");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create inventory entry",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-gray-500">Loading inventory...</div>
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
            className="cursor-pointer mb-3 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </button>

          <div className="flex items-center gap-2">
            <PackagePlus size={22} className="text-blue-600" />

            <h1 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Inventory" : "Add Inventory"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update the inventory entry."
              : "Add an opening or closing inventory entry."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Inventory Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="entryDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Entry Date <span className="text-red-500">*</span>
              </label>

              <input
                id="entryDate"
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Entry Type <span className="text-red-500">*</span>
              </label>

              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="OPENING">Opening</option>

                <option value="CLOSING">Closing</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="qty"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Quantity <span className="text-red-500">*</span>
              </label>

              <input
                id="qty"
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter quantity"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="unit"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Unit <span className="text-red-500">*</span>
              </label>

              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="L">Litre (L)</option>
                <option value="ML">Millilitre (ML)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="G">Gram (G)</option>
              </select>
            </div>
            {formData.type === "OPENING" && (
              <div>
                <label
                  htmlFor="rate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Rate
                </label>

                <input
                  id="rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter rate"
                  disabled={formData.type === "CLOSING"}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            )}

            {formData.type === "CLOSING" && (
              <>
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
                    placeholder="Enter wastage quantity"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="remarks"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Remarks{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter closing remarks"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}
          </div>
        </div>

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
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update Inventory"
                  : "Save Inventory"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
