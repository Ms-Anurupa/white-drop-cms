import { useState, useRef, useEffect } from "react";
import authStore from "../zustand/Store/authStore";
import NotificationSidebar, { NotificationBell } from "./NotificationSideBar";
import ThemeToggle from "./ThemeToggle";

const Header = ({ onLogOut }) => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = authStore((state) => state.user);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return (
    <>
      <header
        className="
          h-14
          w-full
          bg-white
          dark:bg-slate-900
          border-b
          border-slate-200/70
          dark:border-slate-800
          shadow-sm
          px-3
          sm:px-4
          md:px-6
          flex
          items-center
          justify-between
          relative
          z-40
          transition-colors
        "
      >
        {/* Title */}
        <div className="min-w-0 flex-1">
          {/* 
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-slate-200 truncate">
            CMS Dashboard
          </h2> 
          */}
        </div>

        {/* Right section */}
        <div
          ref={dropdownRef}
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            md:gap-4
            shrink-0
            relative
          "
        >
          <ThemeToggle />
          <NotificationBell />

          {/* User Info */}
          <div
            className="
              hidden
              sm:block
              text-right
              min-w-0
              max-w-[180px]
              md:max-w-[240px]
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-gray-700
                dark:text-slate-200
                truncate
              "
              title={fullName}
            >
              {fullName || "User"}
            </p>

            <p
              className="
                text-xs
                text-gray-400
                dark:text-slate-400
                truncate
              "
              title={user?.email}
            >
              {user?.email || ""}
            </p>
          </div>

          {/* Avatar */}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="User menu"
              onClick={() => {
                setOpen((prev) => !prev);
                setNotificationOpen(false);
              }}
              className="
                w-8
                h-8
                sm:w-9
                sm:h-9
                rounded-full
                bg-blue-100
                dark:bg-blue-950/70
                flex
                items-center
                justify-center
                text-blue-700
                dark:text-blue-300
                font-semibold
                text-sm
                select-none
                cursor-pointer
                hover:bg-blue-200
                dark:hover:bg-blue-900/70
                transition
                focus:outline-none
              "
            >
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </button>

            {/* Logout Dropdown */}
            {open && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-2
                  w-36
                  sm:w-40
                  bg-white
                  dark:bg-slate-900
                  border
                  border-gray-100
                  dark:border-slate-800
                  rounded-lg
                  shadow-lg
                  overflow-hidden
                  z-50
                "
              >
                <button
                  type="button"
                  onClick={onLogOut}
                  className="
                    w-full
                    cursor-pointer
                    text-left
                    px-3
                    sm:px-4
                    py-2.5
                    text-sm
                    text-red-600
                    dark:text-red-400
                    hover:bg-red-50
                    dark:hover:bg-red-950/40
                    transition
                  "
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Sidebar */}
      {notificationOpen && (
        <NotificationSidebar
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
