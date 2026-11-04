// Place at: src/utils/salaryHelpers.js

export const num = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
};

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const money = (n) => inr.format(num(n));

export const moneyOrDash = (n) =>
    n === null || n === undefined || n === "" ? "—" : money(n);

export const signedMoney = (n) => `${n > 0 ? "+" : "−"}${money(Math.abs(n))}`;

export const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

export const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "—";

export const todayISO = () => new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd

export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const getCurrentMonth = () =>
    new Date().toLocaleString("en-US", { month: "long" });

/* Indian financial year: April to March, e.g. "2026-27" */
const fyStartYear = () => {
    const d = new Date();
    return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
};

const fyLabel = (startYear) => `${startYear}-${String(startYear + 1).slice(2)}`;

export const getCurrentFY = () => fyLabel(fyStartYear());

export const fyOptions = (count = 5) =>
    Array.from({ length: count }, (_, i) => fyLabel(fyStartYear() - i));

/* Turns an axios error into one clean sentence */
export const apiMessage = (err, fallback) => {
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

/* employeeSalaryLog maths. Mirrors the backend expense: paidAmount + bonus + overtime - lop */
export const payoutOf = (log) =>
    num(log?.paidAmount) + num(log?.bonus) + num(log?.overtime) - num(log?.lop);

/* What the employee actually receives after pTax and ESI are withheld */
export const inHandOf = (log) =>
    payoutOf(log) - num(log?.pTax) - num(log?.esi);
