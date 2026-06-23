import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Delete, Edit, View } from "lucide-react";

const PAGE_SIZE = 5;

const Customer = () => {
  const [page, setPage] = useState(1);

  const customers = [
    {
      id: 1,
      phone: "9876543210",
      name: "Rahul Sharma",
      type: "Premium",
      wallet: 1200,
      joined: "2025-01-10",
      subscription: "Gold",
    },
    {
      id: 2,
      phone: "9123456780",
      name: "Anita Roy",
      type: "Regular",
      wallet: 450,
      joined: "2025-03-18",
      subscription: "Silver",
    },
    {
      id: 3,
      phone: "9988776655",
      name: "Amit Das",
      type: "Premium",
      wallet: 3200,
      joined: "2024-12-02",
      subscription: "Platinum",
    },
    {
      id: 4,
      phone: "9001122334",
      name: "Neha Gupta",
      type: "Regular",
      wallet: 780,
      joined: "2025-02-21",
      subscription: "Silver",
    },
    {
      id: 5,
      phone: "9001122334",
      name: "Neha Gupta",
      type: "Regular",
      wallet: 780,
      joined: "2025-02-21",
      subscription: "Silver",
    },
    {
      id: 6,
      phone: "9001122334",
      name: "Neha Gupta",
      type: "Regular",
      wallet: 780,
      joined: "2025-02-21",
      subscription: "Silver",
    },
  ];

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;

  const paginated = useMemo(() => {
    return customers.slice(start, start + PAGE_SIZE);
  }, [page]);

  return (
    <div className="h-full p-2 sm:p-3 md:p-4 space-y-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Left Side */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage customer data, wallets & subscriptions
          </p>
        </div>

        {/* Right Side */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Total Customers */}
          <div className="w-full sm:w-auto px-3.5 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg text-center">
            Total Customers:{" "}
            <span className="font-semibold text-gray-900">20</span>
          </div>

          {/* Export Button */}
          <button className="w-full sm:w-auto px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            Export
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-[350px] overflow-hidden">
        {/* /mobile table cards */}
        <div className="sm:hidden flex-1 overflow-y-auto p-2 space-y-3">
          {paginated.map((c, index) => (
            <div
              key={c.id}
              className="border border-gray-100 rounded-xl p-3 bg-white"
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{c.name}</h3>

                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      c.type === "Premium"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Wallet</p>
                    <p>₹{c.wallet}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p>{c.joined}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Subscription</p>
                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                      {c.subscription}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button className="text-gray-700">
                    <View size={18} />
                  </button>

                  <button className="text-blue-600">
                    <Edit size={18} />
                  </button>

                  <button className="text-red-600">
                    <Delete size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HEADER TABLE */}
        <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Sl No",
                  "Phone Number",
                  "Name",
                  "Type",
                  "Wallet Balance",
                  "Joined On",
                  "Subscriptions",
                  "Actions",
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
          </table>
          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      No customers found
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, index) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="px-2 py-3 text-gray-400">
                        {start + index + 1}
                      </td>

                      <td className="px-2 py-3 font-medium text-gray-700">
                        {c.phone}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-800">
                        {c.name}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            c.type === "Premium"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-800">
                        ₹{c.wallet}
                      </td>

                      <td className="px-4 py-3 text-gray-500">{c.joined}</td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                          {c.subscription}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-amber-950 hover:bg-gray-100">
                            <View size={20} />
                          </button>

                          <button className=" text-blue-600 hover:bg-blue-50">
                            <Edit size={20} />
                          </button>

                          <button className="border-red-200 text-red-600 hover:bg-red-50">
                            <Delete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION (fixed bottom) */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {customers.length === 0
              ? "No results"
              : `${start + 1}–${Math.min(
                  start + PAGE_SIZE,
                  customers.length,
                )} of ${customers.length}`}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-md border bg-white disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="text-xs font-medium min-w-[40px] text-center">
              {page} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-md border bg-white disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
