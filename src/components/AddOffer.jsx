import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddOffer = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    label: "",
    type: "",
    category: "",
    products: "",
    buyQty: "",
    getQty: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Offer Submitted:", form);

    // redirect to offer management page
    navigate("/offers");
  };

  return (
    <div className="px-4 sm:px-4">

      {/* HEADER */}
      <div className="w-full mx-auto mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create New Offer
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the details below to add a new promotional offer
        </p>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto bg-white rounded-2xl shadow-sm p-5 sm:p-8"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Offer Label */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Offer Label
            </label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="e.g. Summer Special"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Offer Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Offer Type
            </label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g. Discount / Combo"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Offer Category
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Festival / Seasonal"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Products */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Associated Products
            </label>
            <input
              name="products"
              value={form.products}
              onChange={handleChange}
              placeholder="e.g. Milk, Butter"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Buy Qty */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Buy Quantity
            </label>
            <input
              type="number"
              name="buyQty"
              value={form.buyQty}
              onChange={handleChange}
              placeholder="e.g. 2"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Get Qty */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Get Quantity
            </label>
            <input
              type="number"
              name="getQty"
              value={form.getQty}
              onChange={handleChange}
              placeholder="e.g. 1"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">

          <button
            type="button"
            onClick={() => navigate("/dashboard/support/offer-manager")}
            className="px-5 py-2.5 cursor-pointer border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/support/offer-manager")}
            className="px-5 py-2.5 cursor-pointer bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Save Offer
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddOffer;