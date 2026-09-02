/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, PackagePlus, Save } from "lucide-react";
import inventoryStore from "@/zustand/Store/inventoryStore";

const UpdateInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getMilkInventoryById = inventoryStore(
    (state) => state.getMilkInventoryById,
  );
  const inventoryData = inventoryStore((state) => state.inventoryData);
  const createInventory = inventoryStore((state) => state.createInventory);
  const [inventoryDataList, setInventoryDataList] = useState({
    entryDate: "",
    bulkUnit: "L",
    bulkProducedQty: "",
    wastageQty: 0,
  });
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Inventory ID is missing.");
      setLoading(false);
      return;
    }

    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");
        await getMilkInventoryById(id);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);

        setError(error?.response?.data?.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [id, getMilkInventoryById]);

  useEffect(() => {
    if (!inventoryData) return;
    // console.log("INVENTORY DATA:", inventoryData);
    // console.log("API ENTRY DATE:", inventoryData.entryDate);

    const formattedEntryDate = formatDateForInput(inventoryData.entryDate);

    // console.log("FORM ENTRY DATE:", formattedEntryDate);

    const formattedStockIn = Array.isArray(inventoryData.stockIn)
      ? inventoryData.stockIn.map((item) => ({
          id: item.id,

          isLoose: Boolean(item.isLoose),

          unit: item.unit ?? inventoryData.bulkUnit ?? "L",

          ...(item.isLoose
            ? {
                quantity: item.qty ?? item.quantity ?? 0,

                unitSize: undefined,
                packets: undefined,
              }
            : {
                quantity: undefined,

                unitSize: item.unitSize ?? 1,

                packets: item.packets ?? 1,
              }),
        }))
      : [];

    const formattedStockOut = Array.isArray(inventoryData.stockOut)
      ? inventoryData.stockOut.map((item) => ({
          id: item.id,

          isLoose: Boolean(item.isLoose),

          unit: item.unit ?? inventoryData.bulkUnit ?? "L",

          ...(item.isLoose
            ? {
                quantity: item.qty ?? item.quantity ?? 0,

                unitSize: undefined,
                packets: undefined,
              }
            : {
                quantity: undefined,

                unitSize: item.unitSize ?? 1,

                packets: item.packets ?? 1,
              }),
        }))
      : [];

    const formData = {
      entryDate: formattedEntryDate,

      bulkUnit: inventoryData.bulkUnit ?? "L",

      bulkProducedQty: inventoryData.bulkProducedQty ?? "",

      wastageQty: inventoryData.wastageQty ?? 0,
    };

    console.log("FINAL FORM DATA:", formData);

    setInventoryDataList(formData);

    setStockIn(formattedStockIn);

    setStockOut(formattedStockOut);

    setOriginalData({
      inventoryDataList: JSON.parse(JSON.stringify(formData)),

      stockIn: JSON.parse(JSON.stringify(formattedStockIn)),

      stockOut: JSON.parse(JSON.stringify(formattedStockOut)),
    });
  }, [inventoryData]);

  const hasChanges = (() => {
    if (!originalData) return false;

    const currentData = {
      inventoryDataList,
      stockIn,
      stockOut,
    };

    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInventoryDataList((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addStockIn = () => {
    setStockIn((prev) => [
      ...prev,
      {
        id: undefined,
        isLoose: false,
        unit: inventoryDataList.bulkUnit || "L",
        unitSize: 1,
        packets: 1,
        quantity: undefined,
      },
    ]);
  };

  const removeStockIn = (index) => {
    setStockIn((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStockIn = (index, field, value) => {
    setStockIn((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (field === "isLoose") {
          const isLoose = value === true;

          return {
            ...item,

            isLoose,

            ...(isLoose
              ? {
                  quantity: item.quantity ?? 0,

                  unitSize: undefined,

                  packets: undefined,
                }
              : {
                  unitSize: item.unitSize ?? 1,

                  packets: item.packets ?? 1,

                  quantity: undefined,
                }),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const addStockOut = () => {
    setStockOut((prev) => [
      ...prev,
      {
        id: undefined,
        isLoose: false,
        unit: inventoryDataList.bulkUnit || "L",
        unitSize: 1,
        packets: 1,
        quantity: undefined,
      },
    ]);
  };

  const removeStockOut = (index) => {
    setStockOut((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStockOut = (index, field, value) => {
    setStockOut((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (field === "isLoose") {
          const isLoose = value === true;

          return {
            ...item,

            isLoose,

            ...(isLoose
              ? {
                  quantity: item.quantity ?? 0,

                  unitSize: undefined,

                  packets: undefined,
                }
              : {
                  unitSize: item.unitSize ?? 1,

                  packets: item.packets ?? 1,

                  quantity: undefined,
                }),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };
  const handleUpdateInventory = async (e) => {
    e.preventDefault();

    if (!id) {
      setError("Inventory ID is missing.");
      return;
    }

    if (!hasChanges) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        id,

        entryDate: new Date(inventoryDataList.entryDate).toISOString(),

        bulkUnit: inventoryDataList.bulkUnit,

        bulkProducedQty: Number(inventoryDataList.bulkProducedQty),

        wastageQty: Number(inventoryDataList.wastageQty),

        stockIn: stockIn.map((item) => {
          // LOOSE
          if (item.isLoose) {
            return {
              ...(item.id && { id: item.id }),
              isLoose: true,
              unit: item.unit,
              quantity: Number(item.quantity ?? 0),
            };
          }

          // PACKET
          return {
            ...(item.id && { id: item.id }),
            isLoose: false,
            unit: item.unit,
            unitSize: Number(item.unitSize ?? 0),
            packets: Number(item.packets ?? 0),
          };
        }),

        stockOut: stockOut.map((item) => {
          // LOOSE
          if (item.isLoose) {
            return {
              ...(item.id && { id: item.id }),
              isLoose: true,
              unit: item.unit,
              quantity: Number(item.quantity ?? 0),
            };
          }

          // PACKET
          return {
            ...(item.id && { id: item.id }),
            isLoose: false,
            unit: item.unit,
            unitSize: Number(item.unitSize ?? 0),
            packets: Number(item.packets ?? 0),
          };
        }),
      };

      //   console.log("================================");
      //   console.log("UPDATE INVENTORY ID:", id);
      //   console.log("UPDATE INVENTORY PAYLOAD:", payload);
      //   console.log("ENTRY DATE:", payload.entryDate);
      //   console.log("================================");

      await createInventory(payload);

      navigate("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to update inventory:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update inventory.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Inventory not found."}</p>

          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/inventory")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
            >
              <ArrowLeft size={16} />
              Back to Inventory
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Update Inventory
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Update the inventory details below.
            </p>
          </div>

          {hasChanges && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unsaved changes
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateInventory} className="space-y-6">
          {/* ==================================================
              PRODUCTION DETAILS
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <PackagePlus size={18} className="text-gray-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Production Details
                  </h2>

                  <p className="text-xs text-gray-500">
                    Basic inventory production information
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* ENTRY DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Date
                </label>

                <input
                  type="date"
                  name="entryDate"
                  value={inventoryDataList.entryDate || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                />
              </div>

              {/* BULK UNIT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Unit
                </label>

                <select
                  name="bulkUnit"
                  value={inventoryDataList.bulkUnit}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                >
                  <option value="L">Liter (L)</option>

                  <option value="KG">Kilogram (KG)</option>

                  <option value="ML">Milliliter (ML)</option>

                  <option value="G">Gram (G)</option>
                </select>
              </div>

              {/* PRODUCED */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Produced Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  name="bulkProducedQty"
                  value={inventoryDataList.bulkProducedQty}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                />
              </div>

              {/* WASTAGE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wastage Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  name="wastageQty"
                  value={inventoryDataList.wastageQty}
                  onChange={handleChange}
                  placeholder="Enter wastage"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              STOCK IN
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Stock In</h2>

                <p className="text-xs text-gray-500 mt-1">
                  Products entering inventory
                </p>
              </div>

              <button
                type="button"
                onClick={addStockIn}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                <Plus size={16} />
                Add Stock In
              </button>
            </div>

            <div className="p-5 space-y-4">
              {stockIn.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">No stock-in records.</p>

                  <button
                    type="button"
                    onClick={addStockIn}
                    className="mt-3 text-sm font-medium text-gray-900 hover:underline"
                  >
                    + Add Stock In
                  </button>
                </div>
              ) : (
                stockIn.map((item, index) => (
                  <div
                    key={item.id || `stock-in-${index}`}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      {/* TYPE */}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Type
                        </label>

                        <select
                          value={item.isLoose ? "loose" : "packet"}
                          onChange={(e) =>
                            updateStockIn(
                              index,
                              "isLoose",
                              e.target.value === "loose",
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="packet">Packet</option>

                          <option value="loose">Loose</option>
                        </select>
                      </div>

                      {/* UNIT */}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Unit
                        </label>

                        <select
                          value={item.unit || inventoryDataList.bulkUnit}
                          onChange={(e) =>
                            updateStockIn(index, "unit", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="L">L</option>

                          <option value="ML">ML</option>

                          <option value="KG">KG</option>

                          <option value="G">G</option>
                        </select>
                      </div>

                      {/* QUANTITY / UNIT SIZE */}

                      {item.isLoose ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity ?? ""}
                            onChange={(e) =>
                              updateStockIn(index, "quantity", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Unit Size
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitSize ?? ""}
                            onChange={(e) =>
                              updateStockIn(index, "unitSize", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      )}

                      {/* PACKETS */}

                      {!item.isLoose && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Packets
                          </label>

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.packets ?? ""}
                            onChange={(e) =>
                              updateStockIn(index, "packets", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      )}

                      {/* REMOVE */}

                      <div
                        className={
                          item.isLoose ? "md:col-span-2 lg:col-span-2" : ""
                        }
                      >
                        <button
                          type="button"
                          onClick={() => removeStockIn(index)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ==================================================
              STOCK OUT
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Stock Out</h2>

                <p className="text-xs text-gray-500 mt-1">
                  Products leaving inventory
                </p>
              </div>

              <button
                type="button"
                onClick={addStockOut}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                <Plus size={16} />
                Add Stock Out
              </button>
            </div>

            <div className="p-5 space-y-4">
              {stockOut.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">No stock-out records.</p>

                  <button
                    type="button"
                    onClick={addStockOut}
                    className="mt-3 text-sm font-medium text-gray-900 hover:underline"
                  >
                    + Add Stock Out
                  </button>
                </div>
              ) : (
                stockOut.map((item, index) => (
                  <div
                    key={item.id || `stock-out-${index}`}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      {/* TYPE */}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Type
                        </label>

                        <select
                          value={item.isLoose ? "loose" : "packet"}
                          onChange={(e) =>
                            updateStockOut(
                              index,
                              "isLoose",
                              e.target.value === "loose",
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="packet">Packet</option>

                          <option value="loose">Loose</option>
                        </select>
                      </div>

                      {/* UNIT */}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Unit
                        </label>

                        <select
                          value={item.unit || inventoryDataList.bulkUnit}
                          onChange={(e) =>
                            updateStockOut(index, "unit", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="L">L</option>

                          <option value="ML">ML</option>

                          <option value="KG">KG</option>

                          <option value="G">G</option>
                        </select>
                      </div>

                      {/* QUANTITY / UNIT SIZE */}

                      {item.isLoose ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity ?? ""}
                            onChange={(e) =>
                              updateStockOut(index, "quantity", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Unit Size
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitSize ?? ""}
                            onChange={(e) =>
                              updateStockOut(index, "unitSize", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      )}

                      {/* PACKETS */}

                      {!item.isLoose && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Packets
                          </label>

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.packets ?? ""}
                            onChange={(e) =>
                              updateStockOut(index, "packets", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                          />
                        </div>
                      )}

                      {/* REMOVE */}

                      <div
                        className={
                          item.isLoose ? "md:col-span-2 lg:col-span-2" : ""
                        }
                      >
                        <button
                          type="button"
                          onClick={() => removeStockOut(index)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate("/dashboard/inventory")}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>

            {hasChanges && (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />

                {submitting ? "Updating..." : "Update Inventory"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;
