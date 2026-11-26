/* eslint-disable no-useless-catch */

import { create } from "zustand";
import api from "../axios";

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_FILTERS = {
  year: CURRENT_YEAR,
  month: null,
  week: null,
};

const createAnalyticsStore = ({ endpoint, fetchKey, errorLabel }) =>
  create((set, get) => ({
    labels: [],
    per: "month",
    rows: [],
    loading: false,

    filters: { ...DEFAULT_FILTERS },
    selectedCategory: null,
    compare: true,
    status: { type: null, message: "", errors: null },

    setFilters: (nextFilters) => {
      const updated =
        typeof nextFilters === "function"
          ? nextFilters(get().filters)
          : nextFilters;

      set({ filters: updated });
      get()[fetchKey](updated);
    },

    setSelectedCategory: (category) =>
      set((state) => ({
        selectedCategory:
          typeof category === "function"
            ? category(state.selectedCategory)
            : category,
      })),

    setCompare: (compare) =>
      set((state) => ({
        compare:
          typeof compare === "function" ? compare(state.compare) : compare,
      })),

    resetFilters: () => {
      const reset = { ...DEFAULT_FILTERS };
      set({ filters: reset, selectedCategory: null });
      get()[fetchKey](reset);
    },

    [fetchKey]: async (overrideFilters) => {
      const activeFilters = overrideFilters ?? get().filters;
      const params = {};

      if (activeFilters.year != null) params.year = activeFilters.year;
      if (activeFilters.month != null) params.month = activeFilters.month;
      if (activeFilters.week != null) params.week = activeFilters.week;

      set({ loading: true, status: { type: null, message: "", errors: null } });

      try {
        const response = await api.get(endpoint, {
          params,
          withAuth: true,
        });

        // Supports both `{ data: { labels, per, rows } }` and `{ labels, per, rows }`
        const result = response?.data?.data ?? response?.data;

        set({
          labels: Array.isArray(result?.labels) ? result.labels : [],
          per: result?.per || "month",
          rows: Array.isArray(result?.rows) ? result.rows : [],
        });

        return result;
      } catch (error) {
        const responseData = error.response?.data;
        console.error(`Failed to fetch ${errorLabel}:`, error);

        set({
          status: {
            type: "error",
            message:
              responseData?.message ||
              error.message ||
              `Failed to fetch ${errorLabel}.`,
            errors: responseData?.errors || null,
          },
        });

        throw error;
      } finally {
        set({ loading: false });
      }
    },

    resetStatus: () =>
      set({ status: { type: null, message: "", errors: null } }),
  }));

const productSaleStore = createAnalyticsStore({
  endpoint: "/admin/getProductAnalytics",
  fetchKey: "getProductAnalytics",
  errorLabel: "product sales",
});

export const expenseAnalyticsStore = createAnalyticsStore({
  endpoint: "/admin/getExpenseAnalytics",
  fetchKey: "getExpenseAnalytics",
  errorLabel: "expense analytics",
});

export const orderAnalyticsStore = createAnalyticsStore({
  endpoint: "/admin/getOrderAnalytics",
  fetchKey: "getOrderAnalytics",
  errorLabel: "order analytics",
});

export default productSaleStore;
