import employeeStore from "@/zustand/Store/employeeStore";
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const BACK_ROUTE = "/dashboard/employees";
const VIEW_ROUTE = "/dashboard/employee-salary";
const PAGE_SIZE = 10;

const TABS = [
    { id: "payment", label: "Pay salary" },
    { id: "increment", label: "Salary increment" },
];

/* ---------- helpers ---------- */

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const money = (n) => inr.format(n);

const num = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
};

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

const todayISO = () => new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "—";

// Turns an axios error (including zod fieldErrors from the backend) into one sentence.
const apiMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
        const first = Object.entries(data.errors).flatMap(([field, msgs]) =>
            (Array.isArray(msgs) ? msgs : [msgs]).map((m) => `${field}: ${m}`),
        )[0];
        if (first) return first;
    }
    return fallback;
};

const EMPTY_PAYMENT = {
    paidAmount: "",
    bonus: "",
    overtime: "",
    deductions: "",
    note: "",
};

const EMPTY_INCREMENT = { amount: "", date: todayISO(), startingPay: "" };

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
    check: "M5 13l4 4L19 7",
    alert:
        "M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
};

const inputBase =
    "w-full rounded-lg border bg-white py-2 pr-3 text-sm tabular-nums text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

function Field({
    label,
    hint,
    error,
    prefix,
    optional,
    className = "",
    ...props
}) {
    const id = useId();
    const descId = `${id}-desc`;
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="mb-1 flex items-baseline justify-between text-sm font-medium text-stone-800"
            >
                {label}
                {optional && (
                    <span className="text-xs font-normal text-stone-400">Optional</span>
                )}
            </label>
            <div className="relative">
                {prefix && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                        {prefix}
                    </span>
                )}
                <input
                    id={id}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error || hint ? descId : undefined}
                    className={`${inputBase} ${prefix ? "pl-7" : "pl-3"} ${error ? "border-rose-400" : "border-stone-300"
                        }`}
                    {...props}
                />
            </div>
            {error ? (
                <p id={descId} className="mt-1 text-xs text-rose-700">
                    {error}
                </p>
            ) : hint ? (
                <div id={descId} className="mt-1 text-xs text-stone-500">
                    {hint}
                </div>
            ) : null}
        </div>
    );
}

