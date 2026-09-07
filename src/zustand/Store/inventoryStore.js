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
        inventoryLists: res.data?.data || [],
        inventoryMeta: res.data?.meta || null,
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

  createInventory: async (payload) => {
    try {
      const res = await api.post("/admin/createMilkInventory", payload, {
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
