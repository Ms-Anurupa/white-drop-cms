import { useMemo, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 6;

const initialTickets = [
  {
    id: "TCK-1001",
    name: "Rahul Sharma",
    issue: "Delivery delay",
    status: "Open",
    phone: "9876543210",
    email: "rahul@gmail.com",
    createdAt: "2026-06-20",
  },
  {
    id: "TCK-1002",
    name: "Priya Sen",
    issue: "Wrong product received",
    status: "In Progress",
    phone: "9123456780",
    email: "priya@gmail.com",
    createdAt: "2026-06-21",
  },
  {
    id: "TCK-1003",
    name: "Amit Das",
    issue: "Refund not received",
    status: "Closed",
    phone: "9988776655",
    email: "amit@gmail.com",
    createdAt: "2026-06-22",
  },
];

const statusStyle = {
  Open: "bg-red-100 text-red-600",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Closed: "bg-green-100 text-green-600",
};

const CustomerHelpLine = () => {
  const [tickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return tickets.filter((t) =>
      `${t.name} ${t.issue} ${t.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [search, tickets]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [page, filtered]);

  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Customer Help Line
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
            placeholder="Search tickets..."
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
                <th className="p-3">Ticket</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Issue</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{t.id}</td>
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-gray-600">{t.issue}</td>
                  <td className="p-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {t.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {t.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusStyle[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500">{t.createdAt}</td>

                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 text-sm">
                      <MessageCircle size={14} />
                      Reply
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
        {paginated.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{t.id}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${statusStyle[t.status]}`}
              >
                {t.status}
              </span>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">{t.name}</p>
              <p className="text-gray-500">{t.issue}</p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex items-center gap-1">
                <Phone size={12} /> {t.phone}
              </p>
              <p className="flex items-center gap-1">
                <Mail size={12} /> {t.email}
              </p>
              <p className="text-gray-400">{t.createdAt}</p>
            </div>

            <button className="w-full mt-2 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm flex items-center justify-center gap-1">
              <MessageCircle size={14} />
              Reply
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-600">
          Page {page} of {totalPages || 1}
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

export default CustomerHelpLine;
