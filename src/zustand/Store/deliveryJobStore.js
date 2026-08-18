/* eslint-disable */
import { create } from "zustand";
import api from "../axios";
import authStore from "./authStore";

const deliveryJobStore = create((set) => ({
  deliverySlots: [],
  deliveryJobs: [],

  createDeliveryJob: async (payload) => {
    try {
      const res = await api.post("/admin/createDeliveryJob", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  associateOrderToDeliveryJob: async (payload) => {
    try {
      const res = await api.post("/admin/associateOrderToDeliveryJob", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  assignDeliveryJob: async (payload) => {
    try {
      const res = await api.post("/admin/assignDeliveryJob", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getDeliveryJobs: async (id) => {
    try {
      const res = await api.get("/admin/getDeliveryJobs", {
        params: { id },
        withAuth: true,
      });

      set({ deliveryJobs: res.data?.data });
    } catch (error) {
      // console.log("products", error);
      throw error;
    }
  },

  getDeliverySlots: async () => {
    try {
      const res = await api.get("/admin/getDeliverySlots", {
        withAuth: true,
      });

      set({ deliverySlots: res.data?.deliverySlots });
    } catch (error) {
      // console.log("products", error);
      throw error;
    }
  },
}));

export default deliveryJobStore;
