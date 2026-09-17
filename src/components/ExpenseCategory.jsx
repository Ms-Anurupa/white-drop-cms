import React, { useEffect, useState, useCallback } from "react";
import {
    Plus,
    Search,
    Loader2,
    Tag,
    FolderPlus,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import expenseStore from "../zustand/Store/expenseStore"; // Adjust path to your store

const ExpenseCategory = () => {
    const {
        categories,
        categorySearch,
        categoryHasMore,
        categoryLoading,
        creating,
        getExpenseCategories,
        setCategorySearch,
        loadMoreCategories,
        createExpenseCategory,
    } = expenseStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [formError, setFormError] = useState("");
    const [toast, setToast] = useState(null);

    // Initial load
    useEffect(() => {
        getExpenseCategories({ append: false });
    }, []);

    // Handle Search Input Change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setCategorySearch(query);
    };

    // Trigger API call on search change (Debounced effect)
    useEffect(() => {
        const timer = setTimeout(() => {
            getExpenseCategories({ append: false });
        }, 350);

        return () => clearTimeout(timer);
    }, [categorySearch]);

    // Toast Helper
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Submit Handler for New Category
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setFormError("Category name cannot be empty.");
            return;
        }

        setFormError("");
        const res = await createExpenseCategory({ name: newCategoryName.trim() });

        if (res.ok) {
            showToast("Category created successfully!");
            setNewCategoryName("");
            setIsModalOpen(false);
        } else {
            setFormError(res.message);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Toast Alert */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${toast.type === "success"
                            ? "bg-emerald-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <AlertCircle size={18} />
                    )}
                    {toast.message}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Expense Categories
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage and organize expense types for your accounting
                    </p>
                </div>

                <button
                    onClick={() => {
                        setFormError("");
                        setNewCategoryName("");
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow cursor-pointer"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Control Bar: Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <span className="text-xs text-gray-500 font-medium self-end sm:self-center">
                    Showing {categories.length} item(s)
                </span>
            </div>

            {/* Category List / Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {categoryLoading && categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="text-sm font-medium">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mb-3">
                            <FolderPlus size={24} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">
                            No categories found
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                            {categorySearch
                                ? `No results match "${categorySearch}". Try searching for something else.`
                                : "Get started by creating your first expense category."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.id || idx}
                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 capitalize">
                                            {cat.name}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More Button (Cursor Pagination) */}
                {categoryHasMore && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                        <button
                            onClick={loadMoreCategories}
                            disabled={categoryLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                        >
                            {categoryLoading && (
                                <Loader2 size={14} className="animate-spin" />
                            )}
                            {categoryLoading ? "Loading..." : "Load More Categories"}
                        </button>
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-semibold text-gray-900">
                                Create Expense Category
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-slate-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Office Supplies, Utilities, Travel"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    autoFocus
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {creating && <Loader2 size={14} className="animate-spin" />}
                                    {creating ? "Saving..." : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ChevronDownRightIcon = () => (
    <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition"
    />
);

export default ExpenseCategory;
