import { useEffect, useRef, useState } from "react";

// --- 1. The Main Component ---
export function SplitButton({
  children,
  onClick,
  menuContent,
  variant = "primary",
  disabled = false,
  align = "right", // "right" | "left" — which edge the menu hangs from
  menuWidth = "w-48",
  label, // optional aria-label for the trigger, if children isn't plain text
  className = "", // width/spacing overrides for the outer wrapper, e.g. "w-36"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const close = () => setIsOpen(false);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape, return focus to the toggle
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
        toggleBtnRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Roving focus across menu items with arrow keys, focus first item on open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const items = () =>
      Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not(:disabled)'),
      );

    items()[0]?.focus();

    function handleKeyDown(event) {
      const list = items();
      const currentIndex = list.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        list[(currentIndex + 1) % list.length]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        list[(currentIndex - 1 + list.length) % list.length]?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        list[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        list[list.length - 1]?.focus();
      }
    }
    menuRef.current.addEventListener("keydown", handleKeyDown);
    const node = menuRef.current;
    return () => node.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const baseStyles =
    "inline-flex items-center justify-center px-2 py-2 text-sm font-medium transition-all duration-150 focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]";

  // The trigger grows to fill whatever width the wrapper is given, and
  // left-aligns its content — this is what keeps every row the same width
  // instead of each button hugging its own label length.
  const triggerStyles = "flex-1 justify-start truncate";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm",
    outline:
      "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 border shadow-sm",
  };

  const variantStyle = variants[variant] || variants.primary;

  const dividerStyle =
    variant === "outline"
      ? "border-l-transparent"
      : "border-l-blue-500/60 border-l";

  return (
    <div
      className={`relative inline-flex rounded-lg ${className}`}
      ref={dropdownRef}
    >
      {/* Left / Primary Action Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={`${baseStyles} ${triggerStyles} ${variantStyle} rounded-l-lg -mr-px`}
      >
        {children}
      </button>

      {/* Right / Dropdown Toggle Button */}
      <button
        ref={toggleBtnRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={`${baseStyles} ${variantStyle} ${dividerStyle} rounded-r-lg px-2.5`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open options</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute top-full ${
            align === "right"
              ? "right-0 origin-top-right"
              : "left-0 origin-top-left"
          } z-50 mt-2 ${menuWidth} max-h-72 overflow-y-auto rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 ease-out`}
        >
          {/* Clicking anywhere inside this div automatically closes the menu */}
          <div onClick={close}>{menuContent}</div>
        </div>
      )}
    </div>
  );
}

// --- 2. Helper Components for the Menu ---
export function SplitButtonItem({
  children,
  onClick,
  destructive = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-100 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
        destructive
          ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
          : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

export function SplitButtonLabel({ children }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

export function SplitButtonSeparator() {
  return <div className="my-1 h-px bg-gray-100" />;
}
