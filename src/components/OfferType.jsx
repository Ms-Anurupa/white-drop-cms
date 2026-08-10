import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  X,
  Power,
  PowerOff,
  Tag,
  AlertCircle,
  Loader2,
  ChevronDown,
  ListTree,
} from "lucide-react";

import useOfferStore from "../zustand/Store/offerStore";

/* ============================================================================
   Design tokens — Clean Light Console Theme
============================================================================ */

const THEME_VARS = {
  "--bg": "#F8FAFC",
  "--panel": "#FFFFFF",
  "--panel-2": "#F1F5F9",
  "--line": "#E2E8F0",
  "--text": "#0F172A",
  "--muted": "#475569",
  "--muted-2": "#64748B",
  "--primary": "#6366F1",
  "--primary-soft": "rgba(99, 102, 241, 0.12)",
  "--danger": "#EF4444",
  "--success": "#10B981",
};

const SCOPED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  #offer-type-root {
    font-family: 'Inter', system-ui, sans-serif;
  }

  #offer-type-root .disp {
    font-family: 'Space Grotesk', sans-serif;
  }

  #offer-type-root .mono {
    font-family: 'JetBrains Mono', monospace;
  }

  #offer-type-root .scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E1 transparent;
  }

  #offer-type-root .scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  #offer-type-root .scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  #offer-type-root .scrollbar::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 8px;
  }

  #offer-type-root button {
    font-family: inherit;
    cursor: pointer;
  }

  #offer-type-root input,
  #offer-type-root select {
    font-family: inherit;
  }

  #offer-type-root .fadein {
    animation: otFade 0.22s ease both;
  }

  @keyframes otFade {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  #offer-type-root input:focus,
  #offer-type-root select:focus {
    outline: none;
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 3px var(--primary-soft);
  }
