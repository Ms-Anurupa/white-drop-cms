
import inventoryStore from "@/zustand/Store/inventoryStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const AddInventory = () => {
  const getInventoryListing = inventoryStore(
    (state) => state.getInventoryListing,
  );

  const createInventory = inventoryStore(
    (state) => state.createInventory,
  );

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entryDate: "2026-08-31",
    bulkUnit: "L",
    bulkProducedQty: "",
    wastageQty: 0,
  });

  const [stockIn, setStockIn] = useState([
    {
      isLoose: false,
      unit: "L",
      sizeValue: 1,
      packets: 10,
    },
    {
      isLoose: true,
      unit: "L",
      quantity: 15,
    },
  ]);

  const [stockOut, setStockOut] = useState([
    {
      isLoose: false,
      unit: "L",
      sizeValue: 1,
      packets: 10,
    },
  ]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addStockIn = () => {
    setStockIn((prev) => [
      ...prev,
      {
        isLoose: false,
        unit: formData.bulkUnit,
        sizeValue: 1,
        packets: 1,
      },
    ]);
  };

  const removeStockIn = (index) => {
    setStockIn((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStockIn = (index, field, value) => {
    setStockIn((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          [field]:
            field === "isLoose"
              ? value
              : value === ""
                ? ""
                : Number(value),
        };
      }),
    );
  };


  const addStockOut = () => {
    setStockOut((prev) => [
      ...prev,
      {
        isLoose: false,
        unit: formData.bulkUnit,
        sizeValue: 1,
        packets: 1,
      },
    ]);
  };

  const removeStockOut = (index) => {
    setStockOut((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStockOut = (index, field, value) => {
    setStockOut((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          [field]:
            field === "isLoose"
              ? value
              : value === ""
                ? ""
                : Number(value),
        };
      }),
    );
  };


  const handleAddInventory = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        entryDate: new Date(formData.entryDate).toISOString(),

        bulkUnit: formData.bulkUnit,

        bulkProducedQty: Number(formData.bulkProducedQty),

        wastageQty: Number(formData.wastageQty),

        stockIn: stockIn.map((item) => {
          if (item.isLoose) {
            return {
              isLoose: true,
              unit: item.unit,
              quantity: Number(item.quantity),
            };
          }

          return {
            isLoose: false,
            unit: item.unit,
            sizeValue: Number(item.sizeValue),
            packets: Number(item.packets),
          };
        }),

        stockOut: stockOut.map((item) => {
          if (item.isLoose) {
            return {
              isLoose: true,
              unit: item.unit,
              quantity: Number(item.quantity),
            };
          }

          return {
            isLoose: false,
            unit: item.unit,
            sizeValue: Number(item.sizeValue),
            packets: Number(item.packets),
          };
        }),
      };

      console.log("CREATE INVENTORY PAYLOAD:", payload);

      await createInventory(payload);

      await getInventoryListing();

      navigate("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to create inventory:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <form
        onSubmit={handleAddInventory}
        className="mx-auto max-w-6xl space-y-5"
      >
        {/* HEADER */}
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

            <p className="mt-1 text-sm text-gray-500">
              Add production, stock in and stock out details.
            </p>
          </div>
        </div>

        {/* BASIC DETAILS */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Production Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* DATE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Entry Date
              </label>

              <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
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
                value={formData.bulkUnit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="L">Litre (L)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="ML">Millilitre (ML)</option>
              </select>
            </div>

            {/* BULK PRODUCED */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Bulk Produced Quantity
              </label>

              <input
                type="number"
                name="bulkProducedQty"
                value={formData.bulkProducedQty}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                required
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
                value={formData.wastageQty}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* STOCK IN */}
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
                key={index}
                className="rounded-xl border border-gray-100 bg-slate-50 p-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  {/* LOOSE */}
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

                    <input
                      value={item.unit}
                      onChange={(e) =>
                        updateStockIn(index, "unit", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  {item.isLoose ? (
                    /* LOOSE QUANTITY */
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
                      />
                    </div>
                  ) : (
                    <>
                      {/* SIZE */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Size Value
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.sizeValue ?? ""}
                          onChange={(e) =>
                            updateStockIn(index, "sizeValue", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
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
                        />
                      </div>
                    </>
                  )}

                  {/* DELETE */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeStockIn(index)}
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
        </div>

        {/* STOCK OUT */}
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

          <div className="space-y-3">
            {stockOut.map((item, index) => (
              <div
                key={index}
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

                    <input
                      value={item.unit}
                      onChange={(e) =>
                        updateStockOut(index, "unit", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

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
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                          Size Value
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.sizeValue ?? ""}
                          onChange={(e) =>
                            updateStockOut(index, "sizeValue", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

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
                        />
                      </div>
                    </>
                  )}

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
        </div>

        {/* BOTTOM SUBMIT */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory")}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Inventory
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
