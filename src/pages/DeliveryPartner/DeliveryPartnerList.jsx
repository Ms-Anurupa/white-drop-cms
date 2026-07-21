import { useMemo, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bike,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 6;

const initialPartners = [
  {
    id: "DP-2001",
    name: "Suresh Yadav",
    vehicle: "Bike",
    zone: "Salt Lake, Kolkata",
    status: "Active",
    phone: "9876501234",
    email: "suresh.y@gmail.com",
  },
  {
    id: "DP-2002",
    name: "Manoj Kumar",
    vehicle: "Scooter",
    zone: "Park Street, Kolkata",
    status: "On Delivery",
    phone: "9123409876",
    email: "manoj.k@gmail.com",
  },
  {
    id: "DP-2003",
    name: "Ravi Prakash",
    vehicle: "Bike",
    zone: "Howrah",
    status: "Inactive",
    phone: "9988001122",
    email: "ravi.p@gmail.com",
  },
  {
    id: "DP-2004",
    name: "Deepak Ghosh",
    vehicle: "Bicycle",
    zone: "New Town, Kolkata",
    status: "Active",
    phone: "9871122334",
    email: "deepak.g@gmail.com",
  },
  {
    id: "DP-2005",
    name: "Anil Mahato",
    vehicle: "Scooter",
    zone: "Behala, Kolkata",
    status: "On Delivery",
    phone: "9007766554",
    email: "anil.m@gmail.com",
  },
  {
    id: "DP-2006",
    name: "Bikash Roy",
    vehicle: "Bike",
    zone: "Dum Dum, Kolkata",
    status: "Active",
    phone: "9765432109",
    email: "bikash.r@gmail.com",
  },
  {
    id: "DP-2007",
    name: "Sanjay Thapa",
    vehicle: "Bike",
    zone: "Tollygunge, Kolkata",
    status: "Inactive",
    phone: "9334455667",
    email: "sanjay.t@gmail.com",
  },
];

const statusStyle = {
  Active: "bg-green-100 text-green-600",
  "On Delivery": "bg-blue-100 text-blue-600",
  Inactive: "bg-gray-200 text-gray-500",
};


const DeliveryPartnerList = () => {
  const [partners] = useState(initialPartners);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const filtered = useMemo(() => {
    return partners.filter((p) =>
      `${p.name} ${p.zone} ${p.id} ${p.vehicle}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, partners]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [page, filtered]);



  // ================= LIST "PAGE" =================
  return (
    <div className="p-2 sm:p-2 space-y-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Delivery Partners
        </h1>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search partners..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-base rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="p-3">Partner</th>
                <th className="p-3">Name</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{p.id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-gray-600 flex items-center gap-1">
                    <Bike size={14} /> {p.vehicle}
                  </td>
                  <td className="p-3 text-gray-600">{p.zone}</td>
                  <td className="p-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {p.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {p.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusStyle[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/dashboard/deliveryPartnerDetails/${p.id}`)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 text-sm"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden space-y-3">
        {paginated.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-sm p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{p.id}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${statusStyle[p.status]}`}
              >
                {p.status}
              </span>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">{p.name}</p>
              <p className="text-gray-500 flex items-center gap-1">
                <Bike size={12} /> {p.vehicle} &middot; {p.zone}
              </p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex items-center gap-1">
                <Phone size={12} /> {p.phone}
              </p>
              <p className="flex items-center gap-1">
                <Mail size={12} /> {p.email}
              </p>
            </div>

            <button
              onClick={() => navigate(`/dashboard/deliveryPartnerDetails/${p.id}`)}
              className="w-full mt-2 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm flex items-center justify-center gap-1"
            >
              <Eye size={14} />
              View
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white shadow disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerList;