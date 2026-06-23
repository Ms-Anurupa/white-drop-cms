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
    <div className="p-6 max-w-2xl">

      <h1 className="text-2xl font-bold mb-6 text-gray-700">
        Add Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >

        <input
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="catchPhrase"
          placeholder="Catch Phrase"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="price"
          placeholder="Price"
          type="number"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="unit"
          placeholder="Unit (Litre, Kg etc)"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="availability"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>In Stock</option>
          <option>Out of Stock</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/product")}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;