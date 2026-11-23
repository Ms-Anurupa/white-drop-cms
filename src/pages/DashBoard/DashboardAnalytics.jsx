import { useState } from "react";
import {
  Package,
  Wallet,
  ShoppingBag,
  Users,
  Search,
  Bell,
} from "lucide-react";
import ProductAnalytics from "./ProductAnalytics";
import ExpensesAnalytics from "./ExpensesAnalytics";
import OrdersAnalytics from "./OrdersAnalytics";
import CustomersAnalytics from "./CustomersAnalytics";

const NAV_TABS = [
  {
    id: "product",
    label: "Product",
    hue: "#2563EB",
    icon: Package,
    Component: ProductAnalytics,
  },
  {
    id: "expenses",
    label: "Expenses",
    hue: "#0D9488",
    icon: Wallet,
    Component: ExpensesAnalytics,
  },
  {
    id: "orders",
    label: "Orders",
    hue: "#EA580C",
    icon: ShoppingBag,
    badge: "5 types",
    Component: OrdersAnalytics,
  },
  {
    id: "customers",
    label: "Customers",
    hue: "#7C3AED",
    icon: Users,
    Component: CustomersAnalytics,
  },
];

const DashboardAnalytics = () => {
  const [activeTab, setActiveTab] = useState("product"); // Product selected by default
  const activeConfig = NAV_TABS.find((t) => t.id === activeTab) || NAV_TABS[0];
  const ActiveComponent = activeConfig.Component;

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F5F7] text-[12px] text-[#101828]"
      style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&display=swap');
        @media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`}</style>

      <header className="z-40 border-b border-[#E6E8EC] bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          {/* Top Tabs: Product (default), Expenses, Orders, Customers */}
          <nav
            aria-label="Dashboard Categories"
            className="flex flex-wrap items-center gap-1.5"
          >
            {NAV_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all ${
                    isActive
                      ? "text-white shadow-sm"
                      : "bg-[#F4F5F7] text-slate-600 hover:bg-slate-200/70 hover:text-[#101828]"
                  }`}
                  style={isActive ? { background: t.hue } : undefined}
                >
                  <Icon size={13} />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span
                      className={`ml-0.5 rounded px-1.5 py-px text-[10px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <label className="hidden w-60 items-center gap-2 rounded-lg bg-[#F4F5F7] px-2.5 py-1.5 text-slate-500 focus-within:ring-2 focus-within:ring-slate-900 sm:flex">
              <Search size={14} />
              <input
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Search"
              />
            </label>
            <button
              aria-label="Notifications"
              className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F4F5F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              <Bell size={15} />
              <i className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-1 flex-col px-4 py-3 md:px-6">
        <ActiveComponent />
      </main>
    </div>
  );
};

export default DashboardAnalytics;
