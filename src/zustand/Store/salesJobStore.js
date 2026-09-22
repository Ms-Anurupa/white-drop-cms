import { create } from "zustand";
import api from "../axios";

const salesJobStore = create((set) => ({
    salesJobList: [],
    salesJobData: null,
    salesJobLoading: false,
    salesJobError: null,

    getSalesJobListing: async (params = {}) => {
        try {
            set({
                salesJobLoading: true,
                salesJobError: null,
            });

            const res = await api.get("/admin/getSalesJobListing", {
                params,
                withAuth: true,
            });

            set({
                salesJobList: res.data?.data || [],
                salesJobData: res.data || null,
                salesJobLoading: false,
            });

            return res.data;
        } catch (error) {
            set({
                salesJobLoading: false,
                salesJobError: error?.response?.data?.message || "Failed to fetch sales job listing",
            });

            throw error;
        }
    },

    clearSalesJobData: () => {
        set({
            salesJobList: [],
            salesJobData: null,
            salesJobError: null,
        });
    },
}));

export default salesJobStore;
