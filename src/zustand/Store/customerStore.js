/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const customerStore = create((set) => ({
    customers: [],

    getAllCustomers: async () => {
        try {
            const res = await api.get("/admin/getAllCustomers", {
                withAuth: true,
            })
            set({
                customers: res.data?.customers,
            })
        } catch (error) {
            throw error
        }
    }
}));

export default customerStore;