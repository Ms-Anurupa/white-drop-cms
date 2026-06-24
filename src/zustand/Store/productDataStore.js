/* eslint-disable */
import { create } from "zustand";
import api from "../axios";
import authStore from "./authStore";

const productDataStore = create((set) => ({
  createProduct: async (formData) => {
    try {
      const res = await api.post("/admin/createProduct", formData, {
        withAuth: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default productDataStore;
