/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const corporateDataStore = create((set) => ({
  corporateData: [],
  corporateOrderAcc: [],
  corporateOrderLists: [],
  corporateOrderPagination: [],

  createCorporateOrderAdmin: async (payload) => {
    try {
      const res = await api.post("/admin/createCorporateOrderAdmin", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  createCorporateAccount: async (payload) => {
    try {
      const res = await api.post("/admin/addCorporateAccount", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  updateCorporateStatus: async (payload) => {
    try {
      const res = await api.post("/admin/updateCorporateStatus", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  addCorporateAccount: async (payload) => {
    try {
      const res = await api.post("/admin/addCorporateAccount", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  getCorporateAccounts: async ({
    status,
    search = "",
    page = 1,
    limit = 10,
    fromDate = "",
    toDate = "",
  }) => {
    try {
      const res = await api.get("/admin/getCorporateAccounts", {
        withAuth: true,
        params: { search, status, page, limit, fromDate, toDate },
      });

      set({
        corporateOrderAcc: res.data?.accounts,
      });
    } catch (error) {
      throw error;
    }
  },

  getCorporateOrders: async ({
    payStatus,
    deliStatus,
    search = "",
    page = 1,
    limit = 10,
    fromDate = "",
    toDate = "",
  }) => {
    try {
      const res = await api.get("/admin/getCorporateOrders", {
        withAuth: true,
        params: {
          search,
          payStatus,
          deliStatus,
          page,
          limit,
          fromDate,
          toDate,
        },
      });

      set({
        corporateOrderLists: res.data?.orders,
        corporateOrderPagination: res.data,
      });
    } catch (error) {
      throw error;
    }
  },

  getCorporateInvoice: async (orderId, regenerate = false) => {
    try {
      const res = await api.get("/admin/getCorporateInvoice", {
        params: {
          orderId,
          regenerate,
        },
        withAuth: true,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

    updateCorporateOrder: async (payload) => {
    try {
      const res = await api.post("/admin/updateCorporateOrder", payload, {
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },

  getCorporateOrderById: async (id) => {
    try {
      const res = await api.get("/admin/getCorporateOrderById", {
        params: {
          id: id,
        },
        withAuth: true,
      });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err;
    }
  },
}));

export default corporateDataStore;
