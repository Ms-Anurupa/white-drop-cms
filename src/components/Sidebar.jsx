/* eslint-disable react-hooks/static-components */
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Factory,
  Boxes,
  Truck,
  Headset,
  HelpingHand,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/images/logo_nobg.png";

const menu = [
  { name: "Dashboard",         path: "/dashboard",        icon: LayoutDashboard, end: true },
  { name: "Product",           path: "product",           icon: Package },
  { name: "Customers",         path: "customer",          icon: Users },
  { name: "Orders",            path: "orders",            icon: ShoppingCart },
  { name: "Production",        path: "production",        icon: Factory },
  { name: "Inventory",         path: "inventory",         icon: Boxes },
  { name: "Deliveries",        path: "deliveries",        icon: Truck },
  { name: "Customer Helpline", path: "customerHelpLine",  icon: HelpingHand },
  { name: "Service Manager",           path: "support",           icon: Headset },
];

/* ─── shared link renderer ─────────────────────────────────────────────── */
const NavItem = ({ item, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-500 hover:bg-slate-100 hover:text-gray-900",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-150",
              isActive
                ? "bg-white/20"
                : "bg-slate-100 group-hover:bg-slate-200",
            ].join(" ")}
          >
            <Icon size={16} />
          </span>
          <span className="truncate">{item.name}</span>
        </>
      )}
    </NavLink>
  );
};

/* ─── main component ────────────────────────────────────────────────────── */
const Sidebar = ({onLogOut}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  /* inner sidebar body — reused for both desktop and mobile drawer */
  const SidebarBody = ({ onNavClick, onLogOut }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-100 shrink-0">
        <span className="w-7 h-7 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-20 object-contain" />
        </span>
        <span className="text-base font-semibold text-gray-900 tracking-tight">
          CMS <span className="text-blue-600">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Main menu
        </p>
        {menu.slice(0, 4).map((item) => (
          <NavItem key={item.path} item={item} onClick={onNavClick} />
        ))}

        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Operations
        </p>
        {menu.slice(4, 7).map((item) => (
          <NavItem key={item.path} item={item} onClick={onNavClick} />
        ))}

        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Help
        </p>
        {menu.slice(7).map((item) => (
          <NavItem key={item.path} item={item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Mobile Logout */}
    <div className="lg:hidden px-4 pb-3">
      <button
        onClick={onLogOut}
        className="w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
      >
        Logout
      </button>
    </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm select-none">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">Admin User</p>
            <p className="text-[11px] text-gray-400 truncate">admin@cms.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 cursor-pointer rounded-lg text-gray-500 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-base font-semibold text-gray-900 tracking-tight">
          CMS <span className="text-blue-600">Admin</span>
        </span>
      </div>

      {/* ── MOBILE DRAWER BACKDROP ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE DRAWER ───────────────────────────────────────────────── */}
      <div
        className={[
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100 shadow-xl",
          "transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute cursor-pointer top-3.5 right-3 p-1.5 rounded-lg text-gray-400 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarBody onNavClick={close} onLogOut={onLogOut}/>
      </div>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-white border-r border-slate-100 shrink-0">
        <SidebarBody onLogOut={onLogOut}/>
      </aside>
    </>
  );
};

export default Sidebar;