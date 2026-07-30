/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const deliveryPartnerStore = create((set) => ({
  partners: [],
  partnerDetails: [],
  url: [],
  loading: false,
  creating: false,
  createError: null,

  createDeliveryAccount: async ({ phoneNo, firstName, lastName }) => {
    set({ creating: true, createError: null });
    try {
      const { data } = await api.post("/admin/createDeliveryAccount", {
        phoneNo,
        firstName,
        lastName,
      }, {withAuth: true});

      set((state) => ({
        creating: false,
        partners: [data.user, ...state.partners],
      }));

      return { success: true, user: data.user };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to create delivery account.";
      set({ creating: false, createError: message });
      return { success: false, message };
    }
  },
  getDeliveryPersons: async ({
    search = "",
    page = 1,
    limit = 8,
    fromDate = "",
    toDate = "",
  }) => {
    try {
      set({ loading: true });
      const res = await api.get("/admin/getDeliveryPersons", {
        params: { search, page, limit, fromDate, toDate },
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

  updateStatusDelPerson: async (payload) => {
    try {
      set({ loading: true });
      const res = await api.post("/admin/updateStatusDelPerson", payload, {
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
