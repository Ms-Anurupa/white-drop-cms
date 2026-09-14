import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import authStore from "../zustand/Store/authStore";
import SpecialOrderSidebar from "@/pages/specialOrderSidebar/SpecialOrderSidebar";

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
          shadow
          px-3
          sm:px-4
          md:px-6
          flex
          items-center
          justify-between
          relative
          z-40
        "
      >
        {/* Title */}
        <div className="min-w-0 flex-1">
          {/* 
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 truncate">
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
          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setNotificationOpen(true);
              setOpen(false);
            }}
            className="
              relative
              w-8
              h-8
              sm:w-9
              sm:h-9
              flex
              items-center
              justify-center
              rounded-full
              hover:bg-gray-100
              active:bg-gray-100
              text-gray-600
              transition
              cursor-pointer
              shrink-0
            "
          >
            <Bell size={18} className="sm:w-[19px] sm:h-[19px]" />

            {/* Notification dot */}
            <span
              className="
                absolute
                top-0.5
                right-0.5
                sm:top-1
                sm:right-1
                w-2
                h-2
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

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
                flex
                items-center
                justify-center
                text-blue-700
                font-semibold
                text-sm
                select-none
                cursor-pointer
                hover:bg-blue-200
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
                  border
                  border-gray-100
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
                    hover:bg-red-50
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
        <SpecialOrderSidebar
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
