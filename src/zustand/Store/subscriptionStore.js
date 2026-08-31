
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
    dateFilter = "",
  } = {}) => {
    try {
      set({ subscriptionLoading: true });

      const params = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (paymentMode) params.paymentMode = paymentMode;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (dateFilter) params.dateFilter = dateFilter;

      const res = await api.get("/admin/getSubscriptionListing", {
        params,
        withAuth: true,
      });

      set({
        subscriptionLists: res.data?.data || [],
        subscriptionPagination: res.data?.meta ||  null,
        subscriptionLoading: false,
      });

      return res.data;
    } catch (error) {
      set({ subscriptionLoading: false });
      throw error;
    }
  },
}));

export default subscriptionStore;
