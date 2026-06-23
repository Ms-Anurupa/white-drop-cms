import { useMemo, useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

const PAGE_SIZE = 5;

/* ── SAMPLE DATA ── */
const INITIAL_LOCALITY = [
  {
    id: 1,
    name: "Salt Lake",
    pincode: "700091",
    addedBy: "Admin",
    createdAt: "2026-06-20",
    status: "Active",
  },
  {
    id: 2,
    name: "New Town",
    pincode: "700156",
    addedBy: "Admin",
    createdAt: "2026-06-18",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Park Street",
    pincode: "700016",
    addedBy: "Manager",
    createdAt: "2026-06-17",
    status: "Active",
  },
];

const LocalityManager = () => {
  const [localities, setLocalities] = useState(INITIAL_LOCALITY);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    pincode: "",
  });

  /* ── FILTER ── */
  const filtered = useMemo(() => {
    return localities.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.pincode.includes(search),
    );
  }, [search, localities]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  /* ── ADD LOCALITY ── */
  const handleAdd = () => {
    if (!form.name || !form.pincode) return;

    const newItem = {
      id: Date.now(),
      name: form.name,
      pincode: form.pincode,
      addedBy: "Admin",
      createdAt: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setLocalities([newItem, ...localities]);
    setForm({ name: "", pincode: "" });
    setOpenModal(false);
  };

  /* ── STATUS TOGGLE ── */
  const toggleStatus = (id) => {
    setLocalities((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" }
          : l,
      ),
    );
  };

  return (
    <div className="px-4 sm:px-4 space-y-2">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Locality Manager
          </h1>
          <p className="text-sm text-gray-500">
            Total Localities:{" "}
            <span className="font-medium text-gray-700">
              {localities.length}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search locality..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 cursor-pointer text-sm border border-gray-200 rounded-xl bg-white"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Locality
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile Cards */}
        <div className="sm:hidden p-3 space-y-3">
          {paginated.map((l) => (
            <div key={l.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <h3 className="font-semibold">{l.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    l.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {l.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">Pincode: {l.pincode}</p>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{l.addedBy}</span>
                <span>{l.createdAt}</span>
              </div>

              <button
                onClick={() => toggleStatus(l.id)}
                className="w-full text-xs border rounded-lg py-2 hover:bg-gray-50"
              >
                Toggle Status
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Sr. No.",
                  "Locality Name",
                  "Pincode",
                  "Added By",
                  "Created At",
                  "Edit",
                  "Status",
                  "Set Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginated.map((l, index) => (
                <tr key={l.id} className=" hover:bg-gray-50 transition">
                  <td className="px-3 py-3">{start + index + 1}</td>

                  <td className="px-3 py-3 font-medium">{l.name}</td>

                  <td className="px-3 py-3">{l.pincode}</td>

                  <td className="px-3 py-3">{l.addedBy}</td>

                  <td className="px-3 py-3 text-gray-500">{l.createdAt}</td>

                  <td className="px-3 py-3">
                    <button className="text-blue-600 text-xs">Edit</button>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        l.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleStatus(l.id)}
                      className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        l.status === "Active" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          l.status === "Active"
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

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-500">
            {filtered.length === 0
              ? "No data"
              : `${start + 1}–${Math.min(
                  start + PAGE_SIZE,
                  filtered.length,
                )} of ${filtered.length}`}
          </p>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1 cursor-pointer border rounded"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs">
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
      </div>

      {/* ── MODAL ── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Locality</h2>

              <button onClick={() => setOpenModal(false)} className="cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <input
              placeholder="Locality Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded-lg text-sm"
            />

            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="w-full border p-2 rounded-lg text-sm"
            />

            <button
              onClick={handleAdd}
              className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalityManager;
