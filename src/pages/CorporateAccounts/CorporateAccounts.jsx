import { useEffect, useState } from "react";
import corporateDataStore from "../../zustand/Store/corporateDataStore";
import { Building2, Eye } from "lucide-react";

const CorporateAccounts = () => {
  const getCorporateAccounts = corporateDataStore(
    (state) => state.getCorporateAccounts,
  );

  const corporateOrderAcc = corporateDataStore(
    (state) => state.corporateOrderAcc,
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    getCorporateAccounts({
      search,
      status,
      page,
      limit,
    });
  }, [getCorporateAccounts, search, status, page]);

  useEffect(() => {
    console.log(corporateOrderAcc);
  }, [corporateOrderAcc]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white px-4 py-2">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Corporate Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all corporate accounts.
          </p>
        </div>

        <div className="w-full lg:max-w-md lg:flex-1">

          <input
            type="text"
            placeholder="Search Business / GST / Contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:flex lg:items-end">
        <div className="w-full lg:w-56">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="APPROVED">Approved</option>
            <option value="INREVIEW">In Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearch("");
            setStatus("");
            setPage(1);
          }}
          className="w-full rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 lg:w-auto"
        >
          Reset
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-4">Business</th>
              <th className="px-6 py-4">GST No.</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {corporateOrderAcc?.length > 0 ? (
              corporateOrderAcc.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.businessName}
                      </p>

                      <p className="text-xs text-gray-500">
                        #{account.serialNumber}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.gstNo}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.contactNo}
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{account.address}</p>

                      <p className="text-xs text-gray-500">
                        {account.location?.landmark}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        account.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : account.status === "INREVIEW"
                            ? "bg-amber-100 text-amber-700"
                            : account.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : account.status === "DEACTIVATED"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {account.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(account.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => console.log(account)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                      <Building2 size={28} className="text-blue-600" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-gray-800">
                      No Corporate Accounts
                    </h3>

                    <p className="mt-2 text-center text-sm text-gray-500">
                      No corporate accounts have been created yet.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CorporateAccounts;
