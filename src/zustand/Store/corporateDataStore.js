/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const corporateDataStore = create((set) => ({
  corporateData: [],
  corporateOrderAcc: [],
  corporateOrderLists: [],

  createCorporateOrderAdmin: async (payload) => {
    try {
      const res = await api.post("/admin/createCorporateOrderAdmin", payload, {
        withAuth: true,
    });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err
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
      throw err
    }
  },

   getCorporateAccounts: async ({status, search = "", page = 1, limit = 10, fromDate = "", toDate = "" }) => {
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


   getCorporateOrders: async ({status, search = "", page = 1, limit = 10, fromDate = "", toDate = "" }) => {
    try {
      const res = await api.get("/admin/getCorporateOrders", {
        withAuth: true,
        params: { search, status, page, limit, fromDate, toDate },
      });

      set({
        corporateOrderLists: res.data?.orders,
      });
    } catch (error) {
      throw error;
    } 
  },

   getCorporateInvoice: async (orderId) => {
    try {
      const res = await api.get("/admin/getCorporateInvoice", {
        params: {
          orderId,
        },
        withAuth: true,
        responseType: "blob", //for return pdf 
      });

      return res.data;
    } catch (error) {
      throw error;
    } 
  },

}));

export default corporateDataStore;
