import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import useOfferStore from "../zustand/Store/offerStore";

const EditOffer = () => {
  const navigate = useNavigate();
  const { offerId } = useParams();

  // =========================================================
  // ZUSTAND
  // =========================================================

  const getOfferById = useOfferStore((state) => state.getOfferById);

  const editOffer = useOfferStore((state) => state.editOffer);

  const getAllOfferTypes = useOfferStore((state) => state.getAllOfferTypes);

  const offerTypes = useOfferStore((state) => state.offerTypes);

  const updating = useOfferStore((state) => state.updating);

  const updateError = useOfferStore((state) => state.updateError);

  // =========================================================
  // EXISTING OFFER
  // =========================================================

  const [existingOffer, setExistingOffer] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    offerId: "",
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

  const [ruleData, setRuleData] = useState({});
  const [errors, setErrors] = useState({});

  // =========================================================
  // LOAD OFFER TYPES
  // =========================================================

  useEffect(() => {
    getAllOfferTypes({
      page: 1,
      limit: 100,
      search: "",
      status: "",
    }).catch((error) => {
      console.error("Failed to load offer types:", error);
    });
  }, [getAllOfferTypes]);

  // =========================================================
  // FETCH EXISTING OFFER
  // =========================================================

  useEffect(() => {
    if (!offerId) {
      navigate("/dashboard/offers", {
        replace: true,
      });
      return;
    }

    let isMounted = true;

    const fetchOffer = async () => {
      try {
        setFetching(true);
        setFetchError(null);

        console.log("Fetching offer:", offerId);

        const data = await getOfferById(offerId);

        if (!isMounted) return;

        console.log("Existing offer:", data?.offer);

        if (!data?.offer) {
          setFetchError("Offer not found.");
          return;
        }

        setExistingOffer(data.offer);
      } catch (error) {
        console.error("Failed to load offer:", error);

        if (!isMounted) return;

        setFetchError(
          error?.response?.data?.message || "Failed to load offer.",
        );
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    fetchOffer();

    return () => {
      isMounted = false;
    };
  }, [offerId, getOfferById, navigate]);

  // =========================================================
  // FORMAT DATETIME
  // =========================================================

  const formatDateTimeLocal = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

    const day = String(parsedDate.getDate()).padStart(2, "0");

    const hours = String(parsedDate.getHours()).padStart(2, "0");

    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =========================================================
  // INITIALIZE FORM
  // =========================================================

  useEffect(() => {
    if (!existingOffer) return;

    console.log("Initializing form:", existingOffer);

    setFormData({
      offerId: existingOffer.offerId || "",

      offerLabel: existingOffer.offerLabel || "",

      offerCode: existingOffer.offerCode || "",

      description: existingOffer.description || "",

      offerTypeId:
        existingOffer.offerTypeId || existingOffer.offerType?.offerTypeId || "",

      fromDate: formatDateTimeLocal(existingOffer.fromDate),

      toDate: formatDateTimeLocal(existingOffer.toDate),

      priority: existingOffer.priority ?? 1,

      isActive: existingOffer.isActive ?? true,

      maxUsage: existingOffer.maxUsage ?? "",

      perUserLimit: existingOffer.perUserLimit ?? "",
    });

    setRuleData(existingOffer.offerRule || {});
  }, [existingOffer]);

  // =========================================================
  // SELECTED OFFER TYPE
  // =========================================================

  const selectedOfferType = offerTypes.find(
    (type) => type.offerTypeId === formData.offerTypeId,
  );

  const ruleProperties = selectedOfferType?.offerRule?.properties || {};

  const requiredFields = selectedOfferType?.offerRule?.required || [];

  // =========================================================
  // HELPERS
  // =========================================================

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getInputType = (property) => {
    if (property.type === "number" || property.type === "integer") {
      return "number";
    }

    if (property.format === "date-time") {
      return "datetime-local";
    }

    return "text";
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "offerTypeId") {
      const selectedType = offerTypes.find(
        (type) => type.offerTypeId === value,
      );

      setFormData((prev) => ({
        ...prev,
        offerTypeId: value,
      }));

      if (selectedType?.offerRule?.properties) {
        const properties = selectedType.offerRule.properties;

        const newRuleData = {};

        Object.entries(properties).forEach(([key, property]) => {
          if (
            existingOffer?.offerRule &&
            existingOffer.offerRule[key] !== undefined
          ) {
            newRuleData[key] = existingOffer.offerRule[key];
          } else if (property.type === "array") {
            newRuleData[key] = [];
          } else {
            newRuleData[key] = "";
          }
        });

        setRuleData(newRuleData);
      } else {
        setRuleData({});
      }

      setErrors((prev) => ({
        ...prev,
        offerTypeId: "",
      }));

      return;
    }

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
  // RULE CHANGE
  // =========================================================

  const handleRuleChange = (key, value, property) => {
    let formattedValue = value;

    if (property?.type === "number" || property?.type === "integer") {
      formattedValue = value === "" ? "" : Number(value);
    }

    setRuleData((prev) => ({
      ...prev,
      [key]: formattedValue,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  // =========================================================
  // ARRAY CHANGE
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

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
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
  // VALIDATE RULE
  // =========================================================

  const validateRuleData = () => {
    if (!selectedOfferType?.offerRule) {
      return true;
    }

    const required = selectedOfferType.offerRule.required || [];

    const newErrors = {};

    required.forEach((field) => {
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
  // VALIDATE FORM
  // =========================================================

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

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    return validateRuleData();
  };

  // =========================================================
  // SUBMIT / EDIT API
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      offerId: formData.offerId,

      offerLabel: formData.offerLabel.trim(),

      offerCode: formData.offerCode.trim() || null,

      description: formData.description.trim() || null,

      offerTypeId: formData.offerTypeId,

      fromDate: formData.fromDate,

      toDate: formData.toDate,

      priority: Number(formData.priority) || 1,

      isActive: formData.isActive,

      maxUsage: formData.maxUsage !== "" ? Number(formData.maxUsage) : null,

      perUserLimit:
        formData.perUserLimit !== "" ? Number(formData.perUserLimit) : null,

      offerRule: {
        ...ruleData,
      },
    };

    console.log("EDIT OFFER PAYLOAD:", payload);

    try {
      await editOffer(payload);

      navigate("/dashboard/offers", {
        replace: true,
      });
    } catch (error) {
      console.error("Update offer failed:", error?.response?.data || error);
    }
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Loader2 size={14} className="animate-spin" />
          Loading offer...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-[11px] text-red-500">{fetchError}</p>

          <button
            type="button"
            onClick={() => navigate("/dashboard/offers")}
            className="mt-3 rounded-md bg-[#6655df] px-4 py-2 text-[10px] font-medium text-white"
          >
            Back to offers
          </button>
        </div>
      </div>
    );
  }

  if (!existingOffer) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[58px] max-w-[1400px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft size={15} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-50 text-cyan-600">
                  ✦
                </div>

                <h1 className="text-[15px] font-semibold text-slate-800">
                  Edit offer
                </h1>
              </div>

              <p className="ml-9 text-[9px] text-slate-500">
                Update your offer configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="mx-auto max-w-[1400px] px-5 py-5">
        {updateError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[10px] text-red-600">{updateError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]"
        >
          {/* =================================================
                        LEFT
                    ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[12px] font-semibold text-slate-700">
                Offer Basics
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                Update the basic information for your offer.
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

              {/* CODE */}

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
                  className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df] ${
                    errors.offerTypeId ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <option value="">Select offer type</option>

                  {offerTypes
                    .filter((type) => type.isActive)
                    .map((type) => (
                      <option key={type.offerTypeId} value={type.offerTypeId}>
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
                    className={`h-9 w-full rounded-md border bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-[#6655df] ${
                      errors.fromDate ? "border-red-400" : "border-slate-200"
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
                      errors.toDate ? "border-red-400" : "border-slate-200"
                    }`}
                  />

                  {errors.toDate && (
                    <p className="mt-1 text-[9px] text-red-500">
                      {errors.toDate}
                    </p>
                  )}
                </div>
              </div>

              {/* PRIORITY */}

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

              {/* MAX USAGE */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Maximum usage
                </label>

                <input
                  type="number"
                  min="1"
                  name="maxUsage"
                  value={formData.maxUsage}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
                />
              </div>

              {/* PER USER */}

              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Per user limit
                </label>

                <input
                  type="number"
                  min="1"
                  name="perUserLimit"
                  value={formData.perUserLimit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
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
                Update the conditions and rewards for this offer.
              </p>
            </div>

            <div className="p-5">
              {!selectedOfferType ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <p className="text-[11px] text-slate-500">
                    Loading offer type...
                  </p>
                </div>
              ) : (
                <>
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

                  <div className="space-y-5">
                    {Object.entries(ruleProperties).map(([key, property]) => {
                      const isRequired = requiredFields.includes(key);

                      const fieldError = errors[key];

                      // ARRAY

                      if (property.type === "array") {
                        return (
                          <div key={key}>
                            <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                              {formatLabel(key)}

                              {isRequired && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>

                            <textarea
                              value={
                                Array.isArray(ruleData[key])
                                  ? ruleData[key].join(", ")
                                  : ""
                              }
                              onChange={(e) =>
                                handleArrayChange(key, e.target.value)
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

                      // ENUM

                      if (property.enum && property.enum.length > 0) {
                        return (
                          <div key={key}>
                            <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                              {formatLabel(key)}

                              {isRequired && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>

                            <select
                              value={ruleData[key] ?? ""}
                              onChange={(e) =>
                                handleRuleChange(key, e.target.value, property)
                              }
                              className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#6655df] ${
                                fieldError
                                  ? "border-red-400"
                                  : "border-slate-200"
                              }`}
                            >
                              <option value="">
                                Select {formatLabel(key)}
                              </option>

                              {property.enum.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
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

                      // NORMAL INPUT

                      return (
                        <div key={key}>
                          <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                            {formatLabel(key)}

                            {isRequired && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </label>

                          <input
                            type={getInputType(property)}
                            min={
                              property.minimum !== undefined
                                ? property.minimum
                                : undefined
                            }
                            max={
                              property.maximum !== undefined
                                ? property.maximum
                                : undefined
                            }
                            value={ruleData[key] ?? ""}
                            onChange={(e) =>
                              handleRuleChange(key, e.target.value, property)
                            }
                            placeholder={`Enter ${formatLabel(key)}`}
                            className={`h-9 w-full rounded-md border bg-white px-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df] ${
                              fieldError ? "border-red-400" : "border-slate-200"
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
                    })}
                  </div>

                  {/* PREVIEW */}

                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      Rule Preview
                    </p>

                    <div className="mt-3 space-y-1.5">
                      {Object.entries(ruleData).map(([key, value]) => (
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
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-2 lg:col-span-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={updating}
              className="h-9 rounded-md border border-slate-200 bg-white px-5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="cursor-pointer flex h-9 items-center gap-1.5 rounded-md bg-[#6655df] px-5 text-[10px] font-semibold text-white transition hover:bg-[#5746d2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>✓ Update offer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOffer;
