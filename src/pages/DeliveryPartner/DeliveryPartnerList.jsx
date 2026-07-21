import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bike,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import deliveryPartnerStore from "../../zustand/Store/deliveryPartnerStore";

const PAGE_SIZE = 6;

const statusStyle = {
  Active: "bg-green-100 text-green-600",
  Inactive: "bg-gray-200 text-gray-500",
};

const getStatus = (active) => (active ? "Active" : "Inactive");

const getFullName = (p) => {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
  return name || "Profile Incomplete";
};

const getInitials = (p) => {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
  if (!name) return <UserRound size={16} />;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DeliveryPartnerList = () => {
  const getDeliveryPersons = deliveryPartnerStore(
    (state) => state.getDeliveryPersons,
  );
  const partners = deliveryPartnerStore((state) => state.partners);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getDeliveryPersons();
  }, [getDeliveryPersons]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (partners || []).filter((p) =>
      `${p.firstName ?? ""} ${p.lastName ?? ""} ${p.deliveryPersonId ?? ""} ${p.phoneNum ?? ""} ${p.vehicleNumber ?? ""}`
        .toLowerCase()
        .includes(q),
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

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
          No delivery partners found.
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                  <tr>
                    <th className="p-3">Partner ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Vehicle No.</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((p) => {
                    const status = getStatus(p.active);
                    return (
                      <tr
                        key={p.deliveryPersonId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium text-gray-500 text-xs">
                          {p.deliveryPersonId}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center overflow-hidden">
                              {p.photo ? (
                                <img
                                  src={p.photo}
                                  alt={getFullName(p)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getInitials(p)
                              )}
                            </div>
                            <span
                              className={
                                p.firstName
                                  ? "font-medium"
                                  : "italic text-gray-400"
                              }
                            >
                              {getFullName(p)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 flex items-center gap-1">
                          <Bike size={14} /> {p.vehicleNumber || "—"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone size={14} /> {p.phoneNum}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${statusStyle[status]}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/deliveryPartnerDetails/${p?.deliveryPersonId}`,
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 text-sm"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= MOBILE CARD VIEW ================= */}
          <div className="md:hidden space-y-3">
            {paginated.map((p) => {
              const status = getStatus(p.active);
              return (
                <div
                  key={p.deliveryPersonId}
                  className="bg-white rounded-xl shadow-sm p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs text-gray-500">
                      {p.deliveryPersonId}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusStyle[status]}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center overflow-hidden shrink-0">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt={getFullName(p)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(p)
                      )}
                    </div>
                    <div>
                      <p
                        className={
                          p.firstName
                            ? "font-medium text-sm"
                            : "italic text-gray-400 text-sm"
                        }
                      >
                        {getFullName(p)}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 text-xs">
                        <Bike size={12} />{" "}
                        {p.vehicleNumber || "No vehicle on file"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <Phone size={12} /> {p.phoneNum}
                    </p>
                    <p className="text-gray-400">
                      Joined {formatDate(p.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/deliveryPartnerDetails/${p?.deliveryPersonId}`,
                      )
                    }
                    className="w-full mt-2 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>
              );
            })}
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
        </>
      )}
    </div>
  );
};

export default DeliveryPartnerList;
