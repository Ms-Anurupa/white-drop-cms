
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import expenseStore from "../zustand/Store/expenseStore";

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
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
                    error
                        ? "border-red-300"
                        : "border-slate-200 hover:border-slate-300",
                    selected
                        ? "text-gray-900"
                        : "text-gray-400",
                ].join(" ")}
            >
                <span className="truncate">
                    {selected?.name || placeholder}
                </span>

                <ChevronDown
                    size={15}
                    className={[
                        "shrink-0 text-gray-400 transition-transform",
                        open ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}

            {open && (
                <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                        <Search
                            size={14}
                            className="shrink-0 text-gray-400"
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
                            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
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
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-500 hover:bg-slate-50",
                                ].join(" ")}
                            >
                                <span>All categories</span>

                                {!value && (
                                    <Check
                                        size={14}
                                        className="ml-auto text-blue-600"
                                    />
                                )}
                            </button>
                        )}

                        {categories.map((category) => {
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
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                                    <span className="truncate">
                                        {category.name}
                                    </span>

                                    {isSelected && (
                                        <Check
                                            size={14}
                                            className="shrink-0 text-blue-600"
                                        />
                                    )}
                                </button>
                            );
                        })}

                        {/* Loading */}
                        {loading && (
                            <div className="px-3 py-3 text-center text-xs text-gray-400">
                                Loading categories...
                            </div>
                        )}

                        {/* Empty */}
                        {!loading &&
                            categories.length === 0 && (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-sm text-gray-400">
                                        No categories found.
                                    </p>

                                    {search && (
                                        <p className="mt-1 text-xs text-gray-400">
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
                                className="w-full cursor-pointer border-t border-slate-100 px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
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
