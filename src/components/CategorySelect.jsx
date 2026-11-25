
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import expenseStore from "../zustand/Store/expenseStore";
import { useLocation } from "react-router-dom";

const CategorySelect = ({
    value,
    onChange,
    placeholder = "Select category",
    allowClear = false,
    error = "",
}) => {
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    const categories = expenseStore((s) => s.categories);
    const search = expenseStore((s) => s.categorySearch);
    const hasMore = expenseStore((s) => s.categoryHasMore);
    const loading = expenseStore((s) => s.categoryLoading);

    const location = useLocation();
    const isCreateExpensePage = location.pathname.includes("create-expense");
    const visibleCategories = categories.filter((category) => {
      if (isCreateExpensePage && category.name?.toUpperCase() === "SALARY") {
        return false;
      }
      return true;
    });

    const getExpenseCategories = expenseStore(
        (s) => s.getExpenseCategories
    );

    const setCategorySearch = expenseStore(
        (s) => s.setCategorySearch
    );

    const loadMoreCategories = expenseStore(
        (s) => s.loadMoreCategories
    );

    const selected =
        categories.find((category) => category.id === value) || null;

    

    // Load categories and handle search
    useEffect(() => {
        const timer = setTimeout(
            () => {
                getExpenseCategories();
            },
            search ? 350 : 0
        );

        return () => clearTimeout(timer);
    }, [search, getExpenseCategories]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (
                boxRef.current &&
                !boxRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [open]);

    const pick = (category) => {
        onChange(
            category ? category.id : "",
            category || null
        );

        setOpen(false);
    };

    return (
        <div
            ref={boxRef}
            className="relative w-full"
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={[
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm transition-colors",
                    error
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                    selected
                        ? "text-gray-900 dark:text-slate-100"
                        : "text-gray-400 dark:text-slate-500",
                ].join(" ")}
            >
                <span className="truncate">
                    {selected?.name || placeholder}
                </span>

                <ChevronDown
                    size={15}
                    className={[
                        "shrink-0 text-gray-400 dark:text-slate-500 transition-transform",
                        open ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {open && (
                <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                        <Search
                            size={14}
                            className="shrink-0 text-gray-400 dark:text-slate-500"
                        />

                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setCategorySearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search categories"
                            className="w-full bg-transparent text-sm text-gray-700 dark:text-slate-200 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-56 overflow-y-auto py-1">
                        {allowClear && (
                            <button
                                type="button"
                                onClick={() => pick(null)}
                                className={[
                                    "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm",
                                    !value
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                        : "text-gray-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                                ].join(" ")}
                            >
                                <span>All categories</span>

                                {!value && (
                                    <Check
                                        size={14}
                                        className="ml-auto text-blue-600 dark:text-blue-400"
                                    />
                                )}
                            </button>
                        )}

                        {visibleCategories.map((category) => {
                            const isSelected =
                                category.id === value;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        pick(category)
                                    }
                                    className={[
                                        "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                                        isSelected
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                            : "text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
                                    ].join(" ")}
                                >
                                    <span className="truncate">
                                        {category.name}
                                    </span>

                                    {isSelected && (
                                        <Check
                                            size={14}
                                            className="shrink-0 text-blue-600 dark:text-blue-400"
                                        />
                                    )}
                                </button>
                            );
                        })}

                        {/* Loading */}
                        {loading && (
                            <div className="px-3 py-3 text-center text-xs text-gray-400 dark:text-slate-500">
                                Loading categories...
                            </div>
                        )}

                        {/* Empty */}
                        {!loading &&
                            categories.length === 0 && (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-sm text-gray-400 dark:text-slate-500">
                                        No categories found.
                                    </p>

                                    {search && (
                                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                                            Try a different search.
                                        </p>
                                    )}
                                </div>
                            )}

                        {/* Load more */}
                        {hasMore && !loading && (
                            <button
                                type="button"
                                onClick={loadMoreCategories}
                                className="w-full cursor-pointer border-t border-slate-100 dark:border-slate-800 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            >
                                Load more
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySelect;
