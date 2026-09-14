/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const specialOrderStore = create((set) => ({
  orders: [],

  getSpecialOrderRequests: async ({
    search = "",
    page = 1,
    limit = 10,
    dateFilter = "",
    startDate = "",
    endDate = "",
  } = {}) => {
    try {
      const res = await api.get("/admin/getSpecialOrderRequests", {
        withAuth: true,
        params: {
          search,
          page,
          limit,
          dateFilter,
          startDate,
          endDate,
        },
      });

      set({
        specialOrder: {
          list: res.data?.data || [],
          pagination: res.data?.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: limit,
          },
        },
      });

      return res.data;
    } catch (error) {
      console.error("Failed to fetch special orders:", error);
      throw error;
    }
  },
}));

export default specialOrderStore;
