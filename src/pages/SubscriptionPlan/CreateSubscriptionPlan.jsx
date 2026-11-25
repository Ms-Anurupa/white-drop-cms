import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionStore from "@/zustand/Store/subscriptionStore";

const ROUTES = { list: "/dashboard/subscriptionPlans" };

const WEEKDAYS = [
  { label: "Monday", short: "Mon", value: "MONDAY" },
  { label: "Tuesday", short: "Tue", value: "TUESDAY" },
  { label: "Wednesday", short: "Wed", value: "WEDNESDAY" },
  { label: "Thursday", short: "Thu", value: "THURSDAY" },
  { label: "Friday", short: "Fri", value: "FRIDAY" },
  { label: "Saturday", short: "Sat", value: "SATURDAY" },
  { label: "Sunday", short: "Sun", value: "SUNDAY" },
];

const PRESETS = [
  {
    label: "Weekdays",
    days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  },
  { label: "Weekend", days: ["SATURDAY", "SUNDAY"] },
  { label: "Every day", days: WEEKDAYS.map((d) => d.value) },
];

const LIMITS = { name: 60, description: 300 };
const FIELD_ORDER = [
  "name",
  "description",
  "minDurationMonths",
  "intervalWeeks",
  "defaultDays",
];

const initialForm = {
  name: "",
  description: "",
  minDurationMonths: "1",
  intervalWeeks: "1",
  defaultDays: [],
  isActive: true,
};

const sortDays = (days) =>
  [...days].sort(
    (a, b) =>
      WEEKDAYS.findIndex((d) => d.value === a) -
      WEEKDAYS.findIndex((d) => d.value === b),
  );

const pluralize = (n, word) => `${n} ${word}${Number(n) === 1 ? "" : "s"}`;

const inputClass = (hasError) =>
  `mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-50 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800/50 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-950/50"
      : "border-stone-200 focus:border-teal-500 focus:ring-teal-100 dark:border-slate-700 dark:focus:border-teal-500 dark:focus:ring-teal-950/50"
  }`;

/* ------------------------------ UI primitives ----------------------------- */

const Card = ({ title, description, children }) => (
  <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-base font-semibold text-stone-900 dark:text-slate-100">{title}</h2>
    {description && (
      <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">{description}</p>
    )}
    <div className="mt-5">{children}</div>
  </section>
);

const Field = ({ id, label, required, hint, error, counter, children }) => (
  <div>
    <div className="flex items-baseline justify-between gap-2">
      <label
        htmlFor={`field-${id}`}
        className="text-sm font-medium text-stone-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {counter}
    </div>
    {children}
    {error ? (
      <p
        id={`${id}-error`}
        role="alert"
        className="mt-1.5 text-xs text-red-600 dark:text-red-400"
      >
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-500 dark:text-slate-400">
          {hint}
        </p>
      )
    )}
  </div>
);

const Stepper = ({
  id,
  value,
  onChange,
  min = 1,
  max = 60,
  disabled,
  invalid,
  describedBy,
}) => {
  const num = Number(value) || 0;
  const btn =
    "cursor-pointer flex h-10 w-10 items-center justify-center text-lg text-stone-600 transition hover:bg-stone-50 focus:outline-none focus-visible:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700";
  return (
    <div
      className={`mt-1.5 flex items-center overflow-hidden rounded-lg border bg-white focus-within:ring-2 dark:bg-slate-800 ${
        invalid
          ? "border-red-400 focus-within:ring-red-100 dark:border-red-500 dark:focus-within:ring-red-950/50"
          : "border-stone-200 focus-within:border-teal-500 focus-within:ring-teal-100 dark:border-slate-700 dark:focus-within:border-teal-500 dark:focus-within:ring-teal-950/50"
      }`}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || num <= min}
        onClick={() => onChange(String(Math.max(min, num - 1)))}
        className={btn}
      >
        −
      </button>
      <input
        id={`field-${id}`}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step="1"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="h-10 w-full border-x border-stone-200 text-center text-sm font-medium text-stone-800 outline-none [appearance:textfield] disabled:bg-stone-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-800/50"
      />
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || num >= max}
        onClick={() => onChange(String(Math.min(max, num + 1)))}
        className={btn}
      >
        +
      </button>
    </div>
  );
};

const Counter = ({ value, max }) => (
  <span
    className={`text-xs ${value.length >= max ? "text-amber-600 dark:text-amber-400" : "text-stone-400 dark:text-slate-500"}`}
  >
    {value.length}/{max}
  </span>
);

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
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
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* --------------------------------- Page ---------------------------------- */

