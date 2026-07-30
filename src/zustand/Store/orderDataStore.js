/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const orderDataStore = create((set) => ({
  orders: [],
  orderDetails: [],
  loading: false,

  getOrderListing: async (search, status) => {
    try {
      set({ loading: true });
      const res = await api.get("/admin/getOrderListing", {
        withAuth: true,
        params: { search, status },
      });

      set({
        orders: res.data?.data,
      });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getOrderById: async (id) => {
    try {
      const res = await api.get("/admin/getOrderById", {
        withAuth: true,
        params: { id },
      });

      set({
        orderDetails: res.data?.order,
      });
    } catch (error) {
      throw error;
    } 
  },


  associateOrderToDelPerson: async (payload) => {
    try {
      const res = await api.post("/admin/associateOrderToDelPerson", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  exportOrderDetails: async () => {
    try {
      const res = await api.get("/admin/exportOrderDetails", {
        withAuth: true,
        responseType: "blob",
      });
      return res.data;
    } catch {
      // throw error;
    }
  },
}));

export default orderDataStore;
