import { useState, useRef, useEffect } from "react";

// --- 1. The Main Component ---
export function SplitButton({
  children,
  onClick,
  menuContent,
  variant = "primary",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared button styles
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

  // Visual variants (You can add "destructive", "secondary", etc. here)
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent",
    outline: "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 border",
  };

  const variantStyle = variants[variant] || variants.primary;
  
  // Subtle divider between the two buttons based on the variant
  const dividerStyle =
    variant === "outline" ? "border-l-transparent" : "border-l-blue-700 border-l";

  return (
    <div className="relative inline-flex rounded-md shadow-sm" ref={dropdownRef}>
      {/* Left / Primary Action Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`${baseStyles} ${variantStyle} rounded-l-md -mr-px`}
      >
        {children}
      </button>

      {/* Right / Dropdown Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseStyles} ${variantStyle} ${dividerStyle} rounded-r-md px-2`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open options</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Content */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Clicking anywhere inside this div automatically closes the menu */}
          <div onClick={() => setIsOpen(false)}>
            {menuContent}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 2. Helper Components for the Menu ---
export function SplitButtonItem({ children, onClick, destructive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${
        destructive ? "text-red-600 hover:text-red-700" : "text-gray-700 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

export function SplitButtonSeparator() {
  return <div className="my-1 h-px bg-gray-200" />;
}