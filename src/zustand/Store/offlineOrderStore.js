/* eslint-disable no-useless-catch */

import { create } from "zustand";
import api from "../axios";

const offlineOrderStore = create((set) => ({
  customers: [],
  activeSubPlans: [],
  searchMeta: {
    nextCursor: null,
    hasNextPage: false,
  },
  
  // Useful to hold the selected user in memory while the admin drops a pin or builds the cart
  selectedCustomer: null, 

  // --- UI HELPERS ---
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  clearCustomerSearch: () => set({ 
    customers: [], 
    searchMeta: { nextCursor: null, hasNextPage: false } 
  }),

  // --- API ACTIONS ---

  // 1. Search Offline Customers (Cursor Paginated)
  searchOfflineCustomers: async ({ searchTerm = "", cursor = null, limit = 10, loadMore = false } = {}) => {
    try {
      const res = await api.get("/admin/searchOfflineCustomers", {
        withAuth: true,
        params: {
          searchTerm,
          cursor,
          limit,
        },
      });

      const newCustomers = res.data?.data || [];
      const meta = res.data?.meta || { nextCursor: null, hasNextPage: false };

      set((state) => ({
        // If loading next page, append to existing list. Otherwise, replace list.
        customers: loadMore ? [...state.customers, ...newCustomers] : newCustomers,
        searchMeta: meta,
      }));

      return res.data;
    } catch (error) {
      console.error("Failed to search offline customers:", error);
      throw error;
    }
  },

  // 2. Create / Fetch Offline Customer
  createOfflineCustomer: async (payload) => {
    try {
      const res = await api.post(
        "/admin/createOfflineCustomer",
        payload,
        {
          withAuth: true,
        }
      );
      
      // Optionally auto-select the newly created/fetched customer
      if (res.data?.success && res.data?.user) {
         set({ selectedCustomer: res.data.user });
      }
      
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Add Offline Customer Address
  addOfflineCustomerAddress: async (payload) => {
    try {
      const res = await api.post(
        "/admin/addOfflineCustomerAddress",
        payload,
        {
          withAuth: true,
        }
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Create Offline Order
  createOfflineOrder: async (payload) => {
    try {
      const res = await api.post(
        "/admin/createOfflineOrder",
        payload,
        {
          withAuth: true,
        }
      );
      
      // Clear the selected customer from state after successful order creation
      if (res.data?.success) {
         set({ selectedCustomer: null });
      }

      return res.data;
    } catch (error) {
      throw error;
    }
  },
  fetchActiveSubPlans: async () => {
    try {
      const res = await api.get("/admin/getActiveSubPlans", {
        withAuth: true,
      });

      // Assuming your backend returns { success: true, data: [...] }
      const plans = res.data?.subPlans || [];
      
      set({ activeSubPlans: plans });
      return plans;
      
    } catch (error) {
      console.error("Failed to fetch active subscription plans:", error);
      throw error;
    }
  },

  getSubscriptionPricing: async (payload) => {
    try {
      const res = await api.post("/admin/getSubscriptionPricing", payload, {
        withAuth: true, 
      });
      return res.data; 
    } catch (error) {
      console.error("Failed to fetch subscription pricing:", error);
      throw error;
    }
  },

  createOfflineSubscription: async (payload) => {
    try {
      const res = await api.post("/admin/createOfflineSubscription", payload, {
        withAuth: true,
      });
      
      return res.data;
    } catch (error) {
      console.error("Failed to create offline subscription:", error);
      throw error;
    }
  },

}));

export default offlineOrderStore;