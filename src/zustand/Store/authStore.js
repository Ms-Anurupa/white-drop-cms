/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../axios";

const authStore = create(
  persist((set) => ({
    user: null,
    authToken: null,

    //login
    adminLogin: async (loginData) => {
      // eslint-disable-next-line no-useless-catch
      try {
        // Using your api instance configured with custom headers/auth rules
        const res = await api.post("/admin/adminLogin", loginData, {
          withAuth: false,
        });
        console.log(res.data);
        const { userAdmin, access_token} = res.data;
        set({user: userAdmin, authToken: access_token})
        return res.data;
      } catch (error) {
        // throw error;
      }
    },
  })),
);

export default authStore;
