import { Toast } from "@base-ui/react";
import { create } from "zustand";
import api from "../axios";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  adminNotifications: [],
  nextCursor: null,
  loading: false,
  fetchingMore: false,
  error: null,
  unreadCount: 0,

  syncFCMToken: async (fcmToken) => {
    try {
      const res = await api.patch(
        "/admin/saveAdminFcmToken",
        { fcmToken },
        { withAuth: true },
      );
      return res.data;
    } catch (error) {
      Toast.error(error?.response?.data?.message || "Failed to sync token");
      return;
    }
  },

  increaseUnreadCount: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  // --- NEW: Cursor Paginated Fetch ---
  getAdminToAdminNotification: async ({cursor = null,limit = 20,reset = false,} = {}) => {
    try {
      if (reset) {
        set({ loading: true, error: null });
      } else {
        set({ fetchingMore: true, error: null });
      }

      const res = await api.get("/admin/getAdminToAdminNoti", {
        withAuth: true,
        params: {
          limit,
          cursor: cursor || undefined,
        },
      });

      const newNotis = res.data?.notifications || [];
      const nextCursor = res.data?.nextCursor || null;

      set((state) => ({
        adminNotifications: reset
          ? newNotis
          : [...state.adminNotifications, ...newNotis],
        nextCursor,
        loading: false,
        fetchingMore: false,
      }));

      return newNotis;
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      set({
        loading: false,
        fetchingMore: false,
        error:
          error?.response?.data?.message || "Failed to fetch notifications",
      });
      return [];
    }
  },

  // --- NEW: Unified Status Update API ---
  changeAdminNotificationStatus: async ({
    ids = [],
    status,
    markAllRead = false,
  }) => {
    // 1. Optimistic UI Update (Update state instantly for a snappy UI)
    set((state) => {
      let updatedNotis = [...state.adminNotifications];

      if (markAllRead) {
        updatedNotis = updatedNotis.map((n) =>
          n.status === "SENT" || n.status === "PENDING"
            ? { ...n, status: "READ" }
            : n,
        );
      } else if (ids.length > 0) {
        updatedNotis = updatedNotis.map((n) =>
          ids.includes(n.id)
            ? { ...n, status: status, isDelete: status === "DEL" }
            : n,
        );
      }

      return { adminNotifications: updatedNotis };
    });

    // 2. Background API Call
    try {
      const res = await api.post(
        "/admin/changeAdminNotificationStatus",
        { ids, status, markAllRead },
        { withAuth: true },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update status:", error);
      Toast.error(
        error?.response?.data?.message ||
          "Failed to update notification status",
      );

      // If it fails, refresh the list to ensure the UI matches the database
      get().getAdminToAdminNotification({ reset: true });
      throw error;
    }
  },
}));
