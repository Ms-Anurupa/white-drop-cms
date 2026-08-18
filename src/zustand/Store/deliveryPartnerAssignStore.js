/* eslint-disable */
import { create } from "zustand";
import api from "../axios";
import authStore from "./authStore";

const deliveryPartnerAssignStore = create((set) => ({
  deliveryJobs: [],

  getDeliveryJobs: async (id) => {
    try {
      const res = await api.get("/admin/getDeliveryJobs", {
        params: { id },
        withAuth: true,
      });

      set({ deliveryJobs: res.data });
    } catch (error) {
      // console.log("products", error);
      throw error;
    }
  },

}));

export default deliveryPartnerAssignStore;
