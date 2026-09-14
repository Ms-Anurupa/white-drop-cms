/* eslint-disable react-hooks/static-components */
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  ReceiptText,
  Factory,
  Boxes,
  Truck,
  HelpingHand,
  Headset,
  Menu,
  X,
  PackageCheck,
  PackageIcon,
  SquarePlus,
} from "lucide-react";
import logo from "../assets/images/logo_nobg.png";
import authStore from "../zustand/Store/authStore";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "Sales", path: "sales", icon: LayoutDashboard},
  { name: "Product", path: "product", icon: Package },
  { name: "Customers", path: "customer", icon: Users },
  { name: "Mini Orders", path: "orders", icon: ShoppingCart },
  {
    name: "Subscription Orders",
    path: "subscription-orders",
    icon: ShoppingCart,
  },
  {
    name: "Corporate Orders",
    path: "corporate-orders",
    icon: ClipboardList,
  },
  { name: "Adhoc Orders", path: "adhoc-orders", icon: SquarePlus },
  { name: "Special Orders", path: "special-orders", icon: SquarePlus },
  {
    name: "Corporate Accounts",
    path: "corporate-accounts",
    icon: ReceiptText,
  },
  { name: "Production", path: "production", icon: Factory },
  { name: "Inventory", path: "inventory", icon: Boxes },
  { name: "Packaging Job", path: "packaging-job", icon: PackageIcon },
  { name: "Delivery Job", path: "delivery-job", icon: Truck },
  { name: "Delivery Tracking", path: "delivery-tracking", icon: Truck },
  {
    name: "Delivery Partner List",
    path: "deliveryPartners",
    icon: PackageCheck,
  },
  { name: "Offers", path: "offers", icon: HelpingHand },
  { name: "Offer Type", path: "offerType", icon: HelpingHand },
  {
    name: "Customer Helpline",
    path: "customerHelpLine",
    icon: HelpingHand,
  },
  { name: "Service Manager", path: "support", icon: Headset },
];

const NavItem = ({ item, onClick, collapsed }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center rounded-lg text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5",
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
              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-white/20"
                : "bg-slate-100 group-hover:bg-slate-200",
            ].join(" ")}
          >
            <Icon size={16} />
          </span>

          {!collapsed && <span className="truncate">{item.name}</span>}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ onLogOut }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = authStore((state) => state.user);

  const close = () => {
    setMobileOpen(false);
  };

  const SidebarBody = ({ onNavClick, onLogOut, isMobile = false }) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div
        className={`h-14 flex items-center ${
          collapsed && !isMobile ? "justify-center" : "justify-between"
        } px-4 border-b border-slate-100 shrink-0`}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logo}
              alt="Logo"
              className="h-12 sm:h-14 w-auto object-contain shrink-0"
            />

            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              CMS
            </span>
          </div>
        )}

        {collapsed && !isMobile && (
          <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
        )}

        {!isMobile && (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden lg:flex cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Main menu
          </p>
        )}
        {menu.slice(0, 9).map((item) => (
          <NavItem
            key={item.path}
            item={item}
            onClick={onNavClick}
            collapsed={collapsed && !isMobile}
          />
        ))}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Operations
          </p>
        )}

        {menu.slice(9, 10).map((item) => (
          <NavItem
            key={item.path}
            item={item}
            onClick={onNavClick}
            collapsed={collapsed && !isMobile}
          />
        ))}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Delivery Executive Details
          </p>
        )}

        {menu.slice(10, 13).map((item) => (
          <NavItem
            key={item.path}
            item={item}
            onClick={onNavClick}
            collapsed={collapsed && !isMobile}
          />
        ))}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Offers
          </p>
        )}

        {menu.slice(13, 16).map((item) => (
          <NavItem
            key={item.path}
            item={item}
            onClick={onNavClick}
            collapsed={collapsed && !isMobile}
          />
        ))}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Help
          </p>
        )}

        {menu.slice(16, 24).map((item) => (
          <NavItem
            key={item.path}
            item={item}
            onClick={onNavClick}
            collapsed={collapsed && !isMobile}
          />
        ))}
      </nav>

      {/* Mobile Logout */}
      {isMobile && (
        <div className="lg:hidden px-4 pb-3 shrink-0">
          <button
            type="button"
            onClick={onLogOut}
            className="
              w-full
              cursor-pointer
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-2
              text-sm
              font-medium
              text-red-600
              hover:bg-red-100
              transition-colors
            "
          >
            Logout
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100">
        <div
          className={`flex items-center ${
            collapsed && !isMobile ? "justify-center" : "gap-3"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user?.first_name} {user?.last_name}
              </p>

              <p className="text-[11px] text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="
          lg:hidden
          fixed
          top-0
          left-0
          right-0
          z-[60]
          h-14
          bg-white
          border-b
          border-slate-100
          flex
          items-center
          px-3
          sm:px-4
          gap-3
        "
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="
            flex
            items-center
            justify-center
            w-9
            h-9
            p-1.5
            cursor-pointer
            rounded-lg
            text-gray-500
            hover:bg-slate-100
            active:bg-slate-100
            transition-colors
            shrink-0
          "
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <div className="flex items-center min-w-0">
          <span className="text-base font-semibold text-gray-900 tracking-tight truncate">
            CMS
          </span>

          <span className="text-base font-semibold text-blue-600 ml-1 truncate">
            {user?.first_name || ""}
          </span>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-[70]
            bg-black/30
            backdrop-blur-sm
          "
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={[
          "lg:hidden",
          "fixed",
          "top-0",
          "left-0",
          "z-[80]",
          "h-[100dvh]",
          "w-[280px]",
          "max-w-[85vw]",
          "bg-white",
          "border-r",
          "border-slate-100",
          "shadow-2xl",
          "transition-transform",
          "duration-300",
          "ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="
            absolute
            cursor-pointer
            top-3
            right-3
            z-10
            w-8
            h-8
            flex
            items-center
            justify-center
            rounded-lg
            text-gray-400
            hover:bg-slate-100
            hover:text-gray-700
            transition-colors
          "
          aria-label="Close menu"
        >
          <X size={19} />
        </button>

        <SidebarBody onNavClick={close} onLogOut={onLogOut} isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden
          lg:flex
          flex-col
          h-screen
          bg-white
          border-r
          border-slate-100
          shrink-0
          transition-all
          duration-300
          ${collapsed ? "w-20" : "w-60"}
        `}
      >
        <SidebarBody onLogOut={onLogOut} />
      </aside>
    </>
  );
};

export default Sidebar;
