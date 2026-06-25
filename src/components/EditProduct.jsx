import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productDataStore from "../zustand/Store/productDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "./ConfirmProvider";

const EditProduct = () => {
  const navigate = useNavigate();
  const { product_id } = useParams();
  const { confirm } = useConfirm();

  const getProductById = productDataStore((state) => state.getProductById);
  const updateProduct = productDataStore((state) => state.updateProduct);
  const ProductUnit = productDataStore((state) => state.ProductUnit);
  const getProductUnit = productDataStore((state) => state.getProductUnit);

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
          variant_name: "",
          unit: "",
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

  const handleUpdateProduct = async () => {
    try {
      const confirmMessage = await confirm({
        title: "Update Product",
        message: "Save changes to this product?",
      });

      if (!confirmMessage) return;

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productList));

      productList.images.forEach((file) => {
        if (file instanceof File) {
          formData.append("product_images", file);
        }
      });

      await updateProduct(product_id, formData);
      toast.success("Product updated successfully");
      navigate("/dashboard/product");
    } catch {
      toast.error("Product update failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-br px-4">
      <div className="max-w-9xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-xl">✏️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Edit Product
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Update the details below to edit this product listing
            </p>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/60 border border-white p-8 space-y-10">
          {/* SECTION: Product Identity */}
          <div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-5">
              Product Identity
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IMAGE UPLOAD */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600 block mb-2">
                  Product Images{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (Upload new images to replace or add)
                  </span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer bg-blue-50/40 hover:bg-blue-50 transition-colors group">
                  <div className="text-center">
                    <span className="text-2xl">🖼️</span>
                    <p className="text-sm text-slate-500 mt-1 group-hover:text-blue-600 transition-colors">
                      Click to upload images
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG, WEBP supported
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {productList.images.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-4">
                    {productList.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative h-full w-full rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm group"
                      >
                        <img
                          src={
                            typeof img === "string"
                              ? `${import.meta.env.VITE_BASE_URL}/product_images/${img}`
                              : URL.createObjectURL(img)
                          }
                          className="w-full h-full object-cover"
                          alt={`product-${index}`}
                        />
                        <button
                          onClick={() =>
                            setProductList((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }
                          className="absolute cursor-pointer inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">
                  Product Name
                </label>
                <input
                  name="product_name"
                  value={productList.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Cow Milk"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>

              {/* Catch Phrase */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">
                  Catch Phrase
                </label>
                <input
                  name="catch_phrase"
                  value={productList.catch_phrase}
                  onChange={handleChange}
                  placeholder="e.g. Pure Fresh Milk Every Day"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  name="product_description"
                  value={productList.product_description}
                  onChange={handleChange}
                  placeholder="Fresh and pure milk collected from local farms..."
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-dashed border-slate-200" />

          {/* SECTION: Variant Details */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
                Variant Details
              </p>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm transition-all border border-blue-100"
              >
                <span className="text-lg leading-none">＋</span> Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {productList.variants.map((variant, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
                >
                  {/* Variant Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Variant {index + 1}
                    </span>
                    {productList.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-xs transition-all border border-red-100"
                      >
                        <span>✕</span> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Variant Name", name: "variant_name", placeholder: "e.g. 500 ML", type: "text" },
                      { label: "Unit", name: "unit", placeholder: "e.g. ML", type: "text" },
                      { label: "Package", name: "package", placeholder: "e.g. Bottle", type: "text" },
                      { label: "Price (₹)", name: "price", placeholder: "e.g. 25", type: "number" },
                      { label: "Stock Quantity", name: "stock_quantity", placeholder: "e.g. 100", type: "number" },
                      { label: "SKU", name: "sku", placeholder: "e.g. CM-500", type: "text" },
                    ].map(({ label, name, placeholder, type }) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-600">
                          {label}
                        </label>

                        {name === "unit" ? (
                          <select
                            name="unit"
                            value={variant.unit}
                            onChange={(e) => handleVariantChange(index, e)}
                            className="px-4 py-3 cursor-pointer rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800"
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
                            value={variant[name]}
                            onChange={(e) => handleVariantChange(index, e)}
                            placeholder={placeholder}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                          />
                        )}
                      </div>
                    ))}

                    {/* Availability */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={variant.availability}
                        onChange={(e) => handleVariantChange(index, e)}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800"
                      >
                        <option value={true}>In Stock</option>
                        <option value={false}>Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-dashed border-slate-100" />

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/product")}
              className="px-6 py-3 cursor-pointer rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProduct}
              className="px-8 py-3 cursor-pointer rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold shadow-lg shadow-blue-200 transition-all text-sm"
            >
              Save Changes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;