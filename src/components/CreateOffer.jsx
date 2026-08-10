import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useOfferStore from "../zustand/Store/offerStore";

const CreateOffer = () => {
  const navigate = useNavigate();

  const createOffer = useOfferStore((state) => state.createOffer);

  const loading = useOfferStore((state) => state.creating);

  const [formData, setFormData] = useState({
    offerLabel: "",
    offerCode: "",
    description: "",
    offerTypeId: "",
    discountType: "",
    fromDate: "",
    toDate: "",
    priority: 1,
    isActive: true,
    maxUsage: "",
    perUserLimit: "",
  });

  const [ruleData, setRuleData] = useState({
    paidDays: "",
    rewardDays: "",
  });

  const [errors, setErrors] = useState({});

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /* =========================================================
     RULE CHANGE
  ========================================================= */

  const handleRuleChange = (e) => {
    const { name, value } = e.target;

    setRuleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.offerLabel.trim()) {
      newErrors.offerLabel = "Offer title is required";
    }

    if (!formData.offerTypeId) {
      newErrors.offerTypeId = "Offer type is required";
    }

    if (!formData.fromDate) {
      newErrors.fromDate = "Start date is required";
    }

    if (!formData.toDate) {
      newErrors.toDate = "End date is required";
    }

    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.fromDate) >= new Date(formData.toDate)
    ) {
      newErrors.toDate = "Valid to must be after valid from";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      offerLabel: formData.offerLabel.trim(),

      offerCode: formData.offerCode.trim() || null,

      description: formData.description.trim() || null,

      offerTypeId: formData.offerTypeId,

      fromDate: formData.fromDate,

      toDate: formData.toDate,

      priority: Number(formData.priority) || 1,

      isActive: formData.isActive,

      maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,

      perUserLimit: formData.perUserLimit
        ? Number(formData.perUserLimit)
        : null,

      offerRule: {
        discountType: formData.discountType || null,

        paidDays: ruleData.paidDays ? Number(ruleData.paidDays) : null,

        rewardDays: ruleData.rewardDays ? Number(ruleData.rewardDays) : null,
      },
    };

    try {
      await createOffer(payload);

      // Go back to Offer Listing
      navigate("/offers");
    } catch (error) {
      console.error("Create offer failed:", error);
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[58px] max-w-[1400px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-[18px] text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              ←
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-50 text-cyan-600">
                  ✦
                </div>

                <h1 className="text-[15px] font-semibold text-slate-800">
                  New offer
                </h1>
              </div>

              <p className="ml-9 text-[9px] text-slate-500">
                Create a new promotion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1400px] px-5 py-5">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]"
        >
          {/* =================================================
              LEFT — OFFER BASICS
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[12px] font-semibold text-slate-700">
                Offer Basics
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                Configure the basic information for your offer.
              </p>
            </div>

            <div className="p-5">
              {/* TITLE */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Title <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="offerLabel"
                  value={formData.offerLabel}
                  onChange={handleChange}
                  placeholder="e.g. Diwali Flash — 40% Off"
                  className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df] ${
                    errors.offerLabel ? "border-red-400" : "border-slate-200"
                  }`}
                />

                {errors.offerLabel && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {errors.offerLabel}
                  </p>
                )}
              </div>

              {/* OFFER CODE */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Offer code
                </label>

                <input
                  type="text"
                  name="offerCode"
                  value={formData.offerCode}
                  onChange={handleChange}
                  placeholder="e.g. DIWALI40"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] uppercase text-slate-700 outline-none placeholder:normal-case placeholder:text-slate-400 focus:border-[#6655df]"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe this offer..."
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
                />
              </div>

              {/* OFFER TYPE */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Offer type <span className="text-red-500">*</span>
                </label>

                <select
                  name="offerTypeId"
                  value={formData.offerTypeId}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df]"
                >
                  <option value="">Select offer type</option>

                  {/* Replace with your offer types */}
                </select>

                {errors.offerTypeId && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {errors.offerTypeId}
                  </p>
                )}
              </div>

              {/* DISCOUNT TYPE */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Discount type{" "}
                  <span className="font-normal text-slate-400">
                    (optional tag)
                  </span>
                </label>

                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df]"
                >
                  <option value="">None</option>

                  <option value="PERCENTAGE">Percentage</option>

                  <option value="FIXED">Fixed</option>
                </select>
              </div>

              {/* DATES */}

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Valid from
                  </label>

                  <input
                    type="datetime-local"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-[#6655df]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Valid to
                  </label>

                  <input
                    type="datetime-local"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-[#6655df]"
                  />
                </div>
              </div>

              {/* PRIORITY */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Priority
                </label>

                <input
                  type="number"
                  min="1"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df]"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Status
                </label>

                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2.5"
                >
                  <span className="text-[11px] text-slate-700">
                    {formData.isActive ? "Enabled" : "Disabled"}
                  </span>

                  <span
                    className={`relative h-4 w-7 rounded-full ${
                      formData.isActive ? "bg-emerald-400" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition ${
                        formData.isActive ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT — RULE COMPOSER
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[12px] font-semibold text-slate-700">
                Rule Composer
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                Configure the conditions and rewards for this offer.
              </p>
            </div>

            <div className="p-5">
              {/* PAID DAYS */}

              <div className="mb-5">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Paid days (n) <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  name="paidDays"
                  value={ruleData.paidDays}
                  onChange={handleRuleChange}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df]"
                />

                <p className="mt-1 text-[9px] text-slate-400">
                  Days the user pays for
                </p>
              </div>

              {/* REWARD DAYS */}

              <div className="mb-5">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Reward days (x) <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  name="rewardDays"
                  value={ruleData.rewardDays}
                  onChange={handleRuleChange}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df]"
                />

                <p className="mt-1 text-[9px] text-slate-400">
                  Free days granted
                </p>
              </div>

              {/* LIMITS */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Max usage
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="maxUsage"
                    value={formData.maxUsage}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Per user limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="perUserLimit"
                    value={formData.perUserLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
                  />
                </div>
              </div>

              {/* PREVIEW */}

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Rule Preview
                </p>

                <p className="mt-2 text-[11px] text-slate-600">
                  Pay for{" "}
                  <span className="font-semibold text-[#6655df]">
                    {ruleData.paidDays || "n"}
                  </span>{" "}
                  days, receive{" "}
                  <span className="font-semibold text-emerald-600">
                    {ruleData.rewardDays || "x"}
                  </span>{" "}
                  bonus days.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex justify-end gap-2 lg:col-span-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="h-9 rounded-md border border-slate-200 bg-white px-5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#6655df] px-5 text-[10px] font-semibold text-white transition hover:bg-[#5746d2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>✓ Create offer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