const CreateSubscriptionPlan = () => {
  const navigate = useNavigate();
  const { createSubscriptionPlan } = subscriptionStore();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const redirectTimer = useRef(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form],
  );
  const busy = loading || success;

  /* cleanup redirect timer */
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  /* warn on tab close with unsaved changes */
  useEffect(() => {
    if (!isDirty || success) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, success]);

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      defaultDays: sortDays(
        prev.defaultDays.includes(day)
          ? prev.defaultDays.filter((d) => d !== day)
          : [...prev.defaultDays, day],
      ),
    }));
    clearError("defaultDays");
  };

  const applyPreset = (days) => {
    setForm((prev) => ({ ...prev, defaultDays: days }));
    clearError("defaultDays");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Plan name is required.";
    if (!form.description.trim()) e.description = "Description is required.";

    const months = Number(form.minDurationMonths);
    if (!Number.isInteger(months) || months < 1)
      e.minDurationMonths = "Minimum duration must be at least 1 month.";

    const weeks = Number(form.intervalWeeks);
    if (!Number.isInteger(weeks) || weeks < 1)
      e.intervalWeeks = "Interval must be at least 1 week.";

    if (form.defaultDays.length === 0)
      e.defaultDays = "Select at least one delivery day.";
    return e;
  };

  const focusFirstError = (errs) => {
    const key = FIELD_ORDER.find((k) => errs[k]);
    if (!key) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`field-${key}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.({ preventScroll: true });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setApiError("");

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(found);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      isCustom: false,
      minDurationMonths: Number(form.minDurationMonths),
      intervalWeeks: Number(form.intervalWeeks),
      defaultDays: form.defaultDays,
      isActive: form.isActive,
    };

    try {
      setLoading(true);
      const response = await createSubscriptionPlan(payload);
      console.log("createSubscriptionPlan response:", response);

      if (response?.success === false) {
        setApiError(response.message || "Failed to create subscription plan.");
        return;
      }

      setSuccess(true);
      redirectTimer.current = setTimeout(() => navigate(ROUTES.list), 1200);
    } catch (error) {
      console.error("Create subscription plan error:", error);

      const fieldErrors = error?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const formatted = {};
        Object.entries(fieldErrors).forEach(([key, value]) => {
          formatted[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors((prev) => ({ ...prev, ...formatted }));
        focusFirstError(formatted);
      }

      setApiError(
        error?.response?.data?.message ||
          "Something went wrong while creating the plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    if (
      isDirty &&
      !success &&
      !window.confirm("Discard this plan? Your changes will be lost.")
    )
      return;
    navigate(ROUTES.list);
  };

  /* live summary */
  const selectedLabels = WEEKDAYS.filter((d) =>
    form.defaultDays.includes(d.value),
  ).map((d) => d.short);
  const intervalNum = Number(form.intervalWeeks) || 1;
  const monthsNum = Number(form.minDurationMonths) || 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}
      <header>
        <button
          type="button"
          onClick={handleLeave}
          className="mb-3 inline-flex cursor-pointer items-center gap-1 rounded text-sm font-medium text-teal-700 transition hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
        >
          <span aria-hidden="true">←</span> Subscription Plans
        </button>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-slate-100">
          Create Subscription Plan
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
          Set up a delivery schedule customers can subscribe to.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* LEFT: FORM */}
          <div className="space-y-6">
            {/* FEEDBACK */}
            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <span aria-hidden="true">✓</span>
                Plan created successfully. Redirecting…
              </div>
            )}
            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300"
              >
                {apiError}
              </div>
            )}

            <Card
              title="Plan details"
              description="How this plan appears to your customers."
            >
              <div className="grid gap-5">
                <Field
                  id="name"
                  label="Plan name"
                  required
                  error={errors.name}
                  counter={<Counter value={form.name} max={LIMITS.name} />}
                >
                  <input
                    id="field-name"
                    type="text"
                    maxLength={LIMITS.name}
                    placeholder="e.g. Daily Milk – Monthly"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    disabled={busy}
                    aria-invalid={!!errors.name || undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field
                  id="description"
                  label="Description"
                  required
                  error={errors.description}
                  counter={
                    <Counter
                      value={form.description}
                      max={LIMITS.description}
                    />
                  }
                >
                  <textarea
                    id="field-description"
                    rows={3}
                    maxLength={LIMITS.description}
                    placeholder="What's included, who it's for…"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    disabled={busy}
                    aria-invalid={!!errors.description || undefined}
                    aria-describedby={
                      errors.description ? "description-error" : undefined
                    }
                    className={`${inputClass(errors.description)} resize-none`}
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Schedule"
              description="How long customers commit and how often they get deliveries."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="minDurationMonths"
                  label="Minimum duration"
                  error={errors.minDurationMonths}
                  hint={`Customers commit for at least ${pluralize(monthsNum, "month")}.`}
                >
                  <Stepper
                    id="minDurationMonths"
                    value={form.minDurationMonths}
                    onChange={(v) => updateField("minDurationMonths", v)}
                    max={60}
                    disabled={busy}
                    invalid={!!errors.minDurationMonths}
                    describedBy={
                      errors.minDurationMonths
                        ? "minDurationMonths-error"
                        : "minDurationMonths-hint"
                    }
                  />
                </Field>

                <Field
                  id="intervalWeeks"
                  label="Delivery interval"
                  error={errors.intervalWeeks}
                  hint={
                    intervalNum === 1
                      ? "Deliveries repeat every week."
                      : `Deliveries repeat every ${intervalNum} weeks.`
                  }
                >
                  <Stepper
                    id="intervalWeeks"
                    value={form.intervalWeeks}
                    onChange={(v) => updateField("intervalWeeks", v)}
                    max={12}
                    disabled={busy}
                    invalid={!!errors.intervalWeeks}
                    describedBy={
                      errors.intervalWeeks
                        ? "intervalWeeks-error"
                        : "intervalWeeks-hint"
                    }
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Delivery days"
              description="Weekdays on which deliveries are scheduled."
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={busy}
                    onClick={() => applyPreset(p.days)}
                    className="cursor-pointer rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
                {form.defaultDays.length > 0 && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => applyPreset([])}
                    className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-stone-500 transition hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div
                id="field-defaultDays"
                tabIndex={-1}
                role="group"
                aria-label="Delivery days"
                aria-describedby={
                  errors.defaultDays ? "defaultDays-error" : undefined
                }
                className="grid grid-cols-4 gap-2 outline-none sm:grid-cols-7"
              >
                {WEEKDAYS.map((day) => {
                  const selected = form.defaultDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      disabled={busy}
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={selected}
                      aria-label={day.label}
                      title={day.label}
                      className={`cursor-pointer h-11 rounded-lg border text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 ${
                        selected
                          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                          : errors.defaultDays
                            ? "border-red-300 text-stone-600 hover:bg-red-50 dark:border-red-700 dark:text-slate-300 dark:hover:bg-red-950/40"
                            : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>

              {errors.defaultDays ? (
                <p
                  id="defaultDays-error"
                  role="alert"
                  className="mt-2 text-xs text-red-600 dark:text-red-400"
                >
                  {errors.defaultDays}
                </p>
              ) : (
                <p className="mt-2 text-xs text-stone-500 dark:text-slate-400" aria-live="polite">
                  {form.defaultDays.length === 0
                    ? "No days selected yet."
                    : `${pluralize(form.defaultDays.length, "day")} selected.`}
                </p>
              )}
            </Card>

            <Card title="Availability">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    id="active-label"
                    className="text-sm font-medium text-stone-800 dark:text-slate-200"
                  >
                    Active plan
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-slate-400">
                    {form.isActive
                      ? "Customers can subscribe to this plan right away."
                      : "Saved as inactive. Customers won't see it until you activate it."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  aria-labelledby="active-label"
                  disabled={busy}
                  onClick={() => updateField("isActive", !form.isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-900 ${
                    form.isActive ? "bg-teal-600" : "bg-stone-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.isActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </Card>
          </div>

          {/* RIGHT: LIVE SUMMARY */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-slate-400">
                Plan summary
              </p>

              <h3
                className={`mt-3 break-words text-base font-semibold ${
                  form.name.trim() ? "text-stone-900 dark:text-slate-100" : "text-stone-300 dark:text-slate-600"
                }`}
              >
                {form.name.trim() || "Untitled plan"}
              </h3>
              <p className="mt-1 line-clamp-3 break-words text-sm text-stone-500 dark:text-slate-400">
                {form.description.trim() ||
                  "Your description will appear here."}
              </p>

              <dl className="mt-4 space-y-3 border-t border-stone-100 pt-4 text-sm dark:border-slate-800">
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500 dark:text-slate-400">Frequency</dt>
                  <dd className="text-right font-medium text-stone-800 dark:text-slate-200">
                    {intervalNum === 1
                      ? "Every week"
                      : `Every ${intervalNum} weeks`}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500 dark:text-slate-400">Days</dt>
                  <dd className="text-right font-medium text-stone-800 dark:text-slate-200">
                    {selectedLabels.length ? selectedLabels.join(", ") : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500 dark:text-slate-400">Min. duration</dt>
                  <dd className="text-right font-medium text-stone-800 dark:text-slate-200">
                    {pluralize(monthsNum, "month")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-stone-500 dark:text-slate-400">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        form.isActive
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                          : "bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          form.isActive ? "bg-teal-500" : "bg-stone-400"
                        }`}
                      />
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* STICKY ACTION BAR */}
        <div className="sticky bottom-4 z-10 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <p className="px-2 text-xs text-stone-500 dark:text-slate-400" aria-live="polite">
              {isDirty && !success ? "You have unsaved changes" : "\u00A0"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy}
                className="cursor-pointer rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              >
                {loading && <Spinner />}
                {loading ? "Creating…" : success ? "Created" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateSubscriptionPlan;
