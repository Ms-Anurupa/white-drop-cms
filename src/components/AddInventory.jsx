/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, PackagePlus, Save } from "lucide-react";
import inventoryStore from "@/zustand/Store/inventoryStore";

const AddInventory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inventoryId = searchParams.get("id");
  const createInventory = inventoryStore((state) => state.createInventory);
  const getMilkInventoryById = inventoryStore(
    (state) => state.getMilkInventoryById,
  );
  const clearInventoryData = inventoryStore(
    (state) => state.clearInventoryData,
  );
  const inventoryData = inventoryStore((state) => state.inventoryData);
  const isEditMode = Boolean(inventoryId);

  const [inventoryDataList, setInventoryDataList] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    bulkUnit: "L",
    bulkProducedQty: "",
    wastageQty: 0,
  });
  const [stockIn, setStockIn] = useState([
    {
      isLoose: false,
      unit: "L",
      unitSize: 1,
      packets: 1,
    },
  ]);
  const [stockOut, setStockOut] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (!isEditMode || !inventoryData) {
      return;
    }

    // console.log("INVENTORY DATA FROM API:", inventoryData);

    setInventoryDataList({
      entryDate: inventoryData.entryDate
        ? new Date(inventoryData.entryDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],

      bulkUnit: inventoryData.bulkUnit || "L",
      bulkProducedQty: inventoryData.bulkProducedQty ?? "",
      wastageQty: inventoryData.wastageQty ?? 0,
    });

    setStockIn(
      Array.isArray(inventoryData.stockIn)
        ? inventoryData.stockIn.map((item) => ({
            id: item.id,
            isLoose: Boolean(item.isLoose),
            unit: item.unit || "L",
            unitSize: item.isLoose ? undefined : (item.unitSize ?? 1),
            packets: item.isLoose ? undefined : (item.packets ?? 1),
            quantity: item.isLoose ? (item.quantity ?? 0) : undefined,
          }))
        : [],
    );

    setStockOut(
      inventoryData.stockOut
        ? inventoryData.stockOut.map((item) => ({
            id: item.id,
            isLoose: Boolean(item.isLoose),
            unit: item.unit || "L",
            unitSize: item.isLoose ? undefined : (item.unitSize ?? 1),
            packets: item.isLoose ? undefined : (item.packets ?? 1),
            quantity: item.isLoose ? (item.quantity ?? 0) : undefined,
          }))
        : [],
    );

    setHasChanges(false);
  }, [inventoryData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInventoryDataList((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const addStockIn = () => {
    setStockIn((prev) => [
      ...prev,
      {
        isLoose: false,
        unit: inventoryDataList.bulkUnit,
        unitSize: 1,
        packets: 1,
      },
    ]);
    setHasChanges(true);
  };

  const removeStockIn = (index) => {
    setStockIn((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateStockIn = (index, field, value) => {
    setStockIn((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "isLoose") {
          return {
            ...item,
            isLoose: value,

            ...(value
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

    setHasChanges(true);
  };

  const addStockOut = () => {
    setStockOut((prev) => [
      ...prev,
      {
        isLoose: false,
        unit: inventoryDataList.bulkUnit,
        unitSize: 1,
        packets: 1,
      },
    ]);

    setHasChanges(true);
  };

  const removeStockOut = (index) => {
    setStockOut((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateStockOut = (index, field, value) => {
    setStockOut((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "isLoose") {
          return {
            ...item,
            isLoose: value,

            ...(value
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

    setHasChanges(true);
  };

  const buildPayload = () => {
    const payload = {
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

    if (isEditMode) {
      payload.id = inventoryId;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode && !hasChanges) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = buildPayload();

      console.log(
        isEditMode ? "UPDATE INVENTORY PAYLOAD:" : "CREATE INVENTORY PAYLOAD:",
        payload,
      );

      await createInventory(payload);

      navigate("/dashboard/inventory");
    } catch (error) {
      console.error(
        isEditMode
          ? "Failed to update inventory:"
          : "Failed to create inventory:",
        error,
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
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/inventory")}
              className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
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
                ? "Update production, stock in and stock out details."
                : "Add production, stock in and stock out details."}
            </p>
          </div>
        </div>

        {/* --------------------------------------------------
            PRODUCTION DETAILS
        -------------------------------------------------- */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Production Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* DATE */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Entry Date
              </label>

              <input
                type="date"
                name="entryDate"
                value={inventoryDataList.entryDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* UNIT */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Bulk Unit
              </label>

              <select
                name="bulkUnit"
                value={inventoryDataList.bulkUnit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="L">Litre (L)</option>

                <option value="KG">Kilogram (KG)</option>

                <option value="ML">Millilitre (ML)</option>
              </select>
            </div>

            {/* PRODUCED */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Bulk Produced Quantity
              </label>

              <input
                type="number"
                name="bulkProducedQty"
                value={inventoryDataList.bulkProducedQty}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* WASTAGE */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Wastage Quantity
              </label>

              <input
                type="number"
                name="wastageQty"
                value={inventoryDataList.wastageQty}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            STOCK IN
        -------------------------------------------------- */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Stock In
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Add packets or loose quantity received into stock.
              </p>
            </div>

            <button
              type="button"
              onClick={addStockIn}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {stockIn.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-xl border border-gray-100 bg-slate-50 p-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  {/* TYPE */}

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
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
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="packet">Packet</option>

                      <option value="loose">Loose</option>
                    </select>
                  </div>

                  {/* UNIT */}

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                      Unit
                    </label>

                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateStockIn(index, "unit", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="L">L</option>

                      <option value="KG">KG</option>

                      <option value="ML">ML</option>
                    </select>
                  </div>

                  {/* LOOSE */}

                  {item.isLoose ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity ?? ""}
                        onChange={(e) =>
                          updateStockIn(index, "quantity", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      {/* UNIT SIZE */}

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Unit Size
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitSize ?? ""}
                          onChange={(e) =>
                            updateStockIn(index, "unitSize", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      {/* PACKETS */}

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Packets
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.packets ?? ""}
                          onChange={(e) =>
                            updateStockIn(index, "packets", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* DELETE */}

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeStockIn(index)}
                      disabled={stockIn.length === 1}
                      className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 text-sm text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------
            STOCK OUT
        -------------------------------------------------- */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Stock Out
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Add packets or loose quantity going out of stock.
              </p>
            </div>

            <button
              type="button"
              onClick={addStockOut}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          {stockOut.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 py-8 text-center">
              <p className="text-sm text-gray-400">
                No stock out entries added.
              </p>

              <button
                type="button"
                onClick={addStockOut}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add stock out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stockOut.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    {/* TYPE */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
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
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="packet">Packet</option>

                        <option value="loose">Loose</option>
                      </select>
                    </div>

                    {/* UNIT */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">
                        Unit
                      </label>

                      <select
                        value={item.unit}
                        onChange={(e) =>
                          updateStockOut(index, "unit", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="L">L</option>

                        <option value="KG">KG</option>

                        <option value="ML">ML</option>
                      </select>
                    </div>

                    {/* LOOSE */}

                    {item.isLoose ? (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity ?? ""}
                          onChange={(e) =>
                            updateStockOut(index, "quantity", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          required
                        />
                      </div>
                    ) : (
                      <>
                        {/* UNIT SIZE */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            Unit Size
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitSize ?? ""}
                            onChange={(e) =>
                              updateStockOut(index, "unitSize", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                            required
                          />
                        </div>

                        {/* PACKETS */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            Packets
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={item.packets ?? ""}
                            onChange={(e) =>
                              updateStockOut(index, "packets", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* DELETE */}

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeStockOut(index)}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 text-sm text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --------------------------------------------------
            SUBMIT
        -------------------------------------------------- */}

        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            disabled={submitting}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          {/* ----------------------------------------------
              ADD MODE
          ---------------------------------------------- */}

          {!isEditMode && (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {submitting ? "Saving..." : "Save Inventory"}
            </button>
          )}

          {/* ----------------------------------------------
              EDIT MODE
              Only show after user changes something
          ---------------------------------------------- */}

          {isEditMode && hasChanges && (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {submitting ? "Updating..." : "Update Inventory"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
