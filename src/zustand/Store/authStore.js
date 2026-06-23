/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../axios";

const authStore = create(
  persist((set) => ({
    user: null,
    authToken: null,
    loadingAction: null,

    //login
    login: async (loginData) => {
      set({ loadingAction: "login" });
      // eslint-disable-next-line no-useless-catch
      try {
        // Using your api instance configured with custom headers/auth rules
        const res = await api.post("/admin/adminLogin", loginData, {
          withAuth: false,
        });
        console.log(res.data);
      } catch (error) {
        throw error;
      }
    },
  })),
);

export default authStore;
