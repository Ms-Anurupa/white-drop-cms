import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productDataStore from "../zustand/Store/productDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "./ConfirmProvider";
import { Plus, ArrowLeft, ImagePlus, X, Trash2 } from "lucide-react";

const labelCls = "text-xs font-medium text-gray-600";
const inputCls =
  "h-8 w-full px-2.5 text-xs rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";
const textareaCls =
  "w-full px-2.5 py-2 text-xs rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none";

const AddProduct = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const createProduct = productDataStore((state) => state.createProduct);
  const ProductUnit = productDataStore((state) => state.ProductUnit);
  const getProductUnit = productDataStore((state) => state.getProductUnit);

  const [productList, setProductList] = useState({
    product_name: "",
    product_description: "",
    catch_phrase: "",
    images: [],
    variants: [
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
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductList((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductList((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  ? value === ""
                    ? ""
                    : Number(value)
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

  const removeVariant = (index) => {
    setProductList((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    getProductUnit().catch(() => {
      toast.error("Failed to get product units");
    });
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      if (productList.images.length === 0) {
        toast.error("At least one image is required");
        return;
      }

      const confirmMessage = await confirm({
        title: "Add Product",
        message: "This will add the product. Continue?",
      });

      if (!confirmMessage) return;

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productList));

      if (productList.images && productList.images.length > 0) {
        productList.images.forEach((file) => {
          formData.append("productImages", file);
        });
      }

      await createProduct(formData);

      toast.success("Product Added Successfully");
      navigate("/dashboard/product");
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      toast.error(serverMessage || "Product Creation Failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 sm:px-5 lg:px-6 text-[13px]">
      <form
        onSubmit={handleCreateProduct}
        className="max-w-6xl mx-auto space-y-4"
      >
        {/* HEADER */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/product")}
            className="inline-flex items-center gap-1.5 -ml-1 px-1.5 py-1 rounded-md cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <ArrowLeft size={14} />
            Back to products
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
              Add new product
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in the details below to create a new product listing
            </p>
          </div>
        </div>

        {/* SECTION: Product identity */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">
              Product details
            </h2>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* IMAGE UPLOAD */}
            <div className="lg:col-span-1">
              <label className={`${labelCls} block mb-1`}>
                Product images<span className="text-red-500 ml-0.5">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 transition-colors group">
                <ImagePlus
                  size={20}
                  className="text-gray-400 group-hover:text-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-600 mt-1 group-hover:text-blue-600 transition-colors">
                  Click to upload images
                </p>
                <p className="text-[11px] text-gray-400">
                  PNG, JPG, WEBP supported
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {productList.images.length > 0 && (
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mt-2.5">
                  {productList.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProductList((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        aria-label="Remove image"
                        className="absolute cursor-pointer inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TEXT FIELDS */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>
                  Product name<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  required
                  name="product_name"
                  value={productList.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Cow Milk"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>
                  Catch phrase<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  required
                  name="catch_phrase"
                  value={productList.catch_phrase}
                  onChange={handleChange}
                  placeholder="e.g. Pure Fresh Milk Every Day"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className={labelCls}>
                  Product description
                </label>
                <textarea
                  rows={3}
                  name="product_description"
                  value={productList.product_description}
                  onChange={handleChange}
                  placeholder="Fresh and pure milk collected from local farms..."
                  className={textareaCls}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Variant Details */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900">
              Variants
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({productList.variants.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center cursor-pointer gap-1 h-7 px-2.5 rounded-md bg-white hover:bg-blue-50 text-blue-600 font-medium text-xs transition border border-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Plus size={13} />
              Add variant
            </button>
          </div>

          <div className="p-4 space-y-3">
            {productList.variants.map((variant, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 bg-gray-50/60 p-3"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-gray-700">
                    Variant {index + 1}
                  </span>
                  {productList.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="inline-flex cursor-pointer items-center gap-1 h-6 px-2 rounded-md bg-white hover:bg-red-50 text-red-600 font-medium text-[11px] transition border border-red-100"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-2.5">
                  {[
                    {
                      label: "Quantity",
                      name: "quantity",
                      placeholder: "e.g. 500",
                      type: "number",
                      step: "any",
                      min: "0.01",
                      required: true,
                    },
                    {
                      label: "Unit",
                      name: "unit",
                      required: true,
                    },
                    {
                      label: "Price (₹)",
                      name: "price",
                      placeholder: "e.g. 25",
                      type: "number",
                      step: "any",
                      min: "0",
                      required: true,
                    },
                    {
                      label: "Variant Name",
                      name: "variant_name",
                      placeholder: "Optional",
                      type: "text",
                      required: false,
                    },
                    {
                      label: "Package",
                      name: "package",
                      placeholder: "e.g. Bottle",
                      type: "text",
                      required: false,
                    },
                    {
                      label: "Stock Quantity",
                      name: "stock_quantity",
                      placeholder: "e.g. 100",
                      type: "number",
                      min: "0",
                      required: true,
                    },
                    {
                      label: "SKU",
                      name: "sku",
                      placeholder: "e.g. CM-500",
                      type: "text",
                      required: true,
                    },
                  ].map(
                    ({
                      label,
                      name,
                      placeholder,
                      type,
                      step,
                      min,
                      required,
                    }) => (
                      <div key={name} className="flex flex-col gap-1">
                        <label className={labelCls}>
                          {label}
                          {required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </label>

                        {name === "unit" ? (
                          <select
                            name="unit"
                            required={required}
                            value={variant.unit}
                            onChange={(e) => handleVariantChange(index, e)}
                            className={`${inputCls} cursor-pointer`}
                          >
                            <option value="">Select Unit</option>
                            {ProductUnit?.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={type}
                            name={name}
                            step={step}
                            min={min}
                            required={required}
                            value={variant[name]}
                            onChange={(e) => handleVariantChange(index, e)}
                            placeholder={placeholder}
                            className={inputCls}
                          />
                        )}
                      </div>
                    ),
                  )}

                  {/* Availability */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Availability</label>
                    <select
                      name="availability"
                      value={variant.availability}
                      onChange={(e) => handleVariantChange(index, e)}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value={true}>In Stock</option>
                      <option value={false}>Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER BUTTONS */}
        <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-5 lg:-mx-6 px-3 sm:px-5 lg:px-6 py-2.5 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/product")}
            className="h-8 px-4 cursor-pointer rounded-md bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium transition text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 px-4 cursor-pointer rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium shadow-sm transition text-xs inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <Plus size={14} />
            Add product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
