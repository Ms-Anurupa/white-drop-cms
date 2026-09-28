import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
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
  ChevronDown,
  HandCoins,
  ChartNoAxesGantt,
} from "lucide-react";
import logo from "../assets/images/logo_nobg.png";
import authStore from "../zustand/Store/authStore";

/* ------------------------------------------------------------------ */
/* Menu config: sections -> items -> optional children (dropdown)      */
/* ------------------------------------------------------------------ */

const sections = [
  {
    label: "Main menu",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      { name: "Product", path: "product", icon: Package },
      {
        name: "Expenses",
        key: "expenses",
        icon: HandCoins,
        children: [
          { name: "Expenses List", path: "expense" },
          {
            name: "Categories",
            path: "expense-category",
            icon: ChartNoAxesGantt,
          },
        ],
      },
      {
        name: "Orders",
        key: "orders",
        icon: ShoppingCart,
        children: [
          { name: "Mini Orders", path: "orders" },
          { name: "Subscription Orders", path: "subscription-orders" },
          { name: "Corporate Orders", path: "corporate-orders" },
          { name: "Adhoc Orders", path: "adhoc-orders" },
          { name: "Special Orders", path: "special-orders" },
        ],
      },
      {
        name: "Customers",
        key: "customers",
        icon: Users,
        children: [
          { name: "Customer List", path: "customer" },
          { name: "Corporate Accounts", path: "corporate-accounts" },
        ],
      },
    ],
  },

  {
    label: "Operations",
    items: [
      { name: "Sales", path: "sales", icon: LayoutDashboard },
      { name: "Due Register", path: "due-register", icon: LayoutDashboard },
      { name: "Inventory", path: "inventory", icon: Boxes },
      { name: "Packaging Job", path: "packaging-job", icon: PackageIcon },
    ],
  },
  {
    label: "Delivery",
    items: [
      {
        name: "Delivery",
        key: "delivery",
        icon: Truck,
        children: [
          { name: "Delivery Job", path: "delivery-job" },
          { name: "Delivery Tracking", path: "delivery-tracking" },
          { name: "Delivery Partner List", path: "deliveryPartners" },
        ],
      },
    ],
  },
  {
    label: "Offers",
    items: [
      {
        name: "Offers",
        key: "offers",
        icon: HelpingHand,
        children: [
          { name: "Offers", path: "offers" },
          { name: "Offer Type", path: "offerType" },
        ],
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        name: "Customer Helpline",
        path: "customerHelpLine",
        icon: HelpingHand,
      },
    ],
  },
];

const SIDEBAR_WIDTH = "w-60";
const SIDEBAR_WIDTH_COLLAPSED = "w-20";

/* Check if any active URL segment exactly matches or starts with the path prefix */
const matchesPath = (pathname, path) => {
  const cleanPath = path.replace(/^\//, "").toLowerCase();
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  // 1. Exact segment match (e.g., segment "expense" === path "expense")
  if (segments.includes(cleanPath)) {
    return true;
  }

  // 2. Sub-route match for multi-word paths (e.g. /dashboard/expense/create or /dashboard/createExpense)
  return segments.some((segment) => {
    // Prevent "expense-category" from matching "expense"
    if (segment.includes("-") && !cleanPath.includes("-")) {
      return false;
    }
    return segment === cleanPath || segment.startsWith(cleanPath);
  });
};

/* ------------------------------------------------------------------ */
/* Leaf link                                                           */
/* ------------------------------------------------------------------ */

const NavItem = ({ item, onClick, collapsed }) => {
  const Icon = item.icon;
  const { pathname } = useLocation();

  // Custom active state logic to cover sub-routes (e.g. createExpense)
  const isItemActive = (navLinkIsActive) => {
    if (navLinkIsActive) return true;
    if (item.end) return false;
    return matchesPath(pathname, item.path);
  };

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) => {
        const active = isItemActive(isActive);
        return [
          "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
          collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5",
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-500 hover:bg-slate-100 hover:text-gray-900",
        ].join(" ");
      }}
    >
      {({ isActive }) => {
        const active = isItemActive(isActive);
        return (
          <>
            <span
              className={[
                "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-white/20"
                  : "bg-slate-100 group-hover:bg-slate-200",
              ].join(" ")}
            >
              <Icon size={16} />
            </span>

            {!collapsed && <span className="truncate">{item.name}</span>}
          </>
        );
      }}
    </NavLink>
  );
};

/* ------------------------------------------------------------------ */
/* Child link inside a dropdown                                       */
/* ------------------------------------------------------------------ */

const SubNavItem = ({ item, onClick }) => {
  const { pathname } = useLocation();

  const isSubActive = (navLinkIsActive) => {
    if (navLinkIsActive) return true;
    return matchesPath(pathname, item.path);
  };

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => {
        const active = isSubActive(isActive);
        return [
          "flex items-center gap-3 rounded-lg py-2 pl-3 pr-3 text-sm transition-colors cursor-pointer",
          active
            ? "bg-blue-50 font-medium text-blue-700"
            : "text-gray-500 hover:bg-slate-100 hover:text-gray-900",
        ].join(" ");
      }}
    >
      {({ isActive }) => {
        const active = isSubActive(isActive);
        return (
          <>
            <span
              className={[
                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                active ? "bg-blue-600" : "bg-slate-300",
              ].join(" ")}
            />
            <span className="truncate">{item.name}</span>
          </>
        );
      }}
    </NavLink>
  );
};

