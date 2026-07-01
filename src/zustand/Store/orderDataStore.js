/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const orderDataStore = create((set) => ({
    orders: [],


    getAllOrders: async () => {
        try {
            const res = await api.get("/admin/getAllOrders", {
                withAuth: true,
            });

            set({
                orders: res.data?.orders,
            })
        } catch (error) {
            throw error;
        }
    }
}));

export default orderDataStore;