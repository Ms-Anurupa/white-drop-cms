/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const orderDataStore = create((set) => ({
    orders: [],


    getOrderListing: async () => {
        try {
            const res = await api.get("/admin/getOrderListing", {
                withAuth: true,
            });

            set({
                orders: res.data?.data,
            })
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
}));

export default orderDataStore;