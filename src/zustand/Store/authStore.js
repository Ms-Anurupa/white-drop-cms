/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../axios";

const authStore = create(
  persist(
    (set) => ({
      user: null,
      authToken: null,
      verifiedUser: null,
      
      setVerifiedUser: (data) => {
        set({ verifiedUser: {
          name: data?.name,
          email: data?.email,
          otp: data?.otp,
        }})
      },

      clearVerificationUser : () => set({
        verifiedUser: null,
      }),

      //login
      adminLogin: async (loginData) => {
        // eslint-disable-next-line no-useless-catch
        try {
          // Using your api instance configured with custom headers/auth rules
          const res = await api.post("/admin/adminLogin", loginData, {
            withAuth: false,
          });
          console.log(res.data);
          const { admin, access_token } = res.data;
          const userData = {
            admin_id: admin.admin_id,
            first_name: admin.first_name,
            last_name: admin.last_name,
            email: admin.email,
            phone_number: admin.phone_number,
            privilege: admin.privilege,
            status: admin.status,
          };

          // store in zustand state
          set({
            user: userData,
            authToken: access_token,
          });

          // store in localStorage
          localStorage.setItem("admin_user", JSON.stringify(userData));
          localStorage.setItem("admin_token", access_token);
          localStorage.setItem("admin_privilege", admin.privilege);

          return res.data;
        } catch (error) {
          // throw error;
        }
      },

      sendOtp: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/otp/sendOtp", payload, {
            withAuth: false,
          });
          return res.data;
        } catch (error) {
          throw error;
        }
      },

      verifyOtp: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/otp/verifyOtp", payload, {
            withAuth: false,
          });
          return res.data;
        } catch (error) {
          throw error;
        }
      },

      adminRegister: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/admin/adminRegister", payload, {
            withAuth: true,
          });
          return res.data;
        } catch (error) {
          throw error;
        }
      },

      sendForgotPassOtp: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/auth/forgot-password", payload, {
            withAuth: false,
          });
          return res.data;
        } catch (error) {
          throw error;
        }
      },

      
      verifyForgotPassOtp: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/auth/verify-forgot-pasword-otp", payload, {
            withAuth: false,
          });
          set({
            verifiedUser: payload.email,
            otp: payload.otp,
          })
          return res.data;
        } catch (error) {
          throw error;
        }
      },


      resetPassword: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
          const res = await api.post("/auth/resetPassword", payload, {
            withAuth: false,
          });
          return res.data;
        } catch (error) {
          throw error;
        }
      },


      logOut: () => {
        set({ user: null, authToken: null });

        localStorage.removeItem("auth-storage");
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Clean practice: only persist session tokens
      partialize: (state) => ({ user: state.user, authToken: state.authToken, verifiedUser: state.verifiedUser, }),
    },
  ),
);

export default authStore;
