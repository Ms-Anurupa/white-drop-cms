import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Wallet,
  CalendarDays,
  ShieldCheck,
  UserRound,
  Bell,
  CreditCard,
} from "lucide-react";
import customerStore from "../zustand/Store/customerStore";
import Loader from "../components/Loader";

const formatDate = (value) => {
  if (!value) return "NA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "NA";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "NA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "NA";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const getCustomerDetails = customerStore((state) => state.getCustomerDetails);

  const customerDetails = customerStore((state) => state.customerDetails);

  const loading = customerStore((state) => state.loading);

  useEffect(() => {
    if (!customerId) return;

    getCustomerDetails(customerId);
  }, [customerId, getCustomerDetails]);

  if (loading) {
    return <Loader text="Loading Customer Details..." />;
  }

  if (!customerDetails) {
    return (
      <div className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <User size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            Customer not found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            No customer information is available.
          </p>

          <button
            onClick={() => navigate("/dashboard/customer")}
            className="mt-5 cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft size={16} />
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const subscriptions = Array.isArray(customerDetails.subscriptions)
    ? customerDetails.subscriptions
    : [];

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/customer")}
            className="w-9 h-9 cursor-pointer rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Customer Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View customer account information
            </p>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            customerDetails.accountStatus === "ACTIVE"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {customerDetails.accountStatus || "NA"}
        </span>
      </div>

      {/* CUSTOMER PROFILE */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User size={30} className="text-blue-600" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {customerDetails.customer_name || "Unnamed Customer"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {customerDetails.phone_num || "NA"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                <ShieldCheck size={14} />
                {customerDetails.role || "NA"}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                <UserRound size={14} />
                {customerDetails.customer_type || "Customer"}
              </span>
            </div>
          </div>
        </div>

        {/* ACCOUNT SUMMARY */}
        <div className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Account Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PHONE */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Phone size={16} />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Phone
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900 break-all">
                {customerDetails.phone_num || "NA"}
              </p>
            </div>

            {/* WALLET */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Wallet size={16} />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Wallet Balance
                </span>
              </div>

              <p className="text-lg font-semibold text-gray-900">
                ₹{Number(customerDetails.wallet_balance || 0).toFixed(2)}
              </p>
            </div>

            {/* ROLE */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ShieldCheck size={16} />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Role
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900">
                {customerDetails.role || "NA"}
              </p>
            </div>

            {/* JOINED */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <CalendarDays size={16} />

                <span className="text-xs font-medium uppercase tracking-wide">
                  Joined On
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900">
                {formatDate(customerDetails.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoItem
            icon={<User size={16} />}
            label="Customer Name"
            value={customerDetails.customer_name}
          />

          <InfoItem
            icon={<UserRound size={16} />}
            label="Customer Type"
            value={customerDetails.customer_type}
          />

          <InfoItem
            icon={<Phone size={16} />}
            label="Phone Number"
            value={customerDetails.phone_num}
          />

          <InfoItem
            icon={<ShieldCheck size={16} />}
            label="Account Status"
            value={customerDetails.accountStatus}
          />

          <InfoItem
            icon={<ShieldCheck size={16} />}
            label="Role"
            value={customerDetails.role}
          />

          <InfoItem
            icon={<CalendarDays size={16} />}
            label="Account Created"
            value={formatDateTime(customerDetails.createdAt)}
          />
        </div>
      </div>

      {/* WALLET & SUBSCRIPTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WALLET */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wallet size={20} className="text-blue-600" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Wallet</h3>

              <p className="text-xs text-gray-500">Current wallet balance</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
            <p className="text-xs text-gray-500">Available Balance</p>

            <p className="text-2xl font-semibold text-gray-900 mt-1">
              ₹{Number(customerDetails.wallet_balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* SUBSCRIPTIONS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <CreditCard size={20} className="text-purple-600" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Subscriptions
                </h3>

                <p className="text-xs text-gray-500">
                  Customer subscription details
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              {subscriptions.length}
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
              <CreditCard size={28} className="mx-auto text-gray-300" />

              <p className="text-sm font-medium text-gray-500 mt-2">
                No subscriptions
              </p>

              <p className="text-xs text-gray-400 mt-1">
                This customer has no active subscriptions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription, index) => (
                <div
                  key={subscription?.id || index}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                    {JSON.stringify(subscription, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SYSTEM INFORMATION */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5">
          System Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoItem
            icon={<Bell size={16} />}
            label="Notifications"
            value={customerDetails.fcmToken ? "Enabled" : "Not configured"}
          />

          <InfoItem
            icon={<CalendarDays size={16} />}
            label="Deletion Request"
            value={
              customerDetails.deletionReqAt
                ? formatDateTime(customerDetails.deletionReqAt)
                : "No deletion request"
            }
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 text-gray-400 mb-1.5">
      {icon}

      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>

    <p className="text-sm font-medium text-gray-900 break-all">
      {value ?? "NA"}
    </p>
  </div>
);

export default CustomerDetails;
