/* eslint-disable no-useless-catch */

import { create } from "zustand";
import api from "../axios";

const adhocOrderStore = create((set) => ({
  orders: [],
  meta: {},
  loading: false,

  meta: {
    totalCount: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
  },
  status: { type: null, message: "", errors: null },

  getAdHocSaleListing: async (params) => {
    try {
      set({ loading: true });

      const response = await api.get("/admin/getAdHocSaleListing", {
        params,
        withAuth: true,
      });

      const result = response?.data?.data;

      set({
        orders: result?.list || [],
        meta: {
          ...result?.meta,
          ...result?.pagination,
        },
      });

      return result;
    } catch (error) {
      console.error("Failed to fetch adhoc sales:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createAdHocSale: async (payload) => {
    set({ loading: true, status: { type: null, message: "", errors: null } });
    try {
      const response = await api.post("/admin/createAdHocSale", payload, {
        withAuth: true,
      });
      const data = response.data;
      set({
        status: {
          type: "success",
          message: data.message || "Ad-hoc sale created successfully.",
          errors: null,
        },
      });
      return { success: true, data: data.data };
    } catch (error) {
      const responseData = error.response?.data;
      set({
        status: {
          type: "error",
          message:
            responseData?.message ||
            error.message ||
            "Failed to create ad-hoc sale.",
          errors: responseData?.errors || null,
        },
      });
      return { success: false, error: responseData };
    } finally {
      set({ loading: false });
    }
  },
  resetStatus: () => set({ status: { type: null, message: "", errors: null } }),
}));

export default adhocOrderStore;