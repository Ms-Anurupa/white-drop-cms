import employeeStore from "@/zustand/Store/employeeStore";
import {
    MONTHS,
    apiMessage,
    fmtDate,
    fyOptions,
    getCurrentFY,
    getCurrentMonth,
    initials,
    money,
    moneyOrDash,
    num,
    todayISO,
} from "../../utils/salaryHelper";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

const LIST_ROUTE = "/dashboard/employee-list";
const VIEW_ROUTE = "/dashboard/employee-salary";
const EXPENSE_ROUTE = "/dashboard/expense";
const PAGE_SIZE = 10;
const FY_OPTIONS = fyOptions(5);

const TABS = [
    { id: "payment", label: "Pay salary" },
    { id: "package", label: "Salary package" },
];

/* ---------- form defaults ---------- */

const blankPay = () => ({
    bonus: "",
    overtime: "",
    lop: "",
    month: getCurrentMonth(),
    fy: getCurrentFY(),
    note: "",
});

// Base amount, pTax and ESI start from the employee's saved package
const payDefaults = (base, pTax, esi) =>
    base > 0
        ? { paidAmount: String(base), pTax: String(pTax), esi: String(esi) }
        : { paidAmount: "", pTax: "", esi: "" };

const blankRevision = () => ({
    amount: "",
    date: todayISO(),
    pTax: "",
    esi: "",
    note: "",
});

const blankSetup = () => ({ basePay: "", pTax: "", esi: "" });

/* ---------- UI pieces ---------- */

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
    "w-full rounded-lg border bg-white py-2 pr-3 text-sm tabular-nums text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:bg-stone-100 disabled:text-stone-400";

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
                <p id={descId} className="mt-1 text-xs text-stone-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function SelectField({ label, error, options, className = "", ...props }) {
    const id = useId();
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-stone-800"
            >
                {label}
            </label>
            <select
                id={id}
                aria-invalid={Boolean(error)}
                className={`${inputBase} cursor-pointer pl-3 ${error ? "border-rose-400" : "border-stone-300"
                    }`}
                {...props}
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-rose-700">{error}</p>}
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

