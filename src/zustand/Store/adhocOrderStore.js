/* eslint-disable no-useless-catch */

import { create } from "zustand";
import api from "../axios";

const adhocOrderStore = create((set) => ({
  orders: [],

  loading: false,

  meta: {
    totalCount: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
  },

  getAdHocSaleListing: async ({
    search = "",
    page = 1,
    limit = 10,
    dateFilter = "",
    startDate = "",
    endDate = "",
  } = {}) => {
    try {
      set({ loading: true });

      const res = await api.get("/admin/getAdHocSaleListing", {
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

      const responseData = res?.data?.data || {};

      const list = Array.isArray(responseData?.list)
        ? responseData.list
        : [];

      const pagination = responseData?.pagination || {};
      const summary = responseData?.meta || {};

      set({
        orders: list,

        meta: {
          totalCount: Number(pagination?.totalCount ?? 0),
          limit: Number(pagination?.limit ?? limit),
          offset: Number(pagination?.offset ?? (page - 1) * limit),
          hasMore: Boolean(pagination?.hasMore),

          today: Number(summary?.today ?? 0),
          yesterday: Number(summary?.yesterday ?? 0),
          thisWeek: Number(summary?.thisWeek ?? 0),
          thisMonth: Number(summary?.thisMonth ?? 0),
        },
      });

      return res?.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default adhocOrderStore;