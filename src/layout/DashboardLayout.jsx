import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Factory,
  Boxes,
  Truck,
  Headset,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Product", path: "product", icon: Package },
  { name: "Customer", path: "customer", icon: Users },
  { name: "Orders", path: "orders", icon: ShoppingCart },
  { name: "Production", path: "production", icon: Factory },
  { name: "Inventory", path: "inventory", icon: Boxes },
  { name: "Deliveries", path: "deliveries", icon: Truck },
  { name: "Support", path: "support", icon: Headset },
];

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-2xl font-bold text-blue-600">CMS Admin</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `
                  flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-200 font-medium
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }
                  `
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-700">CMS Dashboard</h2>

          <div className="flex items-center gap-4">
            <img
              src="https://i.pravatar.cc/40"
              className="w-10 h-10 rounded-full"
              alt="user"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