function StatusBadge({ status }) {
    if (!status) return null;
    const active = status === "ACTIVE";
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${active
                ? "bg-emerald-50 text-emerald-800"
                : "bg-stone-200 text-stone-700"
                }`}
        >
            {active ? "Active" : "Deactivated"}
        </span>
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

function CompareRow({ label, from, to, strong }) {
    const changed = from !== to;
    return (
        <div
            className={`grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 py-2 tabular-nums ${strong ? "border-t border-stone-200 pt-3" : ""
                }`}
        >
            <dt className={strong ? "font-medium text-stone-900" : "text-stone-500"}>
                {label}
            </dt>
            <dd className="text-right text-stone-500">{money(from)}</dd>
            <dd
                className={`min-w-[5.5rem] text-right ${strong ? "text-lg font-semibold text-stone-900" : "text-stone-800"
                    } ${changed && !strong ? "font-medium" : ""}`}
            >
                {money(to)}
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

const ghostBtn =
    "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600";

/* ---------- page ---------- */

const ManageSalary = () => {
    const params = useParams();
    const location = useLocation();
    const targetId = params.employeeId || location.state?.employeeId;

    const employees = employeeStore((s) => s.employees);
    const incrementLogs = employeeStore((s) => s.incrementLogs);
    const incrementPagination = employeeStore((s) => s.incrementPagination);
    const currentPackage = employeeStore((s) => s.currentPackage);
    const currentBasePay = employeeStore((s) => s.currentBasePay);
    const addEmployeeSalary = employeeStore((s) => s.addEmployeeSalary);
    const addEmployeeSalaryInfo = employeeStore((s) => s.addEmployeeSalaryInfo);
    const addSalaryIncrementLog = employeeStore((s) => s.addSalaryIncrementLog);
    const getIncrementLogs = employeeStore((s) => s.getSalaryIncrementLogsById);
    const clearIncrementLogs = employeeStore((s) => s.clearIncrementLogs);

    const [tab, setTab] = useState("payment");
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [loadingMore, setLoadingMore] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [pay, setPay] = useState(() => ({
        paidAmount: "",
        pTax: "",
        esi: "",
        ...blankPay(),
    }));
    const [payDirty, setPayDirty] = useState(false);
    const [payErrors, setPayErrors] = useState({});
    const [confirming, setConfirming] = useState(false);

    const [rev, setRev] = useState(blankRevision);
    const [revErrors, setRevErrors] = useState({});
    const [setup, setSetup] = useState(blankSetup);
    const [setupErrors, setSetupErrors] = useState({});
    const [showIncrementHistory, setShowIncrementHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const employee = useMemo(
        () =>
            employees.find((e) => e.id === targetId) ||
            location.state?.employee ||
            null,
        [employees, targetId, location.state],
    );

    /* ----- current salary package (employeeSalary) ----- */

    const pkgBase = num(currentPackage?.basePay ?? currentBasePay);
    const pkgPTax = num(currentPackage?.pTax);
    const pkgEsi = num(currentPackage?.esi);
    const pkgNet = num(currentPackage?.finalPay ?? pkgBase - pkgPTax - pkgEsi);
    const hasSalary = status === "ready" && pkgBase > 0;
    const loading = status === "loading";

    const lastIncrement = incrementLogs[0];
    const hasMore = Boolean(incrementPagination?.hasNextPage);

    /* ----- loading ----- */

    const loadHistory = useCallback(
        async (extra = {}, append = false) => {
            if (!targetId) return false;
            setHistoryError(null);
            try {
                await getIncrementLogs(
                    targetId,
                    { limit: PAGE_SIZE, ...extra },
                    append,
                );
                return true;
            } catch (err) {
                setHistoryError(apiMessage(err, "Couldn't load this salary record."));
                return false;
            }
        },
        [targetId, getIncrementLogs],
    );

    useEffect(() => {
        if (!targetId) return undefined;
        let cancelled = false;

        setStatus("loading");
        clearIncrementLogs();
        setNotice(null);
        setPay({ paidAmount: "", pTax: "", esi: "", ...blankPay() });
        setPayDirty(false);
        setConfirming(false);
        setRev(blankRevision());
        setSetup(blankSetup());

        loadHistory().then((ok) => {
            if (cancelled) return;
            setStatus(ok ? "ready" : "error");
            if (ok) {
                const s = employeeStore.getState();
                const base = num(s.currentPackage?.basePay ?? s.currentBasePay);
                setTab(base > 0 ? "payment" : "package");
            }
        });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId]);

    // Fill base / pTax / ESI from the package until the user edits the form
    useEffect(() => {
        if (status === "ready" && !payDirty) {
            setPay((p) => ({ ...p, ...payDefaults(pkgBase, pkgPTax, pkgEsi) }));
        }
    }, [status, pkgBase, pkgPTax, pkgEsi, payDirty]);

    const loadMore = async () => {
        setLoadingMore(true);
        await loadHistory({ cursor: incrementPagination?.nextCursor }, true);
        setLoadingMore(false);
    };

    /* ----- payment form ----- */

    const paidBase = num(pay.paidAmount);
    // Same formula the backend uses for the mirrored expense
    const payTotal = paidBase + num(pay.bonus) + num(pay.overtime) - num(pay.lop);
    const withheld = num(pay.pTax) + num(pay.esi);
    const takeHome = payTotal - withheld;

    const setPayField = (key) => (e) => {
        const value = e.target.value;
        setPay((f) => ({ ...f, [key]: value }));
        setPayDirty(true);
        setConfirming(false);
        setPayErrors((errs) => ({ ...errs, [key]: undefined }));
    };

    const resetPay = () => {
        setPay({
            ...payDefaults(pkgBase, pkgPTax, pkgEsi),
            ...blankPay(),
        });
        setPayDirty(false);
        setPayErrors({});
        setConfirming(false);
    };

    const validatePayment = () => {
        const errs = {};
        if (!(paidBase > 0)) errs.paidAmount = "Enter an amount above ₹0.";
        ["bonus", "overtime", "lop", "pTax", "esi"].forEach((k) => {
            if (num(pay[k]) < 0) errs[k] = "Can't be negative.";
        });
        if (!pay.month) errs.month = "Pick a month.";
        if (!pay.fy) errs.fy = "Pick a financial year.";
        if (!errs.paidAmount && !errs.lop && payTotal < 0) {
            errs.lop = "LOP can't be more than the total pay.";
        }
        if (!errs.pTax && !errs.esi && payTotal >= 0 && takeHome < 0) {
            errs.pTax = "pTax and ESI add up to more than the payout.";
        }
        return errs;
    };

    const requestPayment = (e) => {
        e.preventDefault();
        const errs = validatePayment();
        setPayErrors(errs);
        if (Object.values(errs).some(Boolean)) return;
        setConfirming(true);
    };

    const handleRefresh = async () => {
        if (refreshing) return;

        setRefreshing(true);

        try {
            await loadHistory();
        } finally {
            setRefreshing(false);
        }
    };

    const navigate = useNavigate()

    const confirmPayment = async () => {
        if (submitting) return;
        setSubmitting(true);
        setNotice(null);
        try {
            await addEmployeeSalary({
                employeeId: targetId,
                paidAmount: paidBase,
                pTax: pay.pTax === "" ? undefined : num(pay.pTax),
                esi: pay.esi === "" ? undefined : num(pay.esi),
                bonus: num(pay.bonus),
                overtime: num(pay.overtime),
                lop: num(pay.lop),
                month: pay.month,
                fy: pay.fy,
                note: pay.note.trim() || undefined,
            });
            setNotice({
                type: "success",
                text: `${money(payTotal)} recorded for ${pay.month} ${pay.fy} and added to expenses.`,
                links: true,
            });
            resetPay();
            navigate("/dashboard/expense");
        } catch (err) {
            setConfirming(false);
            setNotice({
                type: "error",
                text: apiMessage(err, "Couldn't record the payment. Try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ----- package: first-time setup ----- */

    const setupNet = num(setup.basePay) - num(setup.pTax) - num(setup.esi);

    const setSetupField = (key) => (e) => {
        const value = e.target.value;
        setSetup((f) => ({ ...f, [key]: value }));
        setSetupErrors((errs) => ({ ...errs, [key]: undefined }));
    };

    const submitSetup = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!(num(setup.basePay) > 0)) errs.basePay = "Enter a base pay above ₹0.";
        if (num(setup.pTax) < 0) errs.pTax = "Can't be negative.";
        if (num(setup.esi) < 0) errs.esi = "Can't be negative.";
        if (!errs.basePay && !errs.pTax && !errs.esi && setupNet < 0) {
            errs.pTax = "pTax and ESI add up to more than the base pay.";
        }
        setSetupErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        setSubmitting(true);
        setNotice(null);
        try {
            await addEmployeeSalaryInfo({
                employeeId: targetId,
                basePay: num(setup.basePay),
                pTax: num(setup.pTax),
                esi: num(setup.esi),
            });
            setNotice({
                type: "success",
                text: `Salary package saved. Base pay is ${money(setup.basePay)}.`,
            });
            setSetup(blankSetup());
            await loadHistory();
        } catch (err) {
            setNotice({
                type: "error",
                text: apiMessage(err, "Couldn't save the salary package. Try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ----- package: revision (increment) ----- */

    const revAmount = num(rev.amount);
    const revPTax = rev.pTax === "" ? pkgPTax : num(rev.pTax);
    const revEsi = rev.esi === "" ? pkgEsi : num(rev.esi);
    const revBase = pkgBase + revAmount;
    const revNet = revBase - revPTax - revEsi;
    const revPercent = pkgBase > 0 ? (revAmount / pkgBase) * 100 : 0;

    const setRevField = (key) => (e) => {
        const value = e.target.value;
        setRev((f) => ({ ...f, [key]: value }));
        setRevErrors((errs) => ({ ...errs, [key]: undefined }));
    };

    const submitRevision = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!(revAmount > 0)) errs.amount = "Enter an increment above ₹0.";
        if (!rev.date) errs.date = "Pick the date this takes effect.";
        if (num(rev.pTax) < 0) errs.pTax = "Can't be negative.";
        if (num(rev.esi) < 0) errs.esi = "Can't be negative.";
        if (!errs.pTax && !errs.esi && revNet < 0) {
            errs.pTax = "pTax and ESI add up to more than the new base pay.";
        }
        setRevErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        setSubmitting(true);
        setNotice(null);
        try {
            await addSalaryIncrementLog({
                employeeId: targetId,
                basePay: revBase,
                ...(rev.pTax !== "" && { pTax: num(rev.pTax) }),
                ...(rev.esi !== "" && { esi: num(rev.esi) }),
                increments: {
                    incrementAmount: revAmount,
                    incrementDate: rev.date,
                    currentSalary: revBase,
                    ...(rev.note.trim() && { note: rev.note.trim() }),
                },
            });
            setNotice({
                type: "success",
                text: `Increment saved. New base pay is ${money(revBase)}.`,
            });
            setRev(blankRevision());
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
                        to={LIST_ROUTE}
                        className="mt-4 inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
                    >
                        <Icon d={ICONS.back} />
                        Back to Employees
                    </Link>
                </div>
            </div>
        );
    }

    const historyLink = (

        <Link
            to={VIEW_ROUTE}
            state={{ employeeId: targetId, employee }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
            View payment history
        </Link>
    );

    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <Link
                to={LIST_ROUTE}
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
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                                {employee?.empName || "Employee"}
                            </h1>
                            <StatusBadge status={employee?.status} />
                        </div>
                        <p className="text-sm text-stone-500">
                            {employee?.empPhone ? `${employee.empPhone} · ` : ""}Manage
                            salary
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {historyLink}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {status === "error" &&
                <div className="rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
                    <p className="text-sm text-stone-700">{historyError}</p>
                    <button
                        type="button"
                        onClick={async () => {
                            setStatus("loading");
                            setStatus((await loadHistory()) ? "ready" : "error");
                        }}
                        className="mt-3 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                        Try again
                    </button>
                </div>
            }

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
                {notice?.links && (
                    <div className="mt-1.5 flex gap-4 text-xs font-medium">
                        <Link
                            to={VIEW_ROUTE}
                            state={{ employeeId: targetId, employee }}
                            className="underline underline-offset-2"
                        >
                            Payment history
                        </Link>
                        <Link
                            to={EXPENSE_ROUTE}
                            className="underline underline-offset-2"
                        >
                            Expenses
                        </Link>
                    </div>
                )}
            </Notice>

            {/* ---------- Pay salary ---------- */}
            {tab === "payment" && (
                <div
                    role="tabpanel"
                    id="panel-payment"
                    aria-labelledby="tab-payment"
                    className="grid gap-5 lg:grid-cols-[1fr_320px]"
                >
                    <form
                        onSubmit={requestPayment}
                        noValidate
                        className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"
                    >
                        <h2 className="text-base font-semibold text-stone-900">
                            Record a salary payment
                        </h2>
                        <p className="mt-0.5 text-sm text-stone-500">
                            Saves the payment for the month and adds it to expenses
                            under Salary.
                        </p>

                        {employee?.status === "DEACTIVATED" && (
                            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                This employee is deactivated. You can still record a
                                payment, for example a final settlement.
                            </p>
                        )}

                        {status === "ready" && !hasSalary && (
                            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                No salary package is saved yet, so nothing is pre-filled.{" "}
                                <button
                                    type="button"
                                    onClick={() => setTab("package")}
                                    className="cursor-pointer font-medium underline underline-offset-2"
                                >
                                    Set up the package
                                </button>
                            </p>
                        )}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <SelectField
                                label="Month"
                                options={MONTHS}
                                value={pay.month}
                                onChange={setPayField("month")}
                                error={payErrors.month}
                            />
                            <SelectField
                                label="Financial year"
                                options={FY_OPTIONS}
                                value={pay.fy}
                                onChange={setPayField("fy")}
                                error={payErrors.fy}
                            />
                            <Field
                                className="sm:col-span-2"
                                label="Base amount paid"
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.paidAmount}
                                onChange={setPayField("paidAmount")}
                                error={payErrors.paidAmount}
                                hint={
                                    hasSalary
                                        ? `Pre-filled from the saved base pay of ${money(pkgBase)}.`
                                        : "Base salary for this payment."
                                }
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
                                label="Loss of pay (LOP)"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.lop}
                                onChange={setPayField("lop")}
                                error={payErrors.lop}
                                hint="Amount deducted for unpaid leave."
                            />
                            <Field
                                label="Professional tax (pTax)"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.pTax}
                                onChange={setPayField("pTax")}
                                error={payErrors.pTax}
                                hint="Pre-filled from the package. Change it for this month only."
                            />
                            <Field
                                label="ESI"
                                optional
                                prefix="₹"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={pay.esi}
                                onChange={setPayField("esi")}
                                error={payErrors.esi}
                                hint="Pre-filled from the package."
                            />
                            <div className="sm:col-span-2">
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
                                    placeholder="e.g. Includes Diwali bonus"
                                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                                />
                            </div>
                        </div>

                        {confirming ? (
                            <div
                                role="alertdialog"
                                aria-label="Confirm payment"
                                className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                            >
                                <p>
                                    Record{" "}
                                    <strong className="tabular-nums">
                                        {money(payTotal)}
                                    </strong>{" "}
                                    for {pay.month} {pay.fy}? This also creates an expense
                                    entry.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirming(false)}
                                        disabled={submitting}
                                        className={ghostBtn}
                                    >
                                        Go back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmPayment}
                                        disabled={submitting}
                                        className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                                    >
                                        {submitting ? "Recording…" : "Confirm payment"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetPay}
                                    className={ghostBtn}
                                >
                                    Reset
                                </button>
                                <PrimaryButton busy={loading || submitting}>
                                    Review payment
                                </PrimaryButton>
                            </div>
                        )}
                    </form>

                    <aside
                        aria-label="Payment summary"
                        className="h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6"
                    >
                        <h2 className="text-sm font-medium text-stone-800">
                            Payout for {pay.month} {pay.fy}
                        </h2>
                        <dl className="mt-2 text-sm">
                            <SummaryRow label="Base amount" value={paidBase} />
                            <SummaryRow label="Bonus" value={num(pay.bonus)} sign="+" />
                            <SummaryRow
                                label="Overtime"
                                value={num(pay.overtime)}
                                sign="+"
                            />
                            <SummaryRow label="LOP" value={num(pay.lop)} sign="−" />
                            <SummaryRow
                                label="Total payout"
                                value={Math.max(payTotal, 0)}
                                strong
                            />
                        </dl>
                        <p className="mt-2 text-xs text-stone-500">
                            This total is what is added to expenses.
                        </p>

                        <dl className="mt-4 border-t border-stone-200 pt-2 text-sm">
                            <SummaryRow label="pTax" value={num(pay.pTax)} sign="−" />
                            <SummaryRow label="ESI" value={num(pay.esi)} sign="−" />
                            <SummaryRow
                                label="Take-home"
                                value={Math.max(takeHome, 0)}
                                strong
                            />
                        </dl>
                    </aside>
                </div>
            )}

            {/* ---------- Salary package ---------- */}
            {tab === "package" && (
                <div
                    role="tabpanel"
                    id="panel-package"
                    aria-labelledby="tab-package"
                    className="space-y-5"
                >
                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                        {hasSalary || loading ? (
                            <form
                                onSubmit={submitRevision}
                                noValidate
                                className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"
                            >
                                <h2 className="text-base font-semibold text-stone-900">
                                    Add a salary increment
                                </h2>
                                <p className="mt-0.5 text-sm text-stone-500">
                                    Raises the base pay and keeps a dated record of the
                                    change.
                                </p>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Increment amount"
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={rev.amount}
                                        onChange={setRevField("amount")}
                                        error={revErrors.amount}
                                        disabled={loading}
                                    />
                                    <Field
                                        label="Effective from"
                                        type="date"
                                        value={rev.date}
                                        onChange={setRevField("date")}
                                        error={revErrors.date}
                                        disabled={loading}
                                    />
                                    <Field
                                        label="New pTax"
                                        optional
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        placeholder={String(pkgPTax)}
                                        value={rev.pTax}
                                        onChange={setRevField("pTax")}
                                        error={revErrors.pTax}
                                        hint="Leave blank to keep the current amount."
                                        disabled={loading}
                                    />
                                    <Field
                                        label="New ESI"
                                        optional
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        placeholder={String(pkgEsi)}
                                        value={rev.esi}
                                        onChange={setRevField("esi")}
                                        error={revErrors.esi}
                                        hint="Leave blank to keep the current amount."
                                        disabled={loading}
                                    />
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="rev-note"
                                            className="mb-1 flex items-baseline justify-between text-sm font-medium text-stone-800"
                                        >
                                            Note
                                            <span className="text-xs font-normal text-stone-400">
                                                Optional
                                            </span>
                                        </label>
                                        <textarea
                                            id="rev-note"
                                            rows={2}
                                            value={rev.note}
                                            onChange={setRevField("note")}
                                            placeholder="e.g. Annual appraisal"
                                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRev(blankRevision());
                                            setRevErrors({});
                                        }}
                                        className={ghostBtn}
                                    >
                                        Clear
                                    </button>
                                    <PrimaryButton busy={submitting || loading}>
                                        {submitting ? "Saving…" : "Save increment"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={submitSetup}
                                noValidate
                                className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"
                            >
                                <h2 className="text-base font-semibold text-stone-900">
                                    Set up the salary package
                                </h2>
                                <p className="mt-0.5 text-sm text-stone-500">
                                    No salary is saved for this employee yet. These amounts
                                    pre-fill every payment you record.
                                </p>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <Field
                                        className="sm:col-span-2"
                                        label="Base pay"
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={setup.basePay}
                                        onChange={setSetupField("basePay")}
                                        error={setupErrors.basePay}
                                    />
                                    <Field
                                        label="Professional tax (pTax)"
                                        optional
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={setup.pTax}
                                        onChange={setSetupField("pTax")}
                                        error={setupErrors.pTax}
                                    />
                                    <Field
                                        label="ESI"
                                        optional
                                        prefix="₹"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={setup.esi}
                                        onChange={setSetupField("esi")}
                                        error={setupErrors.esi}
                                    />
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSetup(blankSetup());
                                            setSetupErrors({});
                                        }}
                                        className={ghostBtn}
                                    >
                                        Clear
                                    </button>
                                    <PrimaryButton busy={submitting}>
                                        {submitting ? "Saving…" : "Save package"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}

                        <aside
                            aria-label="Package preview"
                            className="h-fit rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6"
                        >
                            <h2 className="text-sm font-medium text-stone-800">
                                After this change
                            </h2>
                            {hasSalary ? (
                                <>
                                    <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs text-stone-400">
                                        <span />
                                        <span className="text-right">Now</span>
                                        <span className="min-w-[5.5rem] text-right">
                                            After
                                        </span>
                                    </div>
                                    <dl className="text-sm">
                                        <CompareRow
                                            label="Base pay"
                                            from={pkgBase}
                                            to={revBase}
                                        />
                                        <CompareRow
                                            label="pTax"
                                            from={pkgPTax}
                                            to={revPTax}
                                        />
                                        <CompareRow label="ESI" from={pkgEsi} to={revEsi} />
                                        <CompareRow
                                            label="Net monthly pay"
                                            from={pkgNet}
                                            to={revNet}
                                            strong
                                        />
                                    </dl>
                                    {revAmount > 0 && (
                                        <p className="mt-2 text-xs text-stone-500">
                                            A {revPercent.toFixed(1)}% raise on base pay.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <dl className="mt-2 text-sm">
                                    <SummaryRow
                                        label="Base pay"
                                        value={num(setup.basePay)}
                                    />
                                    <SummaryRow
                                        label="pTax"
                                        value={num(setup.pTax)}
                                        sign="−"
                                    />
                                    <SummaryRow
                                        label="ESI"
                                        value={num(setup.esi)}
                                        sign="−"
                                    />
                                    <SummaryRow
                                        label="Net monthly pay"
                                        value={Math.max(setupNet, 0)}
                                        strong
                                    />
                                </dl>
                            )}
                        </aside>
                    </div>

                    {/* Increment history toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 sm:px-6">
                        <label
                            htmlFor="showIncrementHistory"
                            className="flex cursor-pointer items-center gap-3"
                        >
                            <input
                                id="showIncrementHistory"
                                type="checkbox"
                                checked={showIncrementHistory}
                                onChange={(e) =>
                                    setShowIncrementHistory(e.target.checked)
                                }
                                className="h-4 w-4 cursor-pointer rounded border-stone-300 text-teal-700 focus:ring-teal-600"
                            />

                            <span className="text-sm font-semibold text-stone-900">
                                Show increment history
                            </span>
                        </label>

                        {showIncrementHistory && (
                            <span className="text-xs text-stone-500">
                                {incrementPagination?.totalCount ?? incrementLogs.length}{" "}
                                entries
                            </span>
                        )}
                    </div>

                    {/* Increment history */}
                    {showIncrementHistory && (
                        <section
                            aria-label="Increment history"
                            className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                        >
                            <div className="flex items-baseline justify-between px-5 py-4 sm:px-6">
                                <h2 className="text-base font-semibold text-stone-900">
                                    Increment history
                                </h2>
                                {!loading && incrementLogs.length > 0 && (
                                    <span className="text-xs text-stone-500">
                                        {incrementPagination?.totalCount ??
                                            incrementLogs.length}{" "}
                                        {(incrementPagination?.totalCount ??
                                            incrementLogs.length) === 1
                                            ? "entry"
                                            : "entries"}
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div
                                    className="space-y-2 px-5 pb-5 sm:px-6"
                                    aria-hidden="true"
                                >
                                    <div className="h-9 animate-pulse rounded bg-stone-100" />
                                    <div className="h-9 animate-pulse rounded bg-stone-100" />
                                </div>
                            ) : incrementLogs.length === 0 ? (
                                <p className="border-t border-stone-200 px-6 py-10 text-center text-sm text-stone-500">
                                    No increments yet. Each raise you save will be listed
                                    here.
                                </p>
                            ) : (
                                <div className="overflow-x-auto border-t border-stone-200">
                                    <table className="w-full min-w-[560px] text-left text-sm">
                                        <thead className="bg-stone-50 text-xs text-stone-500">
                                            <tr>
                                                <th className="py-3 pl-5 pr-3 font-medium sm:pl-6">
                                                    Effective
                                                </th>
                                                <th className="px-3 py-3 text-right font-medium">
                                                    Increase
                                                </th>
                                                <th className="px-3 py-3 text-right font-medium">
                                                    Base pay after
                                                </th>
                                                <th className="py-3 pl-3 pr-5 text-right font-medium sm:pr-6">
                                                    Net pay after
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="tabular-nums">
                                            {incrementLogs.map((r, i) => {
                                                const amt = num(r.amount);
                                                const before = num(r.previousBasePay);
                                                const pct =
                                                    amt > 0 && before > 0
                                                        ? (amt / before) * 100
                                                        : null;
                                                return (
                                                    <tr
                                                        key={`${r.date}-${i}`}
                                                        className={`border-t border-stone-200 ${i === 0
                                                            ? "bg-teal-50/40"
                                                            : "hover:bg-stone-50"
                                                            }`}
                                                    >
                                                        <td className="py-3 pl-5 pr-3 sm:pl-6">
                                                            <div className="font-medium text-stone-900">
                                                                {fmtDate(r.date)}
                                                            </div>
                                                            {r.note && (
                                                                <div
                                                                    className="mt-0.5 max-w-[240px] truncate text-xs text-stone-500"
                                                                    title={r.note}
                                                                >
                                                                    {r.note}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            {amt > 0 ? (
                                                                <span className="text-emerald-700">
                                                                    +{money(amt)}
                                                                    {pct !== null && (
                                                                        <span className="ml-1 text-xs text-stone-500">
                                                                            {pct.toFixed(1)}%
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="text-stone-400">
                                                                    Starting pay
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-semibold text-stone-900">
                                                            {money(r.basePay ?? r.currentSalary)}
                                                        </td>
                                                        <td className="py-3 pl-3 pr-5 text-right text-stone-600 sm:pr-6">
                                                            {moneyOrDash(r.finalPay)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {!loading && incrementLogs.length > 0 && (
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
                                            className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                                        >
                                            {loadingMore ? "Loading…" : "Load older entries"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            )}


        </div>
    );
};

export default ManageSalary;
