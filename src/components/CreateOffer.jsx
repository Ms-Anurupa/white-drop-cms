import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useOfferStore from "../zustand/Store/offerStore";

const CreateOffer = () => {
  const navigate = useNavigate();

  // =========================================================
  // ZUSTAND
  // =========================================================

  const createOffer = useOfferStore((state) => state.createOffer);

  const getAllOfferTypes = useOfferStore(
    (state) => state.getAllOfferTypes
  );

  const offerTypes = useOfferStore((state) => state.offerTypes);

  const loading = useOfferStore((state) => state.creating);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    offerLabel: "",
    offerCode: "",
    description: "",
    offerTypeId: "",
    fromDate: "",
    toDate: "",
    priority: 1,
    isActive: true,
    maxUsage: "",
    perUserLimit: "",
  });

  // =========================================================
  // DYNAMIC RULE DATA
  // =========================================================

  const [ruleData, setRuleData] = useState({});

  const [errors, setErrors] = useState({});

  // =========================================================
  // LOAD OFFER TYPES
  // =========================================================

  useEffect(() => {
    getAllOfferTypes();
  }, [getAllOfferTypes]);

  // =========================================================
  // GET SELECTED OFFER TYPE
  // =========================================================

  const getSelectedOfferType = () => {
    return offerTypes.find(
      (type) => type.offerTypeId === formData.offerTypeId
    );
  };

  // =========================================================
  // FORMAT FIELD LABEL
  // =========================================================

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // =========================================================
  // GET INPUT TYPE
  // =========================================================

  const getInputType = (property) => {
    if (
      property.type === "number" ||
      property.type === "integer"
    ) {
      return "number";
    }

    if (property.format === "date-time") {
      return "datetime-local";
    }

    return "text";
  };

  // =========================================================
  // INITIALIZE RULE DATA
  // =========================================================

  const initializeRuleData = (offerType) => {
    if (!offerType?.offerRule?.properties) {
      setRuleData({});
      return;
    }

    const properties = offerType.offerRule.properties;

    const initialRuleData = {};

    Object.entries(properties).forEach(([key, property]) => {
      if (property.type === "array") {
        initialRuleData[key] = [];
      } else {
        initialRuleData[key] = "";
      }
    });

    setRuleData(initialRuleData);
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // =======================================================
    // OFFER TYPE CHANGE
    // =======================================================

    if (name === "offerTypeId") {
      const selectedOfferType = offerTypes.find(
        (type) => type.offerTypeId === value
      );

      setFormData((prev) => ({
        ...prev,
        offerTypeId: value,
      }));

      initializeRuleData(selectedOfferType);

      if (errors.offerTypeId) {
        setErrors((prev) => ({
          ...prev,
          offerTypeId: "",
        }));
      }

      return;
    }

    // =======================================================
    // NORMAL FORM FIELD
    // =======================================================

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

  // =========================================================
  // RULE FIELD CHANGE
  // =========================================================

  const handleRuleChange = (key, value, property) => {
    let formattedValue = value;

    // Convert numbers to number
    if (
      property?.type === "number" ||
      property?.type === "integer"
    ) {
      formattedValue = value === "" ? "" : Number(value);
    }

    setRuleData((prev) => ({
      ...prev,
      [key]: formattedValue,
    }));
  };

  // =========================================================
  // ARRAY RULE FIELD CHANGE
  // =========================================================

  const handleArrayChange = (key, value) => {
    const values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setRuleData((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  // =========================================================
  // VALIDATE RULE DATA
  // =========================================================

  const validateRuleData = () => {
    const selectedOfferType = getSelectedOfferType();

    if (!selectedOfferType?.offerRule) {
      return true;
    }

    const requiredFields =
      selectedOfferType.offerRule.required || [];

    const newErrors = {};

    requiredFields.forEach((field) => {
      const value = ruleData[field];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newErrors[field] = `${formatLabel(field)} is required`;
      }
    });

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    // -------------------------------------------------------
    // OFFER LABEL
    // -------------------------------------------------------

    if (!formData.offerLabel.trim()) {
      newErrors.offerLabel = "Offer title is required";
    }

    // -------------------------------------------------------
    // OFFER TYPE
    // -------------------------------------------------------

    if (!formData.offerTypeId) {
      newErrors.offerTypeId = "Offer type is required";
    }

    // -------------------------------------------------------
    // FROM DATE
    // -------------------------------------------------------

    if (!formData.fromDate) {
      newErrors.fromDate = "Start date is required";
    }

    // -------------------------------------------------------
    // TO DATE
    // -------------------------------------------------------

    if (!formData.toDate) {
      newErrors.toDate = "End date is required";
    }

    // -------------------------------------------------------
    // DATE COMPARISON
    // -------------------------------------------------------

    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.fromDate) >=
        new Date(formData.toDate)
    ) {
      newErrors.toDate =
        "Valid to must be after valid from";
    }

    setErrors(newErrors);

    // -------------------------------------------------------
    // RULE VALIDATION
    // -------------------------------------------------------

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    return validateRuleData();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // =======================================================
    // PREPARE RULE DATA
    // =======================================================

    const formattedRuleData = {
      ...ruleData,
    };

    // =======================================================
    // PAYLOAD
    // =======================================================

    const payload = {
      offerLabel: formData.offerLabel.trim(),

      offerCode:
        formData.offerCode.trim() || null,

      description:
        formData.description.trim() || null,

      offerTypeId:
        formData.offerTypeId,

      fromDate:
        formData.fromDate,

      toDate:
        formData.toDate,

      priority:
        Number(formData.priority) || 1,

      isActive:
        formData.isActive,

      maxUsage:
        formData.maxUsage
          ? Number(formData.maxUsage)
          : null,

      perUserLimit:
        formData.perUserLimit
          ? Number(formData.perUserLimit)
          : null,

      offerRule:
        formattedRuleData,
    };

    console.log("Create Offer Payload:", payload);

    try {
      await createOffer(payload);

      navigate("/dashboard/offers");
    } catch (error) {
      console.error(
        "Create offer failed:",
        error
      );
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =========================================================
  // SELECTED OFFER TYPE
  // =========================================================

  const selectedOfferType = getSelectedOfferType();

  const ruleProperties =
    selectedOfferType?.offerRule?.properties || {};

  const requiredFields =
    selectedOfferType?.offerRule?.required || [];

  // =========================================================
  // RENDER
  // =========================================================

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

              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="mb-4">

                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">

                  Title{" "}

                  <span className="text-red-500">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="offerLabel"
                  value={formData.offerLabel}
                  onChange={handleChange}
                  placeholder="e.g. Diwali Flash — 40% Off"
                  className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df] ${
                    errors.offerLabel
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />

                {errors.offerLabel && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {errors.offerLabel}
                  </p>
                )}

              </div>

              {/* =================================================
                  OFFER CODE
              ================================================= */}

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

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

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

              {/* =================================================
                  OFFER TYPE
              ================================================= */}

              <div className="mb-4">

                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">

                  Offer type{" "}

                  <span className="text-red-500">
                    *
                  </span>

                </label>

                <select
                  name="offerTypeId"
                  value={formData.offerTypeId}
                  onChange={handleChange}
                  className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df] ${
                    errors.offerTypeId
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                >

                  <option value="">
                    Select offer type
                  </option>

                  {offerTypes
                    .filter((type) => type.isActive)
                    .map((type) => (
                      <option
                        key={type.offerTypeId}
                        value={type.offerTypeId}
                      >
                        {type.name?.trim()}
                      </option>
                    ))}

                </select>

                {errors.offerTypeId && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {errors.offerTypeId}
                  </p>
                )}

              </div>

              {/* =================================================
                  DATES
              ================================================= */}

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
                    className={`h-9 w-full rounded-md border bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-[#6655df] ${
                      errors.fromDate
                        ? "border-red-400"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.fromDate && (
                    <p className="mt-1 text-[9px] text-red-500">
                      {errors.fromDate}
                    </p>
                  )}

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
                    className={`h-9 w-full rounded-md border bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-[#6655df] ${
                      errors.toDate
                        ? "border-red-400"
                        : "border-slate-200"
                    }`}
                  />

                  {errors.toDate && (
                    <p className="mt-1 text-[9px] text-red-500">
                      {errors.toDate}
                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  PRIORITY
              ================================================= */}

              {/* <div className="mb-4">

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

              </div> */}

              {/* =================================================
                  STATUS
              ================================================= */}

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

                    {formData.isActive
                      ? "Enabled"
                      : "Disabled"}

                  </span>

                  <span
                    className={`relative h-4 w-7 rounded-full ${
                      formData.isActive
                        ? "bg-emerald-400"
                        : "bg-slate-300"
                    }`}
                  >

                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition ${
                        formData.isActive
                          ? "left-3.5"
                          : "left-0.5"
                      }`}
                    />

                  </span>

                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT — DYNAMIC RULE COMPOSER
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

              {/* =================================================
                  NO OFFER TYPE
              ================================================= */}

              {!selectedOfferType ? (

                <div className="flex min-h-[250px] items-center justify-center">

                  <div className="text-center">

                    <p className="text-[11px] font-medium text-slate-500">
                      Select an offer type
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      The rule fields will appear here automatically.
                    </p>

                  </div>

                </div>

              ) : (

                <>

                  {/* =================================================
                      OFFER TYPE INFORMATION
                  ================================================= */}

                  <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3">

                    <p className="text-[10px] font-semibold text-slate-700">
                      {selectedOfferType.name?.trim()}
                    </p>

                    {selectedOfferType.description && (
                      <p className="mt-1 text-[9px] leading-4 text-slate-400">
                        {selectedOfferType.description}
                      </p>
                    )}

                  </div>

                  {/* =================================================
                      DYNAMIC FIELDS
                  ================================================= */}

                  <div className="space-y-5">

                    {Object.entries(ruleProperties).map(
                      ([key, property]) => {

                        const isRequired =
                          requiredFields.includes(key);

                        const fieldError =
                          errors[key];

                        // =================================================
                        // ARRAY
                        // =================================================

                        if (property.type === "array") {

                          return (
                            <div key={key}>

                              <label className="mb-1.5 block text-[10px] font-medium text-slate-600">

                                {formatLabel(key)}

                                {isRequired && (
                                  <span className="ml-1 text-red-500">
                                    *
                                  </span>
                                )}

                              </label>

                              <textarea
                                value={
                                  Array.isArray(
                                    ruleData[key]
                                  )
                                    ? ruleData[key].join(", ")
                                    : ""
                                }
                                onChange={(e) =>
                                  handleArrayChange(
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter IDs separated by commas"
                                rows={3}
                                className={`w-full resize-none rounded-md border bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df] ${
                                  fieldError
                                    ? "border-red-400"
                                    : "border-slate-200"
                                }`}
                              />

                              {property.description && (
                                <p className="mt-1 text-[9px] text-slate-400">
                                  {property.description}
                                </p>
                              )}

                              {fieldError && (
                                <p className="mt-1 text-[9px] text-red-500">
                                  {fieldError}
                                </p>
                              )}

                            </div>
                          );
                        }

                        // =================================================
                        // ENUM
                        // =================================================

                        if (
                          property.enum &&
                          property.enum.length > 0
                        ) {

                          return (
                            <div key={key}>

                              <label className="mb-1.5 block text-[10px] font-medium text-slate-600">

                                {formatLabel(key)}

                                {isRequired && (
                                  <span className="ml-1 text-red-500">
                                    *
                                  </span>
                                )}

                              </label>

                              <select
                                value={
                                  ruleData[key] ?? ""
                                }
                                onChange={(e) =>
                                  handleRuleChange(
                                    key,
                                    e.target.value,
                                    property
                                  )
                                }
                                className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df] ${
                                  fieldError
                                    ? "border-red-400"
                                    : "border-slate-200"
                                }`}
                              >

                                <option value="">
                                  Select{" "}
                                  {formatLabel(key)}
                                </option>

                                {property.enum.map(
                                  (option) => (
                                    <option
                                      key={option}
                                      value={option}
                                    >
                                      {option}
                                    </option>
                                  )
                                )}

                              </select>

                              {property.description && (
                                <p className="mt-1 text-[9px] text-slate-400">
                                  {property.description}
                                </p>
                              )}

                              {fieldError && (
                                <p className="mt-1 text-[9px] text-red-500">
                                  {fieldError}
                                </p>
                              )}

                            </div>
                          );
                        }

                        // =================================================
                        // NORMAL INPUT
                        // =================================================

                        return (
                          <div key={key}>

                            <label className="mb-1.5 block text-[10px] font-medium text-slate-600">

                              {formatLabel(key)}

                              {isRequired && (
                                <span className="ml-1 text-red-500">
                                  *
                                </span>
                              )}

                            </label>

                            <input
                              type={getInputType(
                                property
                              )}
                              min={
                                property.minimum !==
                                undefined
                                  ? property.minimum
                                  : undefined
                              }
                              max={
                                property.maximum !==
                                undefined
                                  ? property.maximum
                                  : undefined
                              }
                              value={
                                ruleData[key] ?? ""
                              }
                              onChange={(e) =>
                                handleRuleChange(
                                  key,
                                  e.target.value,
                                  property
                                )
                              }
                              placeholder={`Enter ${formatLabel(
                                key
                              )}`}
                              className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df] ${
                                fieldError
                                  ? "border-red-400"
                                  : "border-slate-200"
                              }`}
                            />

                            {property.description && (
                              <p className="mt-1 text-[9px] text-slate-400">
                                {property.description}
                              </p>
                            )}

                            {fieldError && (
                              <p className="mt-1 text-[9px] text-red-500">
                                {fieldError}
                              </p>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* =================================================
                      RULE PREVIEW
                  ================================================= */}

                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">

                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      Rule Preview
                    </p>

                    <div className="mt-3 space-y-1.5">

                      {Object.entries(ruleData).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="flex items-start justify-between gap-4 text-[10px]"
                          >

                            <span className="text-slate-500">
                              {formatLabel(key)}
                            </span>

                            <span className="text-right font-semibold text-slate-700">

                              {Array.isArray(value)
                                ? value.join(", ") || "-"
                                : value !== ""
                                  ? String(value)
                                  : "-"}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </>

              )}

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