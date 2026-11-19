import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productDataStore from "../zustand/Store/productDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "./ConfirmProvider";
import { resolveFirebaseUrl } from "../utils/resolveUrl";
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from "lucide-react";

/* ---------- UI-only helpers (no business logic) ---------- */

const inputClass =
  "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition hover:border-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/15";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const Card = ({ title, subtitle, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const Field = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    {children}
  </div>
);

const EditProduct = () => {
  const navigate = useNavigate();
  const { product_id } = useParams();
  const { confirm } = useConfirm();

  const getProductById = productDataStore((state) => state.getProductById);
  const editProductById = productDataStore((state) => state.editProductById);
  const ProductUnit = productDataStore((state) => state.ProductUnit);
  const getProductUnit = productDataStore((state) => state.getProductUnit);
  const deleteProductVariantById = productDataStore(
    (state) => state.deleteProductVariantById,
  );

  const [productList, setProductList] = useState({
    product_name: "",
    product_description: "",
    catch_phrase: "",
    images: [],
    variants: [],
  });

  // Fetch units
  useEffect(() => {
    getProductUnit().catch(() => {
      toast.error("Failed to get product units");
    });
  }, []);

  // Fetch product and prefill
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        await getProductById(product_id);
        const store = productDataStore.getState().ProductData;

        setProductList({
          product_name: store.product?.product_name || "",
          product_description: store.product?.product_description || "",
          catch_phrase: store.product?.catch_phrase || "",
          images: store.product?.product_images || [],
          variants: Array.isArray(store.product?.variants)
            ? store.product.variants.map((v) => ({
                product_item_id: v.product_item_id,
                variant_name: v.variant_name || "",
                quantity: v.quantity || "",
                unit: v.unit || "",
                package: v.package || "",
                price: v.price ?? "",
                stock_quantity: v.stock_quantity ?? "",
                availability: v.availability ?? true,
                sku: v.sku || "",
              }))
            : [],
        });
      } catch {
        toast.error("Failed to fetch product");
      }
    };
    fetchProduct();
  }, [product_id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductList((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductList((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    setProductList((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [name]:
                name === "price" || name === "stock_quantity"
                  ? Number(value)
                  : name === "availability"
                    ? value === "true"
                    : value,
            }
          : variant,
      ),
    }));
  };

  const addVariant = () => {
    setProductList((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          quantity: "",
          unit: "",
          variant_name: "",
          package: "",
          price: "",
          stock_quantity: "",
          availability: true,
          sku: "",
        },
      ],
    }));
  };

  const removeVariant = async (index) => {
    const variant = productList.variants[index];

    try {
      // Existing variant
      if (variant?.product_item_id) {
        const confirmMessage = await confirm({
          title: "Delete Product Variant",
          message:
            "This will permanently delete the product variant. Continue?",
        });

        if (!confirmMessage) return;

        await deleteProductVariantById({
          variantId: variant.product_item_id,
        });

        toast.success("Variant deleted successfully");
      }

      // Remove from local state
      setProductList((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete variant");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const confirmMessage = await confirm({
        title: "Update Product",
        message: "Save changes to this product?",
      });

      if (!confirmMessage) return;

      const formData = new FormData();

      const payload = {
        productId: product_id,

        product_name: productList.product_name,
        product_description: productList.product_description,
        catch_phrase: productList.catch_phrase,

        existingImages: productList.images.filter(
          (img) => typeof img === "string",
        ),

        variants: productList.variants,
      };

      formData.append("productData", JSON.stringify(payload));

      productList.images.forEach((file) => {
        if (file instanceof File) {
          formData.append("productImages", file);
        }
      });

      await editProductById(formData);

      toast.success("Product updated successfully");
      navigate("/dashboard/product");
    } catch (err) {
      console.error(err);
      toast.error("Product update failed");
    }
  };

  /* ---------- Render ---------- */

  const addImageTile = (large) => (
    <label
      className={`group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-indigo-500 hover:bg-indigo-50/60 hover:text-indigo-700 focus-within:ring-4 focus-within:ring-indigo-600/15 ${
        large ? "col-span-full h-44" : "aspect-square"
      }`}
    >
      <ImagePlus size={large ? 28 : 22} strokeWidth={1.5} />
      <span className="text-sm font-medium">
        {large ? "Upload product images" : "Add"}
      </span>
      {large && (
        <span className="text-xs text-slate-400 group-hover:text-indigo-500">
          PNG, JPG or WEBP · select multiple at once
        </span>
      )}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="sr-only"
      />
    </label>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-slate-50">
      {/* PAGE HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/product")}
              aria-label="Back to products"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/20"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Products / Edit</p>
              <h1 className="truncate text-lg font-semibold leading-tight text-slate-900">
                {productList.product_name || "Edit product"}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/product")}
              className="h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateProduct}
              className="h-9 cursor-pointer rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30"
            >
              Save changes
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {/* 1. IMAGES (top) */}
        <Card
          title="Product images"
          subtitle={
            productList.images.length > 0
              ? `${productList.images.length} ${
                  productList.images.length === 1 ? "image" : "images"
                } · the first image is the main one`
              : "Add photos so customers can see the product"
          }
        >
          {productList.images.length === 0 ? (
            <div className="grid grid-cols-1">{addImageTile(true)}</div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {productList.images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square w-full min-w-[100px] max-w-[160px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <img
                    src={
                      typeof img === "string"
                        ? resolveFirebaseUrl({
                            folderName: "productImages",
                            fileName: img,
                          })
                        : URL.createObjectURL(img)
                    }
                    className="h-full w-full object-contain p-2"
                    alt={`product-${idx}`}
                  />

                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
                      Main
                    </span>
                  )}

                  {typeof img !== "string" && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                      New
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label={`Remove image ${idx + 1}`}
                    onClick={() =>
                      setProductList((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                      }))
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 opacity-100 shadow ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}

              {/* Add Image Tile */}
              <label className="flex aspect-square w-full min-w-[100px] max-w-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600">
                <ImagePlus size={22} />
                <span className="mt-1 text-xs font-medium">Add Image</span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </Card>

        {/* 2. BASIC INFORMATION */}
        <Card
          title="Basic information"
          subtitle="This is what customers see on the product page"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field id="product_name" label="Product name">
              <input
                id="product_name"
                name="product_name"
                value={productList.product_name}
                onChange={handleChange}
                placeholder="e.g. Cow Milk"
                className={inputClass}
              />
            </Field>

            <Field id="catch_phrase" label="Catch phrase">
              <input
                id="catch_phrase"
                name="catch_phrase"
                value={productList.catch_phrase}
                onChange={handleChange}
                placeholder="e.g. Pure Fresh Milk Every Day"
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field id="product_description" label="Description">
                <textarea
                  id="product_description"
                  rows={4}
                  name="product_description"
                  value={productList.product_description}
                  onChange={handleChange}
                  placeholder="Fresh and pure milk collected from local farms..."
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition hover:border-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/15"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* 3. VARIANTS */}
        <Card
          title="Variants"
          subtitle="Sizes or packs, each with its own price, SKU and stock"
          action={
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/20"
            >
              <Plus size={16} />
              Add variant
            </button>
          }
        >
          {productList.variants.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No variants yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a variant to set a price and stock for this product.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {productList.variants.map((variant, index) => (
                <fieldset
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {/* Variant header */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {variant.variant_name || "Untitled variant"}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          variant.availability
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {variant.availability ? "In stock" : "Out of stock"}
                      </span>
                    </div>

                    {productList.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Variant body */}
                  <div className="space-y-5 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Field id={`v${index}-variant_name`} label="Variant name">
                        <input
                          id={`v${index}-variant_name`}
                          type="text"
                          name="variant_name"
                          value={variant.variant_name}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="e.g. 500 ML"
                          className={inputClass}
                        />
                      </Field>

                      <Field id={`v${index}-quantity`} label="Quantity">
                        <input
                          id={`v${index}-quantity`}
                          type="text"
                          name="quantity"
                          value={variant.quantity}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="e.g. 500"
                          className={inputClass}
                        />
                      </Field>

                      <Field id={`v${index}-unit`} label="Unit">
                        <select
                          id={`v${index}-unit`}
                          name="unit"
                          value={variant.unit}
                          onChange={(e) => handleVariantChange(index, e)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="">Select unit</option>
                          {ProductUnit?.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field id={`v${index}-package`} label="Package">
                        <input
                          id={`v${index}-package`}
                          type="text"
                          name="package"
                          value={variant.package}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="e.g. Bottle"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Field id={`v${index}-sku`} label="SKU">
                        <input
                          id={`v${index}-sku`}
                          type="text"
                          name="sku"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="e.g. CM-500"
                          className={inputClass}
                        />
                      </Field>

                      <Field id={`v${index}-price`} label="Price">
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
                            ₹
                          </span>
                          <input
                            id={`v${index}-price`}
                            type="number"
                            name="price"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, e)}
                            placeholder="25"
                            className={`${inputClass} pl-7`}
                          />
                        </div>
                      </Field>

                      <Field id={`v${index}-stock`} label="Stock quantity">
                        <input
                          id={`v${index}-stock`}
                          type="number"
                          name="stock_quantity"
                          value={variant.stock_quantity}
                          onChange={(e) => handleVariantChange(index, e)}
                          placeholder="100"
                          className={inputClass}
                        />
                      </Field>

                      <Field id={`v${index}-availability`} label="Availability">
                        <select
                          id={`v${index}-availability`}
                          name="availability"
                          value={variant.availability}
                          onChange={(e) => handleVariantChange(index, e)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value={true}>In stock</option>
                          <option value={false}>Out of stock</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </Card>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-2 pb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/product")}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdateProduct}
            className="h-10 cursor-pointer rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30"
          >
            Save changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
