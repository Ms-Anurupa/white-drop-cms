import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function SplitButton({
  children,
  onClick,
  menuContent,
  variant = "primary",
  disabled = false,
  align = "right",
  menuWidth = "w-48",
  label,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // Check if there is actually any menu content
  const hasMenu = Boolean(menuContent);

  const close = () => {
    setIsOpen(false);
  };

  const getMenuWidth = () => {
    const widthMap = {
      "w-32": 128,
      "w-36": 144,
      "w-40": 160,
      "w-44": 176,
      "w-48": 192,
      "w-52": 208,
      "w-56": 224,
      "w-60": 240,
      "w-64": 256,
      "w-72": 288,
      "w-80": 320,
    };

    return widthMap[menuWidth] || 192;
  };

  const updateMenuPosition = () => {
    if (!toggleBtnRef.current) return;

    const rect = toggleBtnRef.current.getBoundingClientRect();

    const dropdownWidth = getMenuWidth();

    const gap = 8;
    const viewportPadding = 8;

    const top = rect.bottom + gap;

    let left = align === "right" ? rect.right - dropdownWidth : rect.left;

    // Prevent dropdown from going outside right edge
    if (left + dropdownWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - dropdownWidth - viewportPadding;
    }

    // Prevent dropdown from going outside left edge
    if (left < viewportPadding) {
      left = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  };

  // ============================================================
  // Close on outside click
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideButton = dropdownRef.current?.contains(event.target);

      const clickedInsideMenu = menuRef.current?.contains(event.target);

      if (!clickedInsideButton && !clickedInsideMenu) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // Close on Escape
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        close();

        toggleBtnRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ============================================================
  // Reposition dropdown on scroll / resize
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handlePositionUpdate = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handlePositionUpdate);

    window.addEventListener("scroll", handlePositionUpdate, true);

    return () => {
      window.removeEventListener("resize", handlePositionUpdate);

      window.removeEventListener("scroll", handlePositionUpdate, true);
    };
  }, [isOpen, align, menuWidth]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const getItems = () => {
      if (!menuRef.current) return [];

      return Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not(:disabled)'),
      );
    };

    const focusFirstItem = () => {
      const items = getItems();

      if (items.length > 0) {
        items[0]?.focus();
      }
    };

    const animationFrame = requestAnimationFrame(focusFirstItem);

    const handleKeyDown = (event) => {
      const items = getItems();

      if (!items.length) return;

      const currentIndex = items.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();

        const nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;

        items[nextIndex]?.focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        const previousIndex =
          currentIndex < 0
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;

        items[previousIndex]?.focus();
      }

      if (event.key === "Home") {
        event.preventDefault();

        items[0]?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();

        items[items.length - 1]?.focus();
      }
    };

    menuRef.current.addEventListener("keydown", handleKeyDown);

    const currentMenu = menuRef.current;

    return () => {
      cancelAnimationFrame(animationFrame);

      currentMenu?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ============================================================
  // Styles
  // ============================================================

  const baseStyles =
    "inline-flex items-center justify-center px-2 py-2 text-sm font-medium transition-all duration-150 focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]";

  const triggerStyles = "flex-1 min-w-0 justify-start truncate";

  const variants = {
    primary:
      "border border-zinc-900 bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",

    outline:
      "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
  };

  const variantStyle = variants[variant] || variants.primary;

  const dividerStyle =
    variant === "outline"
      ? "border-l-zinc-200 dark:border-l-zinc-700"
      : "border-l-zinc-700 dark:border-l-zinc-300";

  return (
    <div
      ref={dropdownRef}
      className={`relative z-[100] inline-flex min-w-0 max-w-full rounded-lg ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        // Conditionally apply rounding. If no menu, fully rounded.
        className={`${baseStyles} ${triggerStyles} ${variantStyle} ${
          hasMenu ? "rounded-l-lg -mr-px" : "rounded-lg"
        }`}
      >
        {children}
      </button>

      {/* ======================================================
          DROPDOWN TOGGLE (Only renders if menuContent exists)
      ======================================================= */}

      {hasMenu && (
        <button
          ref={toggleBtnRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!isOpen) {
              updateMenuPosition();
            }

            setIsOpen((value) => !value);
          }}
          className={`${baseStyles} ${variantStyle} ${dividerStyle} shrink-0 rounded-r-lg px-2.5`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Open options"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* RENDER PORTAL ONLY IF OPEN AND MENU EXISTS */}
      {isOpen &&
        hasMenu &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className={`
              fixed
              z-[999999]
              ${menuWidth}
              max-w-[calc(100vw-16px)]
              overflow-hidden
              rounded-lg
              border
              border-zinc-200
              bg-white
              p-1
              shadow-2xl
              ring-1
              ring-black/5
              animate-in
              fade-in
              zoom-in-95
              slide-in-from-top-1
              duration-150
              ease-out
              focus:outline-none
              dark:border-zinc-700
              dark:bg-zinc-950
              dark:ring-white/10
            `}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <div className="w-full" onClick={close}>
              {menuContent}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

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
      className={`
        flex
        w-full
        min-w-0
        items-center
        gap-2
        rounded-md
        px-2.5
        py-2
        text-sm
        font-medium
        outline-none
        transition-colors
        duration-100
        cursor-pointer
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          destructive
            ? `
              text-red-600
              hover:bg-red-50
              focus:bg-red-50
              dark:text-red-400
              dark:hover:bg-red-950/40
              dark:focus:bg-red-950/40
            `
            : `
              text-zinc-700
              hover:bg-zinc-100
              focus:bg-zinc-100
              hover:text-zinc-950
              dark:text-zinc-300
              dark:hover:bg-zinc-800
              dark:focus:bg-zinc-800
              dark:hover:text-zinc-100
            `
        }
      `}
    >
      {children}
    </button>
  );
}

export function SplitButtonLabel({ children }) {
  return (
    <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
      {children}
    </div>
  );
}

export function SplitButtonSeparator() {
  return <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />;
}