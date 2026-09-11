import { create } from "zustand";
import api from "../axios";

const inventoryStore = create((set) => ({
  inventoryLists: [],
  inventoryData: null,
  inventoryMeta: null,
  loading: false,

  getInventoryListing: async (params = {}) => {
    try {
      set({ loading: true });

      const res = await api.get("/admin/getMilkInventoryListing", {
        params,
        withAuth: true,
      });

      set({
        inventoryLists: res.data?.data?.list || [],
        inventoryMeta: {
          total: res.data?.data?.pagination?.totalCount || 0,
          summary: res.data?.data?.summary || {},
          totalPages: Math.ceil(
            (res.data?.data?.pagination?.totalCount || 0) /
              (params.limit || 10),
          ),
          page: params.page || 1,
        },
        loading: false,
      });

      return res.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  getMilkInventoryById: async (id) => {
    try {
      set({ loading: true });

      const res = await api.get("/admin/getMilkInventoryById", {
        params: { id },
        withAuth: true,
      });

      const data = res.data?.inventory;

      set({
        inventoryData: data,
        loading: false,
      });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // POST: /admin/createInvOpeningEntry
  createOpeningInventory: async (payload) => {
    try {
      const res = await api.post("/admin/createInvOpeningEntry", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT: /admin/updateInvClosingEntry
  updateInventoryClosingEntry: async (id, payload) => {
    try {
      const requestBody = payload.id ? payload : { id, ...payload };

      const res = await api.post("/admin/updateMilkClosingEntry", requestBody, {
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  clearInventoryData: () => {
    set({
      inventoryData: null,
    });
  },
}));

export default inventoryStore;
