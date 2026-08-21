/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const customerStore = create((set) => ({
  customers: [],
  customerDetails: [],

  getAllCustomers: async ({ search = "", fromDate, toDate }) => {
    try {
      const res = await api.get("/admin/getAllCustomers", {
        params: {
          search,
          fromDate,
          toDate,
        },
        withAuth: true,
      });
      set({
        customers: res.data?.customers,
      });
    } catch (error) {
      throw error;
    }
  },

  getCustomerDetails: async (customerId) => {
    try {
      const res = await api.get("/admin/getCustomerDetails", {
        params: {
          customerId: customerId,
        },
        withAuth: true,
      });
      set({
        customerDetails: res.data?.customerDetails,
      });
    } catch (error) {
      throw error;
    }
  },

  exportCustomerDetails: async () => {
    try {
      const res = await api.get("/admin/exportCustomerDetails", {
        withAuth: true,
        responseType: "blob",
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));

export default customerStore;
