import { useState, useRef, useEffect } from "react";
import authStore from "../zustand/Store/authStore";
import { toast } from "react-toastify";

const Header = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const logOut = authStore((state) => state.logOut);

  const handleLogout = async () => {
    try {
      await logOut();
      console.log("logged out");

      localStorage.removeItem("token");
      window.location.href = "/";
    } catch {
      toast.error("LogOut Failed");
    }
  };

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white shadow px-3 sm:px-4 md:px-6 flex items-center justify-between relative">
      {/* Title */}
      <div className="min-w-0">
        {/* <h2 className="text-base sm:text-lg font-semibold text-gray-700 truncate">
          CMS Dashboard
        </h2> */}
      </div>

      {/* Right section */}
      <div
        className="flex items-center gap-2 sm:gap-4 shrink-0 relative"
        ref={dropdownRef}
      >
        {/* User info */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-700">Admin</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>

        {/* Avatar */}
        <div className="relative">
          <img
            src="https://i.pravatar.cc/40"
            alt="user"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer"
            onClick={() => setOpen(!open)}
          />

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
