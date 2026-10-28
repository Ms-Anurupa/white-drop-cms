import employeeStore from "@/zustand/Store/employeeStore";
import  { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LIST_ROUTE = "/dashboard/employee-list";
const MANAGE_SALARY_ROUTE = "/dashboard/manage-salary";


const EMPTY_FORM = {
    empName: "",
    empPhone: "",
    empEmail: "",
    empAddress: "",
    status: "ACTIVE",
};

/* ---------- helpers ---------- */

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

// Keeps digits and a leading +, so "98765 43210" and "98765-43210" both work.
const cleanPhone = (v) => v.trim().replace(/(?!^\+)\D/g, "");

const validate = (form) => {
    const errors = {};

    if (!form.empName.trim()) errors.empName = "Enter the employee's name.";

    const digits = cleanPhone(form.empPhone).replace("+", "");
    if (!digits) errors.empPhone = "Enter a phone number.";
    else if (digits.length < 10 || digits.length > 13)
        errors.empPhone = "Enter a valid phone number (10 to 13 digits).";

    const email = form.empEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.empEmail = "Enter a valid email address.";

    return errors;
};

const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

/* ---------- small pieces ---------- */

const Icon = ({ d, className = "h-4 w-4" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d={d} />
    </svg>
);

const ICONS = {
    back: "M15 18l-6-6 6-6",
    alert:
        "M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
};

const inputBase =
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

function Field({
    label,
    name,
    required,
    optional,
    error,
    hint,
    as = "input",
    className = "",
    ...props
}) {
    const uid = useId();
    const id = `emp-${name}`;
    const descId = `${uid}-desc`;
    const Control = as;

    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="mb-1 flex items-baseline justify-between text-sm font-medium text-stone-800"
            >
                <span>
                    {label}
                    {required && <span className="ml-0.5 text-rose-600">*</span>}
                </span>
                {optional && (
                    <span className="text-xs font-normal text-stone-400">Optional</span>
                )}
            </label>
            <Control
                id={id}
                name={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error || hint ? descId : undefined}
                className={`${inputBase} ${error ? "border-rose-400" : "border-stone-300"}`}
                {...props}
            />
            {error ? (
                <p id={descId} className="mt-1 text-xs text-rose-700">
                    {error}
                </p>
            ) : hint ? (
                <p id={descId} className="mt-1 text-xs text-stone-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}


function Spinner() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.25"
            />
            <path
                d="M21 12a9 9 0 00-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

/* ---------- main ---------- */

const RegisterEmployee = () => {
    const navigate = useNavigate();
    const registerEmployee = employeeStore((s) => s.registerEmployee);

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(null); // "list" | "salary" | null

    const setField = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((errs) => ({ ...errs, [name]: undefined }));
        setFormError("");
    };

    const submit = async (after = "list") => {
        const found = validate(form);
        setErrors(found);
        setFormError("");

        const firstInvalid = Object.keys(found)[0];
        if (firstInvalid) {
            document.getElementById(`emp-${firstInvalid}`)?.focus();
            return;
        }

        setSubmitting(after);
        try {
            const res = await registerEmployee({
                empName: form.empName.trim(),
                empPhone: cleanPhone(form.empPhone),
                empEmail: form.empEmail.trim() || undefined,
                empAddress: form.empAddress.trim() || undefined,
                status: form.status,
            });

            if (after === "salary") {
                // Base pay and payments live on the Manage Salary page,
                // so "Register & set salary" continues straight there.
                const created = res?.data ?? res?.employee ?? res;
                if (created?.id) {
                    navigate(MANAGE_SALARY_ROUTE, {
                        state: { employeeId: created.id, employee: created },
                    });
                    return;
                }
            }
            navigate(LIST_ROUTE);
        } catch (err) {
            setFormError(
                apiMessage(err, "Couldn't register the employee. Please try again."),
            );
        } finally {
            setSubmitting(null);
        }
    };

    const busy = submitting !== null;

    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Link
                to={LIST_ROUTE}
                className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-stone-600 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
                <Icon d={ICONS.back} />
                Employee list
            </Link>

            <div className="mb-5">
                <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                    Register employee
                </h1>
                <p className="mt-0.5 text-sm text-stone-500">
                    Add a new employee. You can set their base pay once they're
                    registered.
                </p>
            </div>

            {formError && (
                <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                >
                    <Icon d={ICONS.alert} className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="flex-1">{formError}</p>
                </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit("list");
                    }}
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                >
                    <div className="space-y-6 p-5 sm:p-6">
                        <section aria-labelledby="sec-details">
                            <h2
                                id="sec-details"
                                className="mb-3 text-sm font-semibold text-stone-900"
                            >
                                Employee details
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    className="sm:col-span-2"
                                    label="Full name"
                                    name="empName"
                                    required
                                    autoComplete="off"
                                    placeholder="e.g. Ramesh Das"
                                    value={form.empName}
                                    onChange={setField}
                                    error={errors.empName}
                                />
                                <Field
                                    label="Phone number"
                                    name="empPhone"
                                    required
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="off"
                                    placeholder="98765 43210"
                                    value={form.empPhone}
                                    onChange={setField}
                                    error={errors.empPhone}
                                    hint="Must be unique. Two employees can't share a number."
                                />
                                <Field
                                    label="Email"
                                    name="empEmail"
                                    optional
                                    type="email"
                                    inputMode="email"
                                    autoComplete="off"
                                    placeholder="name@example.com"
                                    value={form.empEmail}
                                    onChange={setField}
                                    error={errors.empEmail}
                                />
                                <Field
                                    as="textarea"
                                    rows={3}
                                    className="sm:col-span-2"
                                    label="Address"
                                    name="empAddress"
                                    optional
                                    placeholder="House / street, area, city, PIN"
                                    value={form.empAddress}
                                    onChange={setField}
                                    error={errors.empAddress}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 bg-stone-50 px-5 py-3 sm:px-6">
                        <Link
                            to={LIST_ROUTE}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={busy}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                            {submitting === "list" && <Spinner />}
                            {submitting === "list" ? "Registering…" : "Register employee"}
                        </button>
                    </div>
                </form>

                {/* Live preview */}
                <aside
                    aria-label="Employee preview"
                    className="hidden h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6 lg:block"
                >
                    <h2 className="text-sm font-medium text-stone-800">Preview</h2>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                            {initials(form.empName)}
                        </div>
                        <div className="min-w-0">
                            <p
                                className={`truncate text-sm font-medium ${form.empName.trim() ? "text-stone-900" : "text-stone-400"
                                    }`}
                            >
                                {form.empName.trim() || "Employee name"}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                                {form.empEmail.trim() || "No email"}
                            </p>
                        </div>
                    </div>
                    <dl className="mt-4 space-y-3 border-t border-stone-200 pt-4 text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-stone-500">Phone</dt>
                            <dd className="tabular-nums text-stone-800">
                                {form.empPhone.trim() || "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Address</dt>
                            <dd className="mt-1 whitespace-pre-line text-stone-800">
                                {form.empAddress.trim() || "—"}
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </div>
    );
};

export default RegisterEmployee;
