/* eslint-disable */
import { create } from "zustand";
import api from "../axios";
import authStore from "./authStore";

const productDataStore = create((set) => ({
  products: [],
  ProductData: [],
  ProductUnit: [],

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

  getAllProducts: async () => {
    try {
      const res = await api.get("/admin/getAllProducts", {
        withAuth: true,
      });
      set({ products: res.data?.allProductsList });
    } catch (error) {
      throw error;
    }
  },

  getProductById: async () => {
    try {
      const res = await api.get("/admin/getProductById", {
        withAuth: true,
      });
      set({ ProductData: res.data });
    } catch (error) {
      throw error;
    }
  },

  deleteProductById: async (payload) => {
    try {
      const res = await api.post("/admin/deleteProductById", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },


  hardDeleteProduct: async (payload) => {
    try {
      const res = await api.post("/admin/hardDeleteProduct", payload, {
        withAuth: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getProductUnit: async () => {
    try {
      const res = await api.get("/admin/getProductUnit", {
        withAuth: true,
      });
      set({ ProductUnit: res.data?.data });
    } catch  {
    }
  },

}));

export default productDataStore;
