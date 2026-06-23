import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";

const Product = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [products] = useState([
    {
      id: 1,
      name: "Milk",
      catchPhrase: "Pure & Fresh",
      image: "https://via.placeholder.com/40",
      price: 50,
      availability: "In Stock",
      unit: "Litre",
    },
    {
      id: 2,
      name: "Butter",
      catchPhrase: "Creamy Taste",
      image: "https://via.placeholder.com/40",
      price: 120,
      availability: "Out of Stock",
      unit: "Pack",
    },
  ]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <h1 className="text-2xl font-bold text-gray-700">
          Product Management
        </h1>

        <div className="flex gap-3 flex-wrap">
          <Search size={20}/>
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* ADD BUTTON */}
          <button
            onClick={() => navigate("/dashboard/product/addProduct")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Product
          </button>

          {/* EXPORT */}
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Export
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Sl. No.</th>
              <th className="p-3">Name</th>
              <th className="p-3">Catch Phrase</th>
              <th className="p-3">Image</th>
              <th className="p-3">Price</th>
              <th className="p-3">Availability</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">

                <td className="p-3">{index + 1}</td>

                <td className="p-3 font-medium">{item.name}</td>

                <td className="p-3 text-gray-500">{item.catchPhrase}</td>

                <td className="p-3">
                  <img
                    src={item.image}
                    className="w-10 h-10 rounded"
                    alt=""
                  />
                </td>

                <td className="p-3">₹{item.price}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.availability === "In Stock"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.availability}
                  </span>
                </td>

                <td className="p-3">{item.unit}</td>

                <td className="p-3 flex gap-2">
                  <button className="px-2 py-1 text-xs bg-yellow-400 rounded">
                    Edit
                  </button>
                  <button className="px-2 py-1 text-xs bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
};

export default Product;