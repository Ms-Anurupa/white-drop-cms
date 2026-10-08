import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";
import adhocOrderStore from "@/zustand/Store/adhocOrderStore";

const createEmptyItem = () => ({
  productId: "",
  variantId: "",
  qty: 1,
  rate: 0,
});

const initialFormData = () => ({
  soldOn: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16),
  soldBy: "",
  phoneNo: "",
  saleValue: "",
});

export default function AdHocSaleForm() {
  const { createAdHocSale, loading, status, resetStatus } = adhocOrderStore();

  const [formData, setFormData] = useState(initialFormData);
  const [details, setDetails] = useState([createEmptyItem()]);
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");

  const validatePhone = (phone) => {
    if (!phone.trim()) return true;

    const normalizedPhone = phone.replace(/\s+/g, "");
    return /^(?:\+91)?[6-9]\d{9}$/.test(normalizedPhone);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "phoneNo") {
      setPhoneError(
        value && !validatePhone(value)
          ? "Enter a valid 10-digit Indian mobile number."
          : "",
      );
    }

    setFormError("");
  };

  const handleDetailChange = (index, field, value) => {
    setDetails((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );

    setFormError("");
  };

  const addDetailRow = () => {
    setDetails((prev) => [...prev, createEmptyItem()]);
  };

  const removeDetailRow = (index) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
    setFormError("");
  };

  const calculatedTotal = details.reduce((total, item) => {
    const qty = Number(item.qty);
    const rate = Number(item.rate);

    return total + (qty > 0 && rate >= 0 ? qty * rate : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (formData.phoneNo && !validatePhone(formData.phoneNo)) {
      setPhoneError("Please enter a valid mobile number.");
      return;
    }

    if (!details.length) {
      setFormError("Add at least one product to the sale.");
      return;
    }

    const invalidIndex = details.findIndex(
      (item) =>
        !item.productId.trim() ||
        !Number.isFinite(Number(item.qty)) ||
        Number(item.qty) <= 0 ||
        !Number.isFinite(Number(item.rate)) ||
        Number(item.rate) < 0,
    );

    if (invalidIndex !== -1) {
      setFormError(
        `Please check product row ${invalidIndex + 1}. Product ID is required, quantity must be greater than zero, and rate cannot be negative.`,
      );
      return;
    }

    const items = details.map((item) => ({
      productId: item.productId.trim(),
      ...(item.variantId.trim() ? { variantId: item.variantId.trim() } : {}),
      qty: Number(item.qty),
      rate: Number(item.rate),
    }));

    const calculatedSaleValue = Number(
      items.reduce((total, item) => total + item.qty * item.rate, 0).toFixed(2),
    );

    const payload = {
      soldOn: formData.soldOn
        ? new Date(formData.soldOn).toISOString()
        : undefined,
      soldBy: formData.soldBy.trim(),
      phoneNo: formData.phoneNo ? formData.phoneNo.replace(/\s+/g, "") : null,
      saleValue:
        formData.saleValue === ""
          ? calculatedSaleValue
          : Number(formData.saleValue),
      details: items,
    };

    if (!Number.isFinite(payload.saleValue) || payload.saleValue < 0) {
      setFormError("Enter a valid sale value.");
      return;
    }

    const result = await createAdHocSale(payload);

    if (result.success) {
      setFormData(initialFormData());
      setDetails([createEmptyItem()]);
      setPhoneError("");
      setFormError("");
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="mx-auto my-8 max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Record Ad-Hoc Sale
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record a manual sale with one or more product line items.
        </p>
      </div>

      {status.type && (
        <div
          className={`mb-5 flex items-start gap-3 rounded-lg border p-4 ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{status.message}</p>

            {status.errors && (
              <pre className="mt-2 overflow-x-auto rounded bg-white/70 p-2 text-xs">
                {JSON.stringify(status.errors, null, 2)}
              </pre>
            )}
          </div>

          <button
            type="button"
            onClick={resetStatus}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {formError && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sale Value (₹)
            </label>

            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                name="saleValue"
                min="0"
                step="0.01"
                value={formData.saleValue}
                onChange={handleInputChange}
                placeholder={`Auto-calculated: ₹${calculatedTotal.toFixed(2)}`}
                className={`${inputClass} pl-9`}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Leave blank to use the total of quantity × rate.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sold On Date & Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="datetime-local"
                name="soldOn"
                value={formData.soldOn}
                onChange={handleInputChange}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sold By
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="soldBy"
                value={formData.soldBy}
                onChange={handleInputChange}
                placeholder="Sales representative"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Customer Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className={`${inputClass} pl-9 ${
                  phoneError ? "border-rose-400" : ""
                }`}
              />
            </div>

            {phoneError && (
              <p className="mt-1 text-xs text-rose-600">{phoneError}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Sale Items
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enter the product ID, optional variant ID, quantity, and rate.
              </p>
            </div>

            <button
              type="button"
              onClick={addDetailRow}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {details.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Package className="h-4 w-4 text-blue-600" />
                    Item {index + 1}
                  </div>

                  {details.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDetailRow(index)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      value={item.productId}
                      onChange={(e) =>
                        handleDetailChange(index, "productId", e.target.value)
                      }
                      placeholder="Enter product ID"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Variant ID
                    </label>
                    <input
                      type="text"
                      value={item.variantId}
                      onChange={(e) =>
                        handleDetailChange(index, "variantId", e.target.value)
                      }
                      placeholder="Optional variant ID"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.qty}
                      onChange={(e) =>
                        handleDetailChange(index, "qty", e.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Rate (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        handleDetailChange(index, "rate", e.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-3 text-right text-xs text-slate-500">
                  Item total:{" "}
                  <span className="font-semibold text-slate-800">
                    ₹
                    {(
                      Math.max(0, Number(item.qty) || 0) *
                      Math.max(0, Number(item.rate) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end rounded-lg bg-blue-50 p-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Calculated item total</p>
              <p className="text-lg font-semibold text-blue-700">
                ₹{calculatedTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={loading || Boolean(phoneError)}
            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving Sale..." : "Log Sale Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
