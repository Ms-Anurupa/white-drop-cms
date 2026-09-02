/* eslint-disable */
import { create } from "zustand";
import api from "../axios";

const inventoryStore = create((set) => ({
  inventoryLists: [],
  inventoryData: null,

  getInventoryListing: async () => {
    try {
      const res = await api.get("/admin/getMilkInventoryListing", {
        withAuth: true,
      });

      set({
        inventoryLists: res.data?.data || [],
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getMilkInventoryById: async (id) => {
    try {
      const res = await api.get("/admin/getMilkInventoryById", {
        params: {
          id,
        },
        withAuth: true,
      });

      const data = res.data?.inventory;

      set({
        inventoryData: data,
      });

      return data;
    } catch (error) {
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
