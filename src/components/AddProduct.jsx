import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    catchPhrase: "",
    price: "",
    unit: "",
    availability: "In Stock",
    image: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product Added:", form);
    navigate("/dashboard/product");
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-1">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to create a new product
          </p>
        </div>

        {/* CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4"
        >
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Product Name
              </label>
              <input
                name="name"
                placeholder="e.g. Fresh Milk"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>

            {/* PRICE */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Price</label>
              <input
                name="price"
                type="number"
                placeholder="e.g. 120"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>

            {/* CATCH PHRASE */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Catch Phrase
              </label>
              <input
                name="catchPhrase"
                placeholder="Short description of product"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>

            {/* UNIT */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Unit</label>
              <input
                name="unit"
                placeholder="Kg / Litre / Piece"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>

            {/* AVAILABILITY */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Availability
              </label>
              <select
                name="availability"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition bg-white"
              >
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            {/* IMAGE */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Image URL
              </label>
              <input
                name="image"
                placeholder="https://example.com/image.jpg"
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/dashboard/product")}
              className="px-5 cursor-pointer py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
