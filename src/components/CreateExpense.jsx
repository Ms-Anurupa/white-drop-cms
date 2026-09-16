import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import expenseStore from "../zustand/Store/expenseStore"; // adjust path
import CategorySelect from "../components/CategorySelect"; // adjust path

const INVOICE_TYPE_OPTIONS = [
  { value: "TAX_INVOICE", label: "Tax invoice" },
  { value: "BILL_OF_SUPPLY", label: "Bill of supply" },
  { value: "CREDIT_NOTE", label: "Credit note" },
  { value: "DEBIT_NOTE", label: "Debit note" },
];

const REVERSE_TAX_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

const FILING_STATUS_OPTIONS = [
  { value: "FILED", label: "Filed" },
  { value: "PENDING", label: "Pending" },
  { value: "NOT_APPLICABLE", label: "Not applicable" },
];

const YES_NO_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];
const initialForm = {
  categoryId: "",
  itemName: "",
  quantity: "",
  unit: "",
  price: "",
  purchaseDate: "",
  supplierName: "",
  notes: "",
  gstin: "",
  invoiceNumber: "",
  invoiceType: "",
  invoiceDate: "",
  invoiceValue: "",
  placeOfSupply: "",
  supplyAttractReverseTax: "",
  reverseTaxRate: "",
  taxableValue: "",
  integratedTax: "",
  centralTax: "",
  stateUtTax: "",
  cess: "",
  gstr1IffGstr1A5FilingStatus: "",
  gstr1IffGstr1A5FilingDate: "",
  gstr1IffGstr1A5FilingPeriod: "",
  gstr3bFilingStatus: "",
};

const Field = ({ label, required, className = "", children }) => (
  <div className={className}>
    <label className="mb-1.5 block text-xs font-medium text-gray-600">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400";

const Input = (props) => <input {...props} className={inputClass} />;

const Select = ({ options, placeholder, ...props }) => (
  <select {...props} className={inputClass}>
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value || opt} value={opt.value || opt}>
        {opt.label || opt}
      </option>
    ))}
  </select>
);

const SectionCard = ({ title, subtitle, children }) => {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white">
      <div className="px-4 py-3.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>

      <div className="border-t border-slate-100 p-4">{children}</div>
    </div>
  );
};

