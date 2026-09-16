import { create } from "zustand";
import api from "../axios";

export const PAGE_LIMIT = 10;

const expenseStore = create((set, get) => ({
    /* ---------------- listing ---------------- */
    expenses: [],
    pagination: {},
    meta: {},
    loading: false,
    error: null,

    filters: {
        page: 1,
        limit: PAGE_LIMIT,
        category: "",
        dateFilter: "",
        dateFrom: "",
        dateTo: "",
        search: "",
    },

    getExpenseListing: async () => {
        const { filters } = get();

        set({
            loading: true,
            error: null,
        });

        try {
            const { data } = await api.get("/admin/getExpenseListing", {
                params: filters,
                withAuth: true,
            });

            set({
                expenses: data?.data || [],
                pagination: data?.pagination || {},
                meta: data?.meta || {},
                loading: false,
            });

            return data;
        } catch (err) {
            set({
                loading: false,
                error:
                    err?.response?.data?.message || "Couldn't load expenses. Try again.",
            });

            throw err;
        }
    },

    setFilter: (key, value) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value,
                page: key === "page" ? value : 1,
            },
        })),

    setDateFilter: (dateFilter) =>
        set((state) => ({
            filters: {
                ...state.filters,
                dateFilter,
                dateFrom: dateFilter === "custom" ? state.filters.dateFrom : "",
                dateTo: dateFilter === "custom" ? state.filters.dateTo : "",
                page: 1,
            },
        })),

    setPage: (page) =>
        set((state) => ({
            filters: {
                ...state.filters,
                page,
            },
        })),

    resetFilters: () =>
        set({
            filters: {
                page: 1,
                limit: PAGE_LIMIT,
                category: "",
                dateFilter: "",
                dateFrom: "",
                dateTo: "",
                search: "",
            },
        }),

    /* ---------------- categories ---------------- */
    categories: [],
    categorySearch: "",
    categoryCursor: null,
    categoryHasMore: false,
    categoryLoading: false,

    getExpenseCategories: async ({ append = false } = {}) => {
        const { categorySearch, categoryCursor } = get();

        set({
            categoryLoading: true,
        });

        try {
            const { data } = await api.get("/admin/getExpenseCategories", {
              params: {
                limit: 10,
                ...(categorySearch.trim()
                  ? { search: categorySearch.trim() }
                  : {}),
                ...(append && categoryCursor ? { cursor: categoryCursor } : {}),
              },
              withAuth: true,
            });

            set((state) => ({
                categories: append ? [...state.categories, ...(data?.data || [])] : data?.data || [],
                categoryCursor: data?.meta?.nextCursor || null,
                categoryHasMore: !!data?.meta?.hasMore,
                categoryLoading: false,
            }));

            return data;
        } catch (err) {
            set({
                categoryLoading: false,
            });

            throw err;
        }
    },

    setCategorySearch: (categorySearch) =>
        set({
            categorySearch,
            categoryCursor: null,
        }),

    loadMoreCategories: () => {
        if (!get().categoryHasMore || get().categoryLoading) return;

        return get().getExpenseCategories({ append: true });
    },

    /* ---------------- create ---------------- */
    creating: false,

    createExpense: async (payload) => {
        set({
            creating: true,
        });

        try {
            const { data } = await api.post("/admin/createExpense", payload, {
              withAuth: true,
            });

            set({
                creating: false,
            });

            return {
                ok: true,
                data,
            };
        } catch (err) {
            set({
                creating: false,
            });

            return {
                ok: false,
                message: err?.response?.data?.message || "Couldn't save the expense. Check the fields and try again.",
            };
        }
    },
}));

export default expenseStore;
