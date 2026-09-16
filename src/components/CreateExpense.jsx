import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  IndianRupee,
  Package,
  Plus,
  Search,
  Store,
  Tag,
  X,
} from "lucide-react";
import expenseStore from "../zustand/Store/expenseStore";

const UNITS = ["KG", "G", "ML", "L"];

const emptyForm = {
  categoryId: "",
  itemName: "",
  quantity: "",
  unit: "",
  price: "",
  purchaseDate: "",
  vendor: "",
  notes: "",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (!value) return "₹0.00";

  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const FieldLabel = ({ children, required, optional }) => (
  <div className="mb-2 flex items-center gap-2">
    <label className="text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>

    {optional && (
      <span className="text-xs font-medium text-slate-400">Optional</span>
    )}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const iconInputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function CategoryPicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const categories = expenseStore((s) => s.categories);
  const search = expenseStore((s) => s.categorySearch);
  const hasMore = expenseStore((s) => s.categoryHasMore);
  const loading = expenseStore((s) => s.categoryLoading);
  const getExpenseCategories = expenseStore((s) => s.getExpenseCategories);
  const setCategorySearch = expenseStore((s) => s.setCategorySearch);
  const loadMoreCategories = expenseStore((s) => s.loadMoreCategories);

  const selectedCategory = categories.find((category) => category.id === value);

  useEffect(() => {
    const timer = setTimeout(() => getExpenseCategories(), search ? 350 : 0);

    return () => clearTimeout(timer);
  }, [search, getExpenseCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left transition-all ${
          error
            ? "border-rose-300 ring-4 ring-rose-500/5"
            : open
              ? "border-blue-500 ring-4 ring-blue-500/10"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Tag size={17} />
          </div>

          <div className="min-w-0">
            {selectedCategory ? (
              <p className="truncate text-sm font-semibold text-slate-800">
                {selectedCategory.name}
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-400">
                Select category
              </p>
            )}
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search category..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {loading && categories.length === 0 ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-11 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Tag size={18} className="text-slate-400" />
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  No categories found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another search
                </p>
              </div>
            ) : (
              <>
                {categories.map((category) => {
                  const selected = category.id === value;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        onChange(category.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                        selected
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Tag size={15} />
                        </div>

                        <span className="text-sm font-semibold">
                          {category.name}
                        </span>
                      </div>

                      {selected && (
                        <Check size={17} className="text-blue-600" />
                      )}
                    </button>
                  );
                })}

                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMoreCategories}
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Plus size={16} />
                        Load more
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateExpense() {
  const navigate = useNavigate();

  const createExpense = expenseStore((s) => s.createExpense);
  const creating = expenseStore((s) => s.creating);
  const categories = expenseStore((s) => s.categories);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    expenseStore.getState().getExpenseCategories();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setSaved(false);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.categoryId) {
      nextErrors.categoryId = "Please select a category";
    }

    if (!form.itemName.trim()) {
      nextErrors.itemName = "Item name is required";
    }

    if (!form.price) {
      nextErrors.price = "Price is required";
    } else if (Number(form.price) <= 0) {
      nextErrors.price = "Price must be greater than 0";
    }

    if (!form.purchaseDate) {
      nextErrors.purchaseDate = "Purchase date is required";
    }

    if (form.quantity && Number(form.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      categoryId: form.categoryId,
      itemName: form.itemName.trim(),
      quantity: form.quantity ? Number(form.quantity) : undefined,
      unit: form.unit || undefined,
      price: Number(form.price),
      purchaseDate: form.purchaseDate,
      vendor: form.vendor.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    const result = await createExpense(payload);

    if (result?.ok) {
      setSaved(true);

      setTimeout(() => {
        navigate("/dashboard/expense");
      }, 550);
    }
  };

  const selectedCategory = categories.find(
    (category) => category.id === form.categoryId,
  );

  const completionFields = [
    form.categoryId,
    form.itemName.trim(),
    form.price,
    form.purchaseDate,
  ];

  const completedCount = completionFields.filter(Boolean).length;
  const completionPercentage = (completedCount / completionFields.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => navigate("/dashboard/expense")}
            className="cursor-pointer mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to expenses
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
                <IndianRupee size={25} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    New expense
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      saved
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        saved ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {saved ? "Saved" : "Draft"}
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                  Record a purchase and keep your expense tracking accurate and
                  organized.
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:w-72">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Form progress
                </span>

                <span className="text-sm font-bold text-slate-700">
                  {completedCount}/4
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Basic details */}
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Package size={17} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Purchase details
                  </h2>
                </div>

                <p className="ml-10 text-sm text-slate-400">
                  Add the essential information about this expense.
                </p>
              </div>

              <div className="space-y-5">
                {/* Category */}
                <div>
                  <FieldLabel required>Category</FieldLabel>

                  <CategoryPicker
                    value={form.categoryId}
                    onChange={(value) => updateField("categoryId", value)}
                    error={errors.categoryId}
                  />

                  {errors.categoryId && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Item */}
                <div>
                  <FieldLabel required>Item name</FieldLabel>

                  <div className="relative">
                    <Package
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={form.itemName}
                      onChange={(e) => updateField("itemName", e.target.value)}
                      placeholder="e.g. Fresh milk"
                      className={iconInputClass}
                    />
                  </div>

                  {errors.itemName && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">
                      {errors.itemName}
                    </p>
                  )}
                </div>

                {/* Quantity + unit */}
                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                  <div>
                    <FieldLabel optional>Quantity</FieldLabel>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                      placeholder="Enter quantity"
                      className={inputClass}
                    />

                    {errors.quantity && (
                      <p className="mt-1.5 text-xs font-medium text-rose-500">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel optional>Unit</FieldLabel>

                    <select
                      value={form.unit}
                      onChange={(e) => updateField("unit", e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Select Unit</option>

                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price + date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Price</FieldLabel>

                    <div className="relative">
                      <IndianRupee
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => updateField("price", e.target.value)}
                        placeholder="0.00"
                        className={iconInputClass}
                      />
                    </div>

                    {errors.price && (
                      <p className="mt-1.5 text-xs font-medium text-rose-500">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Purchase date</FieldLabel>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={form.purchaseDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          updateField("purchaseDate", e.target.value)
                        }
                        className={iconInputClass}
                      />
                    </div>

                    {errors.purchaseDate && (
                      <p className="mt-1.5 text-xs font-medium text-rose-500">
                        {errors.purchaseDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Store size={17} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Additional information
                  </h2>
                </div>

                <p className="ml-10 text-sm text-slate-400">
                  Optional details that make the record easier to understand
                  later.
                </p>
              </div>

              <div className="space-y-5">
                {/* Vendor */}
                <div>
                  <FieldLabel optional>Vendor / supplier</FieldLabel>

                  <div className="relative">
                    <Store
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={form.vendor}
                      onChange={(e) => updateField("vendor", e.target.value)}
                      placeholder="e.g. ABC Suppliers"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <FieldLabel optional>Notes</FieldLabel>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="absolute left-4 top-4 text-slate-400"
                    />

                    <textarea
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      rows={4}
                      placeholder="Add any useful notes about this purchase..."
                      className={`${iconInputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard/expense")}
                className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating || saved}
                className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {creating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving expense...
                  </>
                ) : saved ? (
                  <>
                    <Check size={17} />
                    Expense saved
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Save Expense
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Preview header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                      <FileText size={19} />
                    </div>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                      Live preview
                    </span>
                  </div>

                  <p className="text-sm font-medium text-blue-100">
                    Expense amount
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {formatCurrency(form.price)}
                  </p>

                  <p className="mt-2 text-xs text-blue-100">
                    This is how the expense will appear in your records.
                  </p>
                </div>
              </div>

              {/* Preview body */}
              <div className="p-6">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Entry preview
                  </p>

                  <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
                    {form.itemName.trim() || "Your expense item"}
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Tag size={16} />
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        Category
                      </span>
                    </div>

                    <span className="max-w-[150px] truncate text-sm font-bold text-slate-800">
                      {selectedCategory?.name || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Package size={16} />
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        Quantity
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-800">
                      {form.quantity
                        ? `${form.quantity}${form.unit ? ` ${form.unit}` : ""}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <CalendarDays size={16} />
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        Date
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-800">
                      {formatDate(form.purchaseDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Store size={16} />
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        Vendor
                      </span>
                    </div>

                    <span className="max-w-[150px] truncate text-sm font-bold text-slate-800">
                      {form.vendor.trim() || "—"}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <IndianRupee size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Expense summary
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700/70">
                        {form.itemName.trim()
                          ? `${form.itemName.trim()} will be recorded as a ${selectedCategory?.name?.toLowerCase() || "general"} expense.`
                          : "Complete the required fields to see your expense summary."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Required fields */}
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Required fields are marked with *
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