const CreateExpense = () => {
  const navigate = useNavigate();
  const createExpense = expenseStore((s) => s.createExpense);
  const creating = expenseStore((s) => s.creating);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.categoryId) next.categoryId = "Category is required";
    if (!form.itemName.trim()) next.itemName = "Item name is required";
    if (form.price === "" || Number.isNaN(Number(form.price)))
      next.price = "Enter a valid price";
    if (!form.purchaseDate) next.purchaseDate = "Purchase date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    const payload = {
      ...form,
      quantity: form.quantity === "" ? undefined : form.quantity,
      price: form.price,
    };

    const res = await createExpense(payload);

    if (res.ok) {
      navigate("/dashboard/expense");
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/expense")}
          className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 p-2 text-gray-500 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Create expense
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Record a purchase and its GST details
          </p>
        </div>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      {/* Basic details */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-900">
          Basic details
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Category" required>
            <CategorySelect
              value={form.categoryId}
              onChange={setField("categoryId")}
              placeholder="Select category"
            />
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </Field>

          <Field label="Expense name" required>
            <Input
              value={form.itemName}
              onChange={setField("itemName")}
              placeholder="e.g. Packaging boxes"
            />
            {errors.itemName && (
              <p className="mt-1 text-xs text-red-500">{errors.itemName}</p>
            )}
          </Field>

          <Field label="Vendor / supplier">
            <Input
              value={form.supplierName}
              onChange={setField("supplierName")}
              placeholder="e.g. Sharma Traders"
            />
          </Field>

          <Field label="Quantity">
            <Input
              type="number"
              step="any"
              value={form.quantity}
              onChange={setField("quantity")}
              placeholder="0"
            />
          </Field>

          <Field label="Unit">
            <Input
              value={form.unit}
              onChange={setField("unit")}
              placeholder="e.g. kg, pcs, litre"
            />
          </Field>

          <Field label="Price" required>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={setField("price")}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </Field>

          <Field label="Purchase date" required>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={setField("purchaseDate")}
            />
            {errors.purchaseDate && (
              <p className="mt-1 text-xs text-red-500">{errors.purchaseDate}</p>
            )}
          </Field>

          <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
            <textarea
              value={form.notes}
              onChange={setField("notes")}
              rows={2}
              placeholder="Optional notes about this expense"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Invoice & GST */}
      <SectionCard
        title="Invoice & GST details"
        subtitle="Optional — fill in if this expense has a GST invoice"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="GSTIN">
            <Input
              value={form.gstin}
              onChange={setField("gstin")}
              placeholder="22AAAAA0000A1Z5"
            />
          </Field>

          <Field label="Invoice number">
            <Input
              value={form.invoiceNumber}
              onChange={setField("invoiceNumber")}
            />
          </Field>

          <Field label="Invoice type">
            <Input
              value={form.invoiceType}
              onChange={setField("invoiceType")}
              placeholder="e.g. Tax invoice"
            />
          </Field>

          <Field label="Invoice date">
            <Input
              type="date"
              value={form.invoiceDate}
              onChange={setField("invoiceDate")}
            />
          </Field>

          <Field label="Invoice value">
            <Input
              type="number"
              step="0.01"
              value={form.invoiceValue}
              onChange={setField("invoiceValue")}
            />
          </Field>

          <Field label="Place of supply">
            <Input
              value={form.placeOfSupply}
              onChange={setField("placeOfSupply")}
              placeholder="e.g. West Bengal"
            />
          </Field>

          <Field label="Reverse charge applicable">
            <Select
              options={REVERSE_TAX_OPTIONS}
              placeholder="Select"
              value={form.supplyAttractReverseTax}
              onChange={setField("supplyAttractReverseTax")}
            />
          </Field>

          <Field label="Reverse tax rate (%)">
            <Input
              type="number"
              step="0.01"
              value={form.reverseTaxRate}
              onChange={setField("reverseTaxRate")}
            />
          </Field>

          <Field label="Taxable value">
            <Input
              type="number"
              step="0.01"
              value={form.taxableValue}
              onChange={setField("taxableValue")}
            />
          </Field>

          <Field label="Integrated tax (IGST)">
            <Input
              type="number"
              step="0.01"
              value={form.integratedTax}
              onChange={setField("integratedTax")}
            />
          </Field>

          <Field label="Central tax (CGST)">
            <Input
              type="number"
              step="0.01"
              value={form.centralTax}
              onChange={setField("centralTax")}
            />
          </Field>

          <Field label="State/UT tax (SGST)">
            <Input
              type="number"
              step="0.01"
              value={form.stateUtTax}
              onChange={setField("stateUtTax")}
            />
          </Field>

          <Field label="Cess">
            <Input
              type="number"
              step="0.01"
              value={form.cess}
              onChange={setField("cess")}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Filing status */}
      <SectionCard
        title="Return filing status"
        subtitle="Optional — track GSTR-1/IFF and GSTR-3B filing for this expense"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="GSTR-1/IFF (GSTR-1A §5) status">
            <Select
              options={YES_NO_OPTIONS}
              placeholder="Select"
              value={form.gstr1IffGstr1A5FilingStatus}
              onChange={setField("gstr1IffGstr1A5FilingStatus")}
            />
          </Field>

          <Field label="Filing date">
            <Input
              type="date"
              value={form.gstr1IffGstr1A5FilingDate}
              onChange={setField("gstr1IffGstr1A5FilingDate")}
            />
          </Field>

          <Field label="Filing period">
            <Input
              value={form.gstr1IffGstr1A5FilingPeriod}
              onChange={setField("gstr1IffGstr1A5FilingPeriod")}
              placeholder="e.g. Sep 2026"
            />
          </Field>

          <Field label="GSTR-3B status">
            <Select
              options={YES_NO_OPTIONS}
              placeholder="Select"
              value={form.gstr3bFilingStatus}
              onChange={setField("gstr3bFilingStatus")}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/expense")}
          className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={creating}
          onClick={handleSubmit}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating && <Loader2 size={15} className="animate-spin" />}
          {creating ? "Saving..." : "Save expense"}
        </button>
      </div>
    </div>
  );
};

export default CreateExpense;
