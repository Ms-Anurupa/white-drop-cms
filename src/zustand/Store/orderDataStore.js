/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const orderDataStore = create((set) => ({
  orders: [],
  orderDetails: [],
  loading: false,
  meta: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  },
  orderSummary: {
    allOrders: 0,
    todayOrders: 0,
    thisWeekOrders: 0,
    thisMonthOrders: 0,
  },

  getOrderListing: async ({
    status = "",
    search = "",
    page = 1,
    limit = 10,
    fromDate = "",
    toDate = "",
  } = {}) => {
    try {
      set({ loading: true });

      const res = await api.get("/admin/getOrderListing", {
        withAuth: true,
        params: {
          search,
          status,
          page,
          limit,
          fromDate,
          toDate,
        },
      });

      const { data = [], meta = {} } = res.data || {};

      const { summary = {}, ...paginationMeta } = meta;

      set({
        orders: data,

        meta: {
          totalItems: paginationMeta.totalItems ?? 0,
          totalPages: paginationMeta.totalPages ?? 0,
          currentPage: paginationMeta.currentPage ?? page,
          itemsPerPage: paginationMeta.itemsPerPage ?? limit,
        },

        orderSummary: {
          allOrders: summary.allOrders ?? 0,
          todayOrders: summary.todayOrders ?? 0,
          thisWeekOrders: summary.thisWeekOrders ?? 0,
          thisMonthOrders: summary.thisMonthOrders ?? 0,
        },
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

  updateOrderStatus: async (payload) => {
    try {
      const res = await api.post("/admin/updateOrderStatus", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getAssignableOrders: async ({ deliJobId }) => {
    try {
      set({ loading: true });
      const res = await api.get("/admin/getAssignableOrders", {
        withAuth: true,
        params: { deliJobId },
      });

      set({
        orders: res.data?.orders,
      });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default orderDataStore;
