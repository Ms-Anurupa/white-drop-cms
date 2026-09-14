/* eslint-disable no-useless-catch */

import { create } from "zustand";

import api from "../axios";

const specialOrderStore = create((set) => ({
  orders: [],

  specialOrder: {
    list: [],
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10,
    },
  },

  specialOrderDetails: null,

  // Listing API - NO reqId
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

  // View API -
  getSpecialOrderDetails: async (reqId) => {
    try {
      const res = await api.get("/admin/getSpecialOrderRequests", {
        withAuth: true,
        params: {
          reqId,
        },
      });

      const details = res.data?.data || null;

      set({
        specialOrderDetails: details,
      });

      return res.data;
    } catch (error) {
      console.error("Failed to fetch special order details:", error);

      set({
        specialOrderDetails: null,
      });

      throw error;
    }
  },
}));

export default specialOrderStore;
