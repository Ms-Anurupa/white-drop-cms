/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const deliveryPartnerStore = create((set) => ({
  partners: [],
  partnerDetails: [],

  getDeliveryPersons: async () => {
    try {
      const res = await api.get("/admin/getDeliveryPersons", {
        withAuth: true,
      });
      set({
        partners: res.data?.deliveryPartners,
      });
    } catch (error) {
      throw error;
    }
  },

  getDeliveryPersonById: async (deliveryPersonId) => {
    try {
      const res = await api.get("/admin/getDeliveryPersonById", {
        withAuth: true,
        params: { deliveryPersonId },
      });
      set({
        partnerDetails: res.data?.deliveryPerson,
      });
    } catch (error) {
      throw error;
    }
  },
}));

export default deliveryPartnerStore;
