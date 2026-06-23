import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

const INITIAL_OFFERS = [
  {
    id: 1,
    label: "Summer Offer",
    type: "Discount",
    category: "Seasonal",
    products: "Milk, Butter",
    buyQty: 2,
    getQty: 1,
    addedBy: "Admin",
    createdAt: "2026-06-20",
    status: "Active",
  },
  {
    id: 2,
    label: "Winter Offer",
    type: "Combo",
    category: "Festival",
    products: "Ghee, Cheese",
    buyQty: 1,
    getQty: 1,
    addedBy: "Manager",
    createdAt: "2026-06-18",
    status: "Inactive",
  },
];

const OfferManager = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [offers, setOffers] = useState(INITIAL_OFFERS);

  const filtered = offers.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const toggleStatus = (id) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: o.status === "Active" ? "Inactive" : "Active",
            }
          : o,
      ),
    );
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Offer Manager</h1>
          <p className="text-sm text-gray-500">
            Manage all offers & promotions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* SEARCH */}
          <div className="relative w-full sm:w-56">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search offer..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() =>
              navigate("/dashboard/support/offer-manager/add-offer")
            }
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Offer
          </button>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* ───────── DESKTOP TABLE ───────── */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Sl No.",
                  "Offer Label",
                  "Type",
                  "Category",
                  "Products",
                  "Buy Qty",
                  "Get Qty",
                  "Added By",
                  "Created",
                  "Status",
                  "Toggle",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginated.map((o, i) => (
                <tr key={o.id} className=" hover:bg-gray-50">
                  <td className="px-3 py-3">{start + i + 1}</td>
                  <td className="px-3 py-3 font-medium">{o.label}</td>
                  <td className="px-3 py-3">{o.type}</td>
                  <td className="px-3 py-3">{o.category}</td>
                  <td className="px-3 py-3">{o.products}</td>
                  <td className="px-3 py-3">{o.buyQty}</td>
                  <td className="px-3 py-3">{o.getQty}</td>
                  <td className="px-3 py-3">{o.addedBy}</td>
                  <td className="px-3 py-3 text-gray-500">{o.createdAt}</td>

                  <td className="px-3 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        o.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    {/* TOGGLE SWITCH */}
                    <button
                      onClick={() => toggleStatus(o.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        o.status === "Active" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 bg-white rounded-full transform transition ${
                          o.status === "Active"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ───────── MOBILE CARD UI ───────── */}
        <div className="md:hidden space-y-3 p-3">
          {paginated.map((o) => (
            <div key={o.id} className="border rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <h3 className="font-semibold">{o.label}</h3>
                <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                  {o.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {o.type} • {o.category}
              </p>

              <p className="text-sm">Products: {o.products}</p>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Buy: {o.buyQty}</span>
                <span>Get: {o.getQty}</span>
              </div>

              <button
                onClick={() => toggleStatus(o.id)}
                className={`w-full mt-2 relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  o.status === "Active" ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`h-4 w-4 bg-white rounded-full transform transition ${
                    o.status === "Active" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="p-1 cursor-pointer border rounded"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm">
          {page} / {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="p-1 cursor-pointer border rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default OfferManager;
