import { create } from "zustand";
import api from "../axios";

const DEFAULT_FILTERS = {
    month: new Date().toISOString().slice(0, 7),
    type: "ALL",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
};

const DEFAULT_PAGINATION = {
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
};

const useDueRegisterStore = create((set, get) => ({
  rows: [],
  pagination: DEFAULT_PAGINATION,

  filters: DEFAULT_FILTERS,

  loading: false,
  syncing:false,
  error: null,

  fetchDueRegister: async (customFilters = {}) => {
    const currentFilters = {
      ...get().filters,
      ...customFilters,
    };

    set({
      loading: true,
      error: null,
      filters: currentFilters,
    });

    try {
      const response = await api.get("/admin/getDueRegisterListing", {
        params: {
          month: currentFilters.month,
          type: currentFilters.type,
          search: currentFilters.search?.trim() || undefined,
          page: currentFilters.page,
          limit: currentFilters.limit,
          sortBy: currentFilters.sortBy,
          sortOrder: currentFilters.sortOrder,
        },
        withAuth: true,
      });

      const data = response?.data?.data || [];
      const pagination = response?.data?.pagination || {};

      set({
        rows: data,
        pagination: {
          totalRecords: Number(pagination.totalRecords) || 0,
          totalPages: Number(pagination.totalPages) || 0,
          currentPage: Number(pagination.currentPage) || currentFilters.page,
          pageSize: Number(pagination.pageSize) || currentFilters.limit,
          hasNextPage: Boolean(pagination.hasNextPage),
          hasPrevPage: Boolean(pagination.hasPrevPage),
        },
        loading: false,
        error: null,
      });

      return response?.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch due register.";

      set({
        rows: [],
        pagination: {
          ...DEFAULT_PAGINATION,
          pageSize: currentFilters.limit,
        },
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  manuallySyncDues: async () => {
    try {
      set({ syncing: true });

      await api.get("/admin/manualDueSync", {
        withAuth: true,
      });

      set({syncing: false});

      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  setFilters: (values) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...values,
      },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      filters: {
        ...state.filters,
        page,
      },
    }));
  },

  setLimit: (limit) => {
    set((state) => ({
      filters: {
        ...state.filters,
        limit,
        page: 1,
      },
    }));
  },

  setMonth: (month) => {
    set((state) => ({
      filters: {
        ...state.filters,
        month,
        page: 1,
      },
    }));
  },

  setType: (type) => {
    set((state) => ({
      filters: {
        ...state.filters,
        type,
        page: 1,
      },
    }));
  },

  setSearch: (search) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search,
        page: 1,
      },
    }));
  },

  setSort: (sortBy) => {
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy,
        sortOrder:
          state.filters.sortBy === sortBy
            ? state.filters.sortOrder === "asc"
              ? "desc"
              : "asc"
            : "desc",
        page: 1,
      },
    }));
  },

  nextPage: () => {
    const { pagination } = get();

    if (!pagination.hasNextPage) return;

    set((state) => ({
      filters: {
        ...state.filters,
        page: state.filters.page + 1,
      },
    }));
  },

  previousPage: () => {
    const { pagination } = get();

    if (!pagination.hasPrevPage) return;

    set((state) => ({
      filters: {
        ...state.filters,
        page: Math.max(1, state.filters.page - 1),
      },
    }));
  },

  resetFilters: () => {
    set({
      filters: DEFAULT_FILTERS,
    });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));

export default useDueRegisterStore;
