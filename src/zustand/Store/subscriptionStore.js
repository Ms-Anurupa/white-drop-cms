/* eslint-disable */
import { create } from "zustand";
import api from "../axios";

const subscriptionStore = create((set) => ({
  subscriptionLists: [],
  subscriptionPagination: null,
  subscriptionLoading: false,

  getSubscriptionListing: async ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    paymentStatus = "",
    paymentMode = "",
    fromDate = "",
    toDate = "",
  } = {}) => {
    try {
      set({ subscriptionLoading: true });

      const params = {
        page,
        limit,
      };

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (paymentStatus) {
        params.paymentStatus = paymentStatus;
      }

      if (paymentMode) {
        params.paymentMode = paymentMode;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      const res = await api.get("/admin/getSubscriptionListing", {
        params,
        withAuth: true,
      });

      const responseData = res?.data || {};

      set({
        subscriptionLists: Array.isArray(responseData?.data)
          ? responseData.data
          : [],

        subscriptionPagination: responseData?.meta || null,

        subscriptionLoading: false,
      });

      return responseData;
    } catch (error) {
      set({
        subscriptionLoading: false,
      });

      throw error;
    }
  },

  updateSubStatus: async (payload) => {
    try {
      const res = await api.post("/admin/updateSubStatus", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default subscriptionStore;
