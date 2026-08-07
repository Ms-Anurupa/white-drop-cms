/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const corporateDataStore = create((set) => ({
  corporateData: [],
  corporateOrderAcc: [],
  corporateOrderLists: [],
  corporateOrderPagination: [],
  currentCorporateOrder: null,

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
    // console.log(id);

    try {
      const response = await api.get("/admin/getCorporateOrderById", {
        params: { corpoOrderId: id },
        withAuth: true,
      });

      return response.data?.corporateOrder;
    } catch (error) {
      console.error("Error fetching corporate order:", error);
      throw error;
    }
  },

  editCorporateOrderAdmin: async (payloadData) => {
    try {
      // 1. Send the data directly in req.body
      const res = await api.post(
        "/admin/editCorporateOrderAdmin",
        payloadData,
        {
          withAuth: true,
        },
      );

      const id = payloadData.corpOrderId;

      set((state) => ({
        currentCorporateOrder:
          state.currentCorporateOrder?.id === id
            ? res.data.data
            : state.currentCorporateOrder,
      }));

      return res.data.data;
    } catch (err) {
      console.error(
        "Error updating corporate order:",
        err.response?.data || err.message,
      );
      throw err;
    }
  },
}));

export default corporateDataStore;
