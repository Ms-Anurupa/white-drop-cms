import { create } from "zustand";
import api from "../axios";

const customerStore = create((set) => ({
  customers: [],
  customerDetails: [],

  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },

  getAllCustomers: async ({
    search = "",
    page = 1,
    limit = 10,
    fromDate = "",
    toDate = "",
  } = {}) => {
    try {
      const res = await api.get("/admin/getAllCustomers", {
        params: {
          search,
          page,
          limit,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
        withAuth: true,
      });

      const responseData = res.data?.data ?? res.data;

      set({
        customers: responseData?.customers ?? [],
        pagination: responseData?.pagination ?? {},
      });

      return responseData;
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
