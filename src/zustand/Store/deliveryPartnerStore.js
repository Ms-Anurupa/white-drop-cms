/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const deliveryPartnerStore = create((set) => ({
  partners: [],
  partnerDetails: [],
  url: [],
  loading: false,

  getDeliveryPersons: async () => {
    try {
      set({ loading: true });
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
      set({ loading: true });
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

  getSignedUrl: async (fileName, folderName) => {
    try {
      const res = await api.get("/admin/getSignedUrl", {
        withAuth: true,
        params: { fileName, folderName },
      });
      set({
        url: res.data?.url,
      });
      return res.data?.url;
    } catch (error) {
      throw error;
    }
  },

  editDeliveryPersonById: async (formData) => {
    try {
      set({ loading: true });
      const res = await api.post("/admin/editDeliveryPersonById", formData, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },


  verifyDeliveryPersonDocs: async (payload) => {
    try {
      set({ loading: true });
      const res = await api.post("/admin/verifyDeliveryPersonDocs", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
}));

export default deliveryPartnerStore;
