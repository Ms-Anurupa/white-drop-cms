/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const deliveryPartnerStore = create((set) => ({
  partners: [],
  partnerDetails: [],
  loading: false,

  getDeliveryPersons: async () => {
    try {
      set({loading: true})
      const res = await api.get("/admin/getDeliveryPersons", {
        withAuth: true,
      });
      set({
        partners: res.data?.deliveryPersons,
      });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getDeliveryPersonById: async (deliveryPersonId) => {
    try {
      set({loading: true})
      const res = await api.get("/admin/getDeliveryPersonById", {
        withAuth: true,
        params: { deliveryPersonId },
      });
      set({
        partnerDetails: res.data?.deliveryPerson,
      });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default deliveryPartnerStore;
