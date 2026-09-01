/* eslint-disable */
import { create } from "zustand";
import api from "../axios";

const inventoryStore = create((set) => ({
  inventoryLists: [],

  getInventoryListing: async () => {
    try {
      const res = await api.get("/admin/getInventoryListing", {
        withAuth: true,
      });

      set({
        inventoryLists: res.data?.data,
      });
    } catch (error) {
      throw error;
    }
  },

  createInventory: async (payload) => {
    try {
      const res = await api.post("/admin/createInventory", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default inventoryStore;