function Notice({ notice, onDismiss, children }) {
    if (!notice) return null;
    const ok = notice.type === "success";
    return (
        <div
            role={ok ? "status" : "alert"}
            className={`mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
        >
            <Icon
                d={ok ? ICONS.check : ICONS.alert}
                className="mt-0.5 h-4 w-4 shrink-0"
            />
            <div className="flex-1">
                <p>{notice.text}</p>
                {ok && children}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="cursor-pointer text-xs font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
                Dismiss
            </button>
        </div>
    );
}

function SummaryRow({ label, value, sign, strong }) {
    return (
        <div
            className={`flex items-baseline justify-between py-2 ${strong ? "border-t border-stone-200 pt-3" : ""
                }`}
        >
            <dt className={strong ? "font-medium text-stone-900" : "text-stone-500"}>
                {label}
            </dt>
            <dd
                className={`tabular-nums ${strong ? "text-lg font-semibold text-stone-900" : "text-stone-700"
                    }`}
            >
                {sign}
                {money(value)}
            </dd>
        </div>
    );
}

function PrimaryButton({ busy, children, ...props }) {
    return (
        <button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            {...props}
        >
            {children}
        </button>
    );
}

/* ---------- main ---------- */

const ManageSalary = () => {
    const params = useParams();
    const location = useLocation();
    const targetId = params.employeeId || location.state?.employeeId;

    const employees = employeeStore((s) => s.employees);
    const incrementLogs = employeeStore((s) => s.incrementLogs);
    const incrementPagination = employeeStore((s) => s.incrementPagination);
    const currentBasePay = employeeStore((s) => s.currentBasePay);
    const addEmployeeSalary = employeeStore((s) => s.addEmployeeSalary);
    const addSalaryIncrementLog = employeeStore((s) => s.addSalaryIncrementLog);
    const getIncrementLogs = employeeStore((s) => s.getSalaryIncrementLogsById);
    const clearIncrementLogs = employeeStore((s) => s.clearIncrementLogs);

    const [tab, setTab] = useState("payment");
    const [ready, setReady] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [pay, setPay] = useState(EMPTY_PAYMENT);
    const [payErrors, setPayErrors] = useState({});
    const [inc, setInc] = useState(EMPTY_INCREMENT);
    const [incErrors, setIncErrors] = useState({});

    const employee = useMemo(
        () =>
            employees.find((e) => e.id === targetId) ||
            location.state?.employee ||
            null,
        [employees, targetId, location.state],
    );

    /* ----- increment history ----- */

    const loadHistory = async (extra = {}, append = false) => {
        if (!targetId) return;
        setHistoryError(null);
        try {
            await getIncrementLogs(targetId, { limit: PAGE_SIZE, ...extra }, append);
        } catch (err) {
            setHistoryError(apiMessage(err, "Couldn't load increment history."));
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReady(false);
        clearIncrementLogs();
        if (targetId) loadHistory().finally(() => setReady(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId]);

    const loadMore = async () => {
        setLoadingMore(true);
        await loadHistory({ cursor: incrementPagination.nextCursor }, true);
        setLoadingMore(false);
    };

    const basePay = num(currentBasePay);
    const hasSalary = ready && basePay > 0;
    const lastIncrement = incrementLogs[0];
    const hasMore = Boolean(incrementPagination?.hasNextPage);

    /* ----- payment form ----- */

    const payTotal =
        num(basePay) +
        num(pay.bonus) +
        num(pay.overtime) -
        num(pay.deductions);

    const setPayField = (key) => (e) => {
        const value = e.target.value;
        setPay((f) => ({ ...f, [key]: value }));
        setPayErrors((errs) => ({ ...errs, [key]: undefined }));
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!(num(pay.paidAmount) > 0))
            errs.paidAmount = "Enter the base amount paid. It must be more than ₹0.";
        ["bonus", "overtime", "deductions"].forEach((k) => {
            if (num(pay[k]) < 0) errs[k] = "Can't be negative.";
        });
        if (!errs.paidAmount && !errs.deductions && payTotal < 0)
            errs.deductions = "Deductions are more than the total pay.";
        setPayErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        setSubmitting(true);
        setNotice(null);
        try {
            await addEmployeeSalary({
                employeeId: targetId,
                paidAmount: num(pay.paidAmount),
                bonus: num(pay.bonus),
                overtime: num(pay.overtime),
                deductions: num(pay.deductions),
                note: pay.note.trim() || undefined,
            });
            setNotice({
                type: "success",
                text: `Payment of ${money(payTotal)} recorded.`,
                link: true,
            });
            setPay(EMPTY_PAYMENT);
        } catch (err) {
            setNotice({
                type: "error",
                text: apiMessage(err, "Couldn't record the payment. Try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ----- increment form ----- */

    const incAmount = num(inc.amount);
    const newSalary = basePay + incAmount;
    const percent = basePay > 0 ? (incAmount / basePay) * 100 : 0;

    const setIncField = (key) => (e) => {
        const value = e.target.value;
        setInc((f) => ({ ...f, [key]: value }));
        setIncErrors((errs) => ({ ...errs, [key]: undefined }));
    };

    const submitIncrement = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!inc.date) errs.date = "Pick the date this takes effect.";
        if (hasSalary) {
            if (!(incAmount > 0)) errs.amount = "Enter an increment above ₹0.";
        } else if (!(num(inc.startingPay) > 0)) {
            errs.startingPay = "Enter a base pay above ₹0.";
        }
        setIncErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        // First entry has no previous salary, so it is stored as a ₹0 increment
        // that sets the starting base pay.
        const salaryAfter = hasSalary ? newSalary : num(inc.startingPay);
        const amount = hasSalary ? incAmount : 0;

        setSubmitting(true);
        setNotice(null);
        try {
            await addSalaryIncrementLog({
                employeeId: targetId,
                basePay: salaryAfter,
                increments: {
                    incrementAmount: amount,
                    incrementDate: inc.date,
                    currentSalary: salaryAfter,
                },
            });
            setNotice({
                type: "success",
                text: hasSalary
                    ? `Increment saved. New base pay is ${money(salaryAfter)}.`
                    : `Base pay set to ${money(salaryAfter)}.`,
            });
            setInc({ ...EMPTY_INCREMENT, date: todayISO() });
            await loadHistory();
        } catch (err) {
            setNotice({
                type: "error",
                text: apiMessage(err, "Couldn't save the increment. Try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ----- render ----- */

    if (!targetId) {
        return (
            <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
                <div className="rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
                    <p className="text-sm font-medium text-stone-800">
                        No employee selected
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                        Open this page from the employee list to manage their salary.
                    </p>
                    <Link
                        to={BACK_ROUTE}
                        className="mt-4 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                    >
                        Go to employees
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Link
                to={BACK_ROUTE}
                className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-stone-600 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
                <Icon d={ICONS.back} />
                Employees
            </Link>

            {/* Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                        {initials(employee?.empName)}
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                            {employee?.empName || "Employee"}
                        </h1>
                        <p className="text-sm text-stone-500">
                            {employee?.empPhone ? `${employee.empPhone} · ` : ""}Manage salary
                        </p>
                    </div>
                </div>
                <Link
                    to={VIEW_ROUTE}
                    state={{ employeeId: targetId, employee }}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                >
                    View payment history
                </Link>
            </div>

            {/* Stats */}
            <dl className="mb-5 grid grid-cols-1 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4 sm:px-6">
                    <dt className="text-sm text-stone-500">Current base pay</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                        {!ready ? "…" : hasSalary ? money(basePay) : "Not set"}
                    </dd>
                </div>
                <div className="px-5 py-4 sm:px-6">
                    <dt className="text-sm text-stone-500">Last increment</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                        {!ready
                            ? "…"
                            : lastIncrement && num(lastIncrement.amount) > 0
                                ? `+${money(num(lastIncrement.amount))}`
                                : "None"}
                    </dd>
                    {lastIncrement && (
                        <dd className="mt-0.5 text-xs text-stone-500">
                            {fmtDate(lastIncrement.date)}
                        </dd>
                    )}
                </div>
                <div className="px-5 py-4 sm:px-6">
                    <dt className="text-sm text-stone-500">Entries on record</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                        {!ready
                            ? "…"
                            : (incrementPagination?.totalCount ?? incrementLogs.length)}
                    </dd>
                </div>
            </dl>

            {/* Tabs */}
            <div
                role="tablist"
                aria-label="Salary actions"
                className="mb-5 inline-flex rounded-lg border border-stone-300 bg-white p-0.5"
            >
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        id={`tab-${t.id}`}
                        aria-selected={tab === t.id}
                        aria-controls={`panel-${t.id}`}
                        onClick={() => {
                            setTab(t.id);
                            setNotice(null);
                        }}
                        className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${tab === t.id
                                ? "bg-teal-700 text-white"
                                : "text-stone-600 hover:bg-stone-100"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <Notice notice={notice} onDismiss={() => setNotice(null)}>
                {notice?.link && (
                    <Link
                        to={VIEW_ROUTE}
                        state={{ employeeId: targetId, employee }}
                        className="mt-1 inline-block text-xs font-medium underline underline-offset-2"
                    >
                        View payment history
                    </Link>
                )}
            </Notice>

            {/* Payment panel */}
            {tab === "payment" && (
                <div
                    role="tabpanel"
                    id="panel-payment"
                    aria-labelledby="tab-payment"
                    className="grid gap-5 lg:grid-cols-[1fr_320px]"
                >
                    <form
                        onSubmit={submitPayment}
                        noValidate
                        className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"
                    >
                        <h2 className="text-base font-semibold text-stone-900">
                            Record a salary payment
                        </h2>
                        <p className="mt-0.5 text-sm text-stone-500">
                            Logs what was paid to this employee and adds it to expenses.
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Field
                                className="sm:col-span-2"
                                label="Base amount paid"
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={basePay} // Pre-fills directly with basePay
                                disabled
                                readOnly
                                error={payErrors.paidAmount}
                                hint="Default base salary assigned to this employee."
                            />
                            <Field
                                label="Bonus"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.bonus}
                                onChange={setPayField("bonus")}
                                error={payErrors.bonus}
                            />
                            <Field
                                label="Overtime"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.overtime}
                                onChange={setPayField("overtime")}
                                error={payErrors.overtime}
                            />
                            <Field
                                className="sm:col-span-2"
                                label="Deductions"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.deductions}
                                onChange={setPayField("deductions")}
                                error={payErrors.deductions}
                                hint="Advances, leave cuts or anything taken off this payment."
                            />
                            {pay?.deductions && <div className="sm:col-span-2">
                                <label
                                    htmlFor="pay-note"
                                    className="mb-1 flex items-baseline justify-between text-sm font-medium text-stone-800"
                                >
                                    Note
                                    <span className="text-xs font-normal text-stone-400">
                                        Optional
                                    </span>
                                </label>
                                <textarea
                                    id="pay-note"
                                    rows={3}
                                    value={pay.note}
                                    onChange={setPayField("note")}
                                    placeholder="e.g. October salary, includes Diwali bonus"
                                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                                />
                            </div>}
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setPay(EMPTY_PAYMENT);
                                    setPayErrors({});
                                }}
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                            >
                                Clear
                            </button>
                            <PrimaryButton busy={submitting}>
                                {submitting ? "Recording…" : "Record payment"}
                            </PrimaryButton>
                        </div>
                    </form>

                    <aside
                        aria-label="Payment summary"
                        className="h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6"
                    >
                        <h2 className="text-sm font-medium text-stone-800">
                            Payout summary
                        </h2>
                        <dl className="mt-2 text-sm">
                            <SummaryRow label="Base amount" value={num(basePay)} />
                            <SummaryRow label="Bonus" value={num(pay.bonus)} sign="+" />
                            <SummaryRow label="Overtime" value={num(pay.overtime)} sign="+" />
                            <SummaryRow
                                label="Deductions"
                                value={num(pay.deductions)}
                                sign="−"
                            />
                            <SummaryRow
                                label="Total payout"
                                value={Math.max(payTotal, 0)}
                                strong
                            />
                        </dl>
                        <p className="mt-3 text-xs text-stone-500">
                            This total is what gets added to expenses under Salary.
                        </p>
                    </aside>
                </div>
            )}

            {/* Increment panel */}
            {tab === "increment" && (
                <div
                    role="tabpanel"
                    id="panel-increment"
                    aria-labelledby="tab-increment"
                    className="space-y-5"
                >
                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                        <form
                            onSubmit={submitIncrement}
                            noValidate
                            className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"
                        >
                            <h2 className="text-base font-semibold text-stone-900">
                                {hasSalary || !ready
                                    ? "Add a salary increment"
                                    : "Set starting base pay"}
                            </h2>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {hasSalary || !ready
                                    ? "Raises the employee's base pay and keeps a dated record of the change."
                                    : "No base pay is saved for this employee yet. Set it to begin their salary history."}
                            </p>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                {hasSalary || !ready ? (
                                    <Field
                                        label="Increment amount"
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={inc.amount}
                                        onChange={setIncField("amount")}
                                        error={incErrors.amount}
                                        disabled={!ready}
                                    />
                                ) : (
                                    <Field
                                        label="Base pay"
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={inc.startingPay}
                                        onChange={setIncField("startingPay")}
                                        error={incErrors.startingPay}
                                    />
                                )}
                                <Field
                                    label="Effective from"
                                    type="date"
                                    value={inc.date}
                                    onChange={setIncField("date")}
                                    error={incErrors.date}
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInc({ ...EMPTY_INCREMENT, date: todayISO() });
                                        setIncErrors({});
                                    }}
                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                                >
                                    Clear
                                </button>
                                <PrimaryButton busy={submitting || !ready}>
                                    {submitting
                                        ? "Saving…"
                                        : hasSalary || !ready
                                            ? "Save increment"
                                            : "Set base pay"}
                                </PrimaryButton>
                            </div>
                        </form>

                        <aside
                            aria-label="Increment preview"
                            className="h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6"
                        >
                            <h2 className="text-sm font-medium text-stone-800">
                                After this change
                            </h2>
                            {hasSalary ? (
                                <dl className="mt-2 text-sm">
                                    <SummaryRow label="Current base pay" value={basePay} />
                                    <SummaryRow label="Increment" value={incAmount} sign="+" />
                                    <SummaryRow label="New base pay" value={newSalary} strong />
                                    {incAmount > 0 && (
                                        <p className="mt-2 text-xs text-stone-500">
                                            A {percent.toFixed(1)}% raise.
                                        </p>
                                    )}
                                </dl>
                            ) : (
                                <dl className="mt-2 text-sm">
                                    <SummaryRow
                                        label="Base pay"
                                        value={num(inc.startingPay)}
                                        strong
                                    />
                                </dl>
                            )}
                        </aside>
                    </div>

                    {/* History */}
                    <section
                        aria-label="Increment history"
                        className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                    >
                        <div className="px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-stone-900">
                                Increment history
                            </h2>
                        </div>

                        {!ready ? (
                            <div className="space-y-2 px-5 pb-5 sm:px-6" aria-hidden="true">
                                <div className="h-9 animate-pulse rounded bg-stone-100" />
                                <div className="h-9 animate-pulse rounded bg-stone-100" />
                            </div>
                        ) : historyError && incrementLogs.length === 0 ? (
                            <div className="border-t border-stone-200 px-6 py-10 text-center">
                                <p className="text-sm text-stone-700">{historyError}</p>
                                <button
                                    type="button"
                                    onClick={() => loadHistory()}
                                    className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : incrementLogs.length === 0 ? (
                            <p className="border-t border-stone-200 px-6 py-10 text-center text-sm text-stone-500">
                                No increments yet. The first save sets the starting base pay.
                            </p>
                        ) : (
                            <div className="overflow-x-auto border-t border-stone-200">
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead className="bg-stone-50 text-xs text-stone-500">
                                        <tr>
                                            <th className="py-3 pl-5 pr-3 font-medium sm:pl-6">
                                                Effective
                                            </th>
                                            <th className="px-3 py-3 text-right font-medium">
                                                Increase
                                            </th>
                                            <th className="py-3 pl-3 pr-5 text-right font-medium sm:pr-6">
                                                Base pay after
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="tabular-nums">
                                        {incrementLogs.map((r, i) => (
                                            <tr
                                                key={`${r.date}-${i}`}
                                                className={`border-t border-stone-200 ${i === 0 ? "bg-teal-50/40" : "hover:bg-stone-50"
                                                    }`}
                                            >
                                                <td className="py-3 pl-5 pr-3 font-medium text-stone-900 sm:pl-6">
                                                    {fmtDate(r.date)}
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    {num(r.amount) > 0 ? (
                                                        <span className="text-emerald-700">
                                                            +{money(num(r.amount))}
                                                        </span>
                                                    ) : (
                                                        <span className="text-stone-400">Starting pay</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pl-3 pr-5 text-right font-semibold text-stone-900 sm:pr-6">
                                                    {money(num(r.currentSalary))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {ready && incrementLogs.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-3 text-sm text-stone-600 sm:px-6">
                                <span>
                                    Showing {incrementLogs.length}
                                    {incrementPagination?.totalCount
                                        ? ` of ${incrementPagination.totalCount}`
                                        : ""}
                                </span>
                                {historyError && (
                                    <span className="text-rose-700">{historyError}</span>
                                )}
                                {hasMore && (
                                    <button
                                        type="button"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                                    >
                                        {loadingMore ? "Loading…" : "Load older entries"}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default ManageSalary;