/* ------------------------------------------------------------------ */
/* Group with dropdown                                                */
/* ------------------------------------------------------------------ */

const NavGroup = ({ item, collapsed, open, onToggle, onNavClick }) => {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const hasActiveChild = item.children.some((child) =>
    matchesPath(pathname, child.path),
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? item.name : undefined}
        aria-expanded={collapsed ? false : open}
        className={[
          "group w-full cursor-pointer flex items-center rounded-lg text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5",
          hasActiveChild
            ? collapsed
              ? "bg-blue-600 text-white shadow-sm"
              : "text-blue-700"
            : "text-gray-500 hover:bg-slate-100 hover:text-gray-900",
        ].join(" ")}
      >
        <span
          className={[
            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors",
            hasActiveChild && collapsed
              ? "bg-white/20"
              : hasActiveChild
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 group-hover:bg-slate-200",
          ].join(" ")}
        >
          <Icon size={16} />
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.name}</span>
            <ChevronDown
              size={15}
              className={[
                "shrink-0 transition-transform duration-200",
                open ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {!collapsed && (
        <div
          className={[
            "grid transition-all duration-200 ease-in-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="ml-[20px] mt-1 space-y-0.5 border-l border-slate-200 ">
              {item.children.map((child) => (
                <SubNavItem
                  key={child.path}
                  item={child}
                  onClick={onNavClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sidebar body (shared by drawer + desktop)                          */
/* ------------------------------------------------------------------ */

const SidebarBody = ({
  user,
  collapsed,
  onToggleCollapse,
  openGroups,
  onToggleGroup,
  onNavClick,
  onLogOut,
  isMobile = false,
}) => {
  const isCollapsed = collapsed && !isMobile;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div
        className={`h-14 flex items-center ${isCollapsed ? "justify-center" : "justify-between"
          } px-4 border-b border-slate-100 shrink-0`}
      >
        {!isCollapsed && (
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

        {isCollapsed && (
          <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
        )}

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {sections.map((section, index) => (
          <div key={section.label} className={index > 0 ? "pt-5" : ""}>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </p>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup
                    key={item.key}
                    item={item}
                    collapsed={isCollapsed}
                    open={!!openGroups[item.key]}
                    onToggle={() => onToggleGroup(item.key)}
                    onNavClick={onNavClick}
                  />
                ) : (
                  <NavItem
                    key={item.path}
                    item={item}
                    onClick={onNavClick}
                    collapsed={isCollapsed}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Mobile Logout */}
      {isMobile && (
        <div className="lg:hidden px-4 pb-3 shrink-0">
          <button
            type="button"
            onClick={onLogOut}
            className="w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {!isCollapsed && (
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
};

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */

const Sidebar = ({ onLogOut }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const user = authStore((state) => state.user);
  const { pathname } = useLocation();

  const close = () => setMobileOpen(false);

  /* Open the group that owns the current route */
  useEffect(() => {
    const active = {};
    sections.forEach((section) =>
      section.items.forEach((item) => {
        if (
          item.children &&
          item.children.some((child) => matchesPath(pathname, child.path))
        ) {
          active[item.key] = true;
        }
      }),
    );
    if (Object.keys(active).length) {
      setOpenGroups((prev) => ({ ...prev, ...active }));
    }
  }, [pathname]);

  /* Collapsing the rail hides dropdowns; expand again on click */
  const toggleGroup = (key) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const bodyProps = {
    user,
    collapsed,
    onToggleCollapse: () => setCollapsed((prev) => !prev),
    openGroups,
    onToggleGroup: toggleGroup,
    onLogOut,
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] h-14 bg-white border-b border-slate-100 flex items-center px-3 sm:px-4 gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 p-1.5 cursor-pointer rounded-lg text-gray-500 hover:bg-slate-100 active:bg-slate-100 transition-colors shrink-0"
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
          className="lg:hidden fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={[
          "lg:hidden fixed top-0 left-0 z-[80] h-[100dvh] w-[280px] max-w-[85vw]",
          "bg-white border-r border-slate-100 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={close}
          className="absolute cursor-pointer top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-slate-100 hover:text-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>

        <SidebarBody {...bodyProps} onNavClick={close} isMobile />
      </div>

      {/* Desktop Sidebar — fixed */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-40 flex-col h-screen bg-white border-r border-slate-100 transition-all duration-300 ${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH
          }`}
      >
        <SidebarBody {...bodyProps} />
      </aside>

      {/* Spacer keeps page content beside the fixed sidebar */}
      <div
        aria-hidden="true"
        className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH
          }`}
      />
    </>
  );
};

export default Sidebar;