`;

/* ============================================================================
   Accent palette
============================================================================ */

const ACCENT_PALETTE = [
  "#0284C7",
  "#D97706",
  "#7C3AED",
  "#059669",
  "#65A30D",
  "#2563EB",
  "#DB2777",
  "#EA580C",
  "#0D9488",
];

function accentFor(name = "") {
  let h = 0;

  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }

  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/* ============================================================================
   Scoped styles
============================================================================ */

function useScopedStyles() {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = SCOPED_CSS;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

/* ============================================================================
   Icon Badge
============================================================================ */

function IconBadge({ Icon, color, size = 15 }) {
  return (
    <span
      style={{
        width: size + 14,
        height: size + 14,
        background: `${color}1A`,
        color,
      }}
      className="inline-flex items-center justify-center rounded-lg shrink-0"
    >
      <Icon size={size} />
    </span>
  );
}

/* ============================================================================
   Confirm Dialog
============================================================================ */

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="fadein w-[380px] rounded-2xl p-5 shadow-xl"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="flex items-start gap-3">
          <IconBadge
            Icon={AlertCircle}
            color={danger ? "#EF4444" : "#6366F1"}
          />

          <div className="min-w-0">
            <div
              className="disp font-semibold text-[15px]"
              style={{ color: "var(--text)" }}
            >
              {title}
            </div>

            <div
              className="text-sm mt-1 leading-5"
              style={{ color: "var(--muted)" }}
            >
              {body}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg text-sm font-medium"
            style={{
              color: "var(--muted)",
              background: "var(--panel-2)",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-2 rounded-lg text-sm font-medium"
            style={{
              background: danger ? "var(--danger)" : "var(--primary)",
              color: "#fff",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   Property Configuration
============================================================================ */

const PROPERTY_TYPES = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
];

const createEmptyProperty = () => ({
  key: "",
  type: "string",
  description: "",
  minimum: "",
  maximum: "",
  enum: [],
});

/* ============================================================================
   Offer Type Component
============================================================================ */

const OfferType = () => {
  // =========================================================
  // ZUSTAND
  // =========================================================

  const getAllOfferTypes = useOfferStore(
    (state) => state.getAllOfferTypes
  );

  const createOfferType = useOfferStore(
    (state) => state.createOfferType
  );

  const updateOfferType = useOfferStore(
    (state) => state.updateOfferType
  );

  const offerTypes = useOfferStore(
    (state) => state.offerTypes
  );

  const loading = useOfferStore(
    (state) => state.loading
  );

  const error = useOfferStore(
    (state) => state.error
  );

  useScopedStyles();

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [showCreate, setShowCreate] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    properties: [],
    required: [],
  });

  const [property, setProperty] = useState(
    createEmptyProperty()
  );

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);

  const [confirmDeactivate, setConfirmDeactivate] =
    useState(null);

  // =========================================================
  // FETCH OFFER TYPES
  // =========================================================

  useEffect(() => {
    getAllOfferTypes();
  }, [getAllOfferTypes]);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
  };

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;

    setProperty((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
  };

  const handleEnumChange = (e) => {
    const values = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setProperty((prev) => ({
      ...prev,
      enum: values,
    }));
  };

  // =========================================================
  // ADD PROPERTY
  // =========================================================

  const handleAddProperty = () => {
    const key = property.key.trim();

    if (!key) {
      setFormError("Property key is required.");
      return;
    }

    const exists = formData.properties.some(
      (item) =>
        item.key.toLowerCase() === key.toLowerCase()
    );

    if (exists) {
      setFormError("Property key already exists.");
      return;
    }

    const newProperty = {
      key,
      type: property.type,
    };

    if (property.description.trim()) {
      newProperty.description =
        property.description.trim();
    }

    if (
      property.type === "number" ||
      property.type === "integer"
    ) {
      if (property.minimum !== "") {
        newProperty.minimum = Number(
          property.minimum
        );
      }

      if (property.maximum !== "") {
        newProperty.maximum = Number(
          property.maximum
        );
      }
    }

    if (property.enum.length > 0) {
      newProperty.enum = property.enum;
    }

    setFormData((prev) => ({
      ...prev,
      properties: [
        ...prev.properties,
        newProperty,
      ],
    }));

    setProperty(createEmptyProperty());
    setFormError("");
  };

  // =========================================================
  // REMOVE PROPERTY
  // =========================================================

  const handleRemoveProperty = (key) => {
    setFormData((prev) => ({
      ...prev,
      properties: prev.properties.filter(
        (item) => item.key !== key
      ),
      required: prev.required.filter(
        (item) => item !== key
      ),
    }));
  };

  // =========================================================
  // REQUIRED TOGGLE
  // =========================================================

  const handleRequiredToggle = (key) => {
    setFormData((prev) => {
      const exists = prev.required.includes(key);

      return {
        ...prev,
        required: exists
          ? prev.required.filter(
              (item) => item !== key
            )
          : [...prev.required, key],
      };
    });
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      properties: [],
      required: [],
    });

    setProperty(createEmptyProperty());

    setFormError("");
  };

  // =========================================================
  // CREATE OFFER TYPE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Offer type name is required.");
      return;
    }

    if (formData.properties.length === 0) {
      setFormError(
        "Add at least one rule property."
      );
      return;
    }

    const properties =
      formData.properties.reduce(
        (acc, item) => {
          const { key, ...definition } = item;

          acc[key] = definition;

          return acc;
        },
        {}
      );

    const payload = {
      name: formData.name.trim(),

      description:
        formData.description.trim() || null,

      offerRule: {
        properties,
        required: formData.required,
      },
    };

    try {
      setSaving(true);
      setFormError("");

      await createOfferType(payload);

      await getAllOfferTypes();

      resetForm();

      setShowCreate(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          "Failed to create offer type."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = async (offerType) => {
    const nextStatus = !offerType.isActive;

    try {
      await updateOfferType(
        offerType.offerTypeId,
        {
          isActive: nextStatus,
        }
      );

      await getAllOfferTypes();
    } catch (err) {
      console.error(
        "Failed to update offer type status:",
        err
      );
    }
  };

  // =========================================================
  // SOFT DELETE / DEACTIVATE
  // =========================================================

  const handleSoftDelete = (offerType) => {
    if (!offerType.isActive) return;

    setConfirmDeactivate(offerType);
  };

  const confirmSoftDelete = async () => {
    const offerType = confirmDeactivate;

    setConfirmDeactivate(null);

    if (!offerType) return;

    try {
      await updateOfferType(
        offerType.offerTypeId,
        {
          isActive: false,
        }
      );

      await getAllOfferTypes();
    } catch (err) {
      console.error(
        "Failed to deactivate offer type:",
        err
      );
    }
  };

  // =========================================================
  // STYLES
  // =========================================================

  const inputStyle = {
    background: "var(--panel)",
    border: "1px solid var(--line)",
    color: "var(--text)",
  };

  const label =
    "mb-1.5 block text-[11px] font-medium";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      id="offer-type-root"
      style={{
        ...THEME_VARS,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="sticky top-0 z-10"
        style={{
          borderBottom: "1px solid var(--line)",
          background: "var(--panel)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="disp text-[17px] font-semibold">
              Offer Types
            </h1>

            <p
              className="mt-1 text-[12px]"
              style={{ color: "var(--muted)" }}
            >
              Configure offer types and their dynamic
              rule schemas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreate(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "#fff",
            }}
          >
            <Plus size={16} />
            Create offer type
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {/* ERROR */}
        {error && (
          <div
            className="mb-5 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px]"
            style={{
              background:
                "rgba(239,68,68,0.08)",
              border:
                "1px solid rgba(239,68,68,0.2)",
              color: "var(--danger)",
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div
            className="flex min-h-[300px] items-center justify-center text-sm font-medium"
            style={{
              color: "var(--muted)",
            }}
          >
            <Loader2
              className="animate-spin mr-2"
              size={18}
            />

            Loading offer types…
          </div>
        ) : offerTypes.length === 0 ? (
          /* EMPTY STATE */
          <div
            className="rounded-xl p-12 text-center"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="disp text-sm font-semibold mb-1">
              No offer types found
            </div>

            <p
              className="text-[12px]"
              style={{
                color: "var(--muted)",
              }}
            >
              Create your first offer type to define
              a rule schema.
            </p>
          </div>
        ) : (
          /* OFFER TYPE CARDS */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offerTypes.map((item) => {
              const properties =
                item.offerRule?.properties || {};

              const required =
                item.offerRule?.required || [];

              const isActive =
                item.isActive !== false;

              const accent = accentFor(
                item.name?.trim() || "?"
              );

              return (
                <div
                  key={item.offerTypeId}
                  className="rounded-xl shadow-sm"
                  style={{
                    background:
                      "var(--panel)",
                    border:
                      "1px solid var(--line)",
                    opacity: isActive
                      ? 1
                      : 0.65,
                  }}
                >
                  {/* =================================================
                      CARD HEADER
                  ================================================== */}

                  <div
                    className="flex items-start justify-between gap-2 p-4"
                    style={{
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <IconBadge
                        Icon={Tag}
                        color={accent}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="truncate text-[13px] font-semibold">
                            {item.name?.trim()}
                          </h2>

                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background:
                                isActive
                                  ? "rgba(16,185,129,0.12)"
                                  : "var(--panel-2)",

                              color:
                                isActive
                                  ? "var(--success)"
                                  : "var(--muted-2)",
                            }}
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        {item.description && (
                          <p
                            className="mt-1 text-[11px] leading-4"
                            style={{
                              color:
                                "var(--muted)",
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        TOP ACTIONS
                        Delete -> Activate / Deactivate
                    ================================================== */}

                    <div className="flex shrink-0 items-center gap-1">
                      {/* DELETE / DEACTIVATE */}
                      {isActive && (
                        <button
                          type="button"
                          title="Deactivate offer type"
                          onClick={() =>
                            handleSoftDelete(
                              item
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100"
                          style={{
                            color:
                              "var(--muted-2)",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {/* ACTIVATE / DEACTIVATE */}
                      <button
                        type="button"
                        title={
                          isActive
                            ? "Deactivate"
                            : "Activate"
                        }
                        onClick={() =>
                          handleToggleStatus(
                            item
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100"
                        style={{
                          color: isActive
                            ? "var(--success)"
                            : "var(--muted-2)",
                        }}
                      >
                        {isActive ? (
                          <Power size={14} />
                        ) : (
                          <PowerOff size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      PROPERTIES
                  ================================================== */}

                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1.5"
                        style={{
                          color:
                            "var(--muted-2)",
                        }}
                      >
                        <ListTree size={11} />

                        Rule properties
                      </p>

                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          background:
                            "var(--panel-2)",
                          color:
                            "var(--muted)",
                        }}
                      >
                        {
                          Object.keys(
                            properties
                          ).length
                        }
                      </span>
                    </div>

                    {Object.keys(properties)
                      .length === 0 ? (
                      <div
                        className="rounded-lg p-4 text-center"
                        style={{
                          border:
                            "1px dashed var(--line)",
                        }}
                      >
                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              "var(--muted-2)",
                          }}
                        >
                          No rule properties
                          configured.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(
                          properties
                        ).map(
                          ([key, definition]) => (
                            <div
                              key={key}
                              className="mono rounded-lg p-2.5"
                              style={{
                                background:
                                  "var(--panel-2)",
                                border:
                                  "1px solid var(--line)",
                              }}
                            >
                              {/* PROPERTY KEY ONLY */}
                              <div>
                                <span
                                  className="text-[11px] font-medium"
                                  style={{
                                    color:
                                      "var(--text)",
                                  }}
                                >
                                  {key}
                                </span>
                              </div>

                              {/* DESCRIPTION */}
                              {definition.description && (
                                <p
                                  className="mt-1 text-[10px] leading-4"
                                  style={{
                                    color:
                                      "var(--muted-2)",
                                    fontFamily:
                                      "'Inter', sans-serif",
                                  }}
                                >
                                  {
                                    definition.description
                                  }
                                </p>
                              )}

                              {/* ENUM OPTIONS */}
                              {definition.enum
                                ?.length > 0 && (
                                <p
                                  className="mt-1 text-[10px]"
                                  style={{
                                    color:
                                      "var(--muted-2)",
                                  }}
                                >
                                  Options:{" "}
                                  {definition.enum.join(
                                    ", "
                                  )}
                                </p>
                              )}

                              {/* REQUIRED */}
                              {required.includes(
                                key
                              ) && (
                                <span
                                  className="mt-1 inline-block text-[9px] font-semibold uppercase tracking-wider"
                                  style={{
                                    color:
                                      "var(--danger)",
                                    fontFamily:
                                      "'Inter', sans-serif",
                                  }}
                                >
                                  Required
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* =================================================
                      CARD FOOTER
                      Only required count
                  ================================================== */}

                  <div
                    className="px-4 py-3"
                    style={{
                      borderTop:
                        "1px solid var(--line)",
                    }}
                  >
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          "var(--muted-2)",
                      }}
                    >
                      {required.length} required
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE MODAL
      ====================================================== */}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background:
              "rgba(15,23,42,0.4)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="fadein scrollbar max-h-[90vh] w-full max-w-[820px] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              background: "var(--panel)",
              border:
                "1px solid var(--line)",
            }}
          >
            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{
                background:
                  "var(--panel)",
                borderBottom:
                  "1px solid var(--line)",
              }}
            >
              <div>
                <h2 className="disp text-[15px] font-semibold">
                  Create Offer Type
                </h2>

                <p
                  className="mt-1 text-[11px]"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  Define the dynamic fields
                  shown in the Rule Composer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* =================================================
                CREATE FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {/* =================================================
                  BASIC INFORMATION
              ================================================== */}

              <div className="mb-6">
                <h3
                  className="mb-3 text-[11px] font-semibold tracking-wide uppercase"
                  style={{
                    color:
                      "var(--muted-2)",
                  }}
                >
                  BASIC INFORMATION
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label
                      className={label}
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      Name{" "}
                      <span
                        style={{
                          color:
                            "var(--danger)",
                        }}
                      >
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Buy X Get Y"
                      className="h-10 w-full rounded-lg px-3 text-[13px]"
                      style={inputStyle}
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label
                      className={label}
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      Description
                    </label>

                    <input
                      type="text"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      placeholder="Describe this offer type"
                      className="h-10 w-full rounded-lg px-3 text-[13px]"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  PROPERTY BUILDER
              ================================================== */}

              <div>
                <div className="mb-3">
                  <h3
                    className="text-[11px] font-semibold tracking-wide uppercase"
                    style={{
                      color:
                        "var(--muted-2)",
                    }}
                  >
                    RULE PROPERTIES
                  </h3>

                  <p
                    className="mt-1 text-[11px]"
                    style={{
                      color:
                        "var(--muted)",
                    }}
                  >
                    These fields will automatically
                    appear in the Rule Composer.
                  </p>
                </div>

                {/* =================================================
                    PROPERTY INPUT
                ================================================== */}

                <div
                  className="rounded-xl p-4"
                  style={{
                    background:
                      "var(--panel-2)",
                    border:
                      "1px solid var(--line)",
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* PROPERTY KEY */}
                    <div>
                      <label
                        className={label}
                        style={{
                          color:
                            "var(--muted)",
                        }}
                      >
                        Property key
                      </label>

                      <input
                        type="text"
                        name="key"
                        value={property.key}
                        onChange={
                          handlePropertyChange
                        }
                        placeholder="e.g. paidDays"
                        className="h-9 w-full rounded-lg px-3 text-[12px]"
                        style={inputStyle}
                      />
                    </div>

                    {/* TYPE
                        Kept here because this is where
                        the admin configures the schema.
                    */}
                    <div>
                      <label
                        className={label}
                        style={{
                          color:
                            "var(--muted)",
                        }}
                      >
                        Type
                      </label>

                      <div className="relative">
                        <select
                          name="type"
                          value={
                            property.type
                          }
                          onChange={
                            handlePropertyChange
                          }
                          className="h-9 w-full appearance-none rounded-lg px-3 text-[12px]"
                          style={
                            inputStyle
                          }
                        >
                          {PROPERTY_TYPES.map(
                            (type) => (
                              <option
                                key={type}
                                value={type}
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            color:
                              "var(--muted)",
                          }}
                        />
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="md:col-span-2">
                      <label
                        className={label}
                        style={{
                          color:
                            "var(--muted)",
                        }}
                      >
                        Description
                      </label>

                      <input
                        type="text"
                        name="description"
                        value={
                          property.description
                        }
                        onChange={
                          handlePropertyChange
                        }
                        placeholder="e.g. Days the user pays for"
                        className="h-9 w-full rounded-lg px-3 text-[12px]"
                        style={inputStyle}
                      />
                    </div>

                    {/* MINIMUM / MAXIMUM */}
                    {(property.type ===
                      "number" ||
                      property.type ===
                        "integer") && (
                      <>
                        <div>
                          <label
                            className={
                              label
                            }
                            style={{
                              color:
                                "var(--muted)",
                            }}
                          >
                            Minimum
                          </label>

                          <input
                            type="number"
                            name="minimum"
                            value={
                              property.minimum
                            }
                            onChange={
                              handlePropertyChange
                            }
                            placeholder="Optional"
                            className="h-9 w-full rounded-lg px-3 text-[12px]"
                            style={
                              inputStyle
                            }
                          />
                        </div>

                        <div>
                          <label
                            className={
                              label
                            }
                            style={{
                              color:
                                "var(--muted)",
                            }}
                          >
                            Maximum
                          </label>

                          <input
                            type="number"
                            name="maximum"
                            value={
                              property.maximum
                            }
                            onChange={
                              handlePropertyChange
                            }
                            placeholder="Optional"
                            className="h-9 w-full rounded-lg px-3 text-[12px]"
                            style={
                              inputStyle
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* ENUM */}
                    <div className="md:col-span-2">
                      <label
                        className={label}
                        style={{
                          color:
                            "var(--muted)",
                        }}
                      >
                        Enum Values
                        <span className="ml-1 text-[10px] font-normal">
                          (comma separated)
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          property.enum.join(
                            ", "
                          )
                        }
                        onChange={
                          handleEnumChange
                        }
                        placeholder="e.g. option1, option2"
                        className="h-9 w-full rounded-lg px-3 text-[12px]"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* ADD PROPERTY */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        handleAddProperty
                      }
                      className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium"
                      style={{
                        background:
                          "var(--panel)",
                        border:
                          "1px solid var(--line)",
                        color:
                          "var(--text)",
                      }}
                    >
                      <Plus size={13} />

                      Add Property
                    </button>
                  </div>
                </div>

                {/* =================================================
                    ADDED PROPERTIES
                ================================================== */}

                {formData.properties.length >
                  0 && (
                  <div className="mt-4 space-y-2">
                    <label
                      className={label}
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      Configured Properties (
                      {
                        formData
                          .properties
                          .length
                      }
                      )
                    </label>

                    {formData.properties.map(
                      (item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-lg p-3"
                          style={{
                            background:
                              "var(--panel)",
                            border:
                              "1px solid var(--line)",
                          }}
                        >
                          {/* PROPERTY KEY
                              Type is intentionally
                              not displayed.
                          */}
                          <div className="flex items-center gap-3">
                            <span className="mono text-[12px] font-medium">
                              {item.key}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* REQUIRED */}
                            <label className="flex items-center gap-1.5 text-[12px]">
                              <input
                                type="checkbox"
                                checked={formData.required.includes(
                                  item.key
                                )}
                                onChange={() =>
                                  handleRequiredToggle(
                                    item.key
                                  )
                                }
                                className="rounded border-slate-300"
                              />

                              Required
                            </label>

                            {/* REMOVE PROPERTY */}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveProperty(
                                  item.key
                                )
                              }
                              className="text-slate-400 hover:text-red-500"
                              title="Remove property"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  FORM ERROR
              ================================================== */}

              {formError && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{
                    background:
                      "rgba(239,68,68,0.08)",
                    border:
                      "1px solid rgba(239,68,68,0.2)",
                    color:
                      "var(--danger)",
                  }}
                >
                  <AlertCircle size={14} />

                  {formError}
                </div>
              )}

              {/* =================================================
                  MODAL FOOTER
              ================================================== */}

              <div
                className="mt-6 flex items-center justify-end gap-2 pt-4"
                style={{
                  borderTop:
                    "1px solid var(--line)",
                }}
              >
                {/* CANCEL */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  Cancel
                </button>

                {/* SAVE */}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white shadow-sm disabled:opacity-60"
                  style={{
                    background:
                      "var(--primary)",
                  }}
                >
                  {saving && (
                    <Loader2
                      className="animate-spin"
                      size={13}
                    />
                  )}

                  Save Offer Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM DEACTIVATE DIALOG
      ====================================================== */}

      <ConfirmDialog
        open={Boolean(
          confirmDeactivate
        )}
        title="Deactivate Offer Type"
        body={`Are you sure you want to deactivate "${confirmDeactivate?.name}"?`}
        confirmLabel="Deactivate"
        danger
        onConfirm={
          confirmSoftDelete
        }
        onCancel={() =>
          setConfirmDeactivate(null)
        }
      />
    </div>
  );
};

export default OfferType;

