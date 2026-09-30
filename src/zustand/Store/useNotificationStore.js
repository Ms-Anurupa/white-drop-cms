import { Toast } from '@base-ui/react';
import { create } from 'zustand';
import api from '../axios';

export const useNotificationStore = create((set) => ({
  notifications: [],
  adminNotifications: [],
  unreadCount: 0,

  syncFCMToken: async (fcmToken) => {
    try {
      const res = await api.patch(
        "/admin/saveAdminFcmToken",
        { fcmToken },
        {
          withAuth: true,
        },
      );
      return res.data;
    } catch (error) {
      Toast.error(error);
      return;
    }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: Date.now(),
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          receivedAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  getAdminToAdminNotification: async () => {
    try {
      set({ loading: true, error: null });
      const res = await api.get("/admin/getAdminToAdminNoti", {
        withAuth: true,
      });

      set({
        adminNotifications: res.data?.notifications || [],
        loading: false,
      });

      return res.data?.notifications || [];
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      set({
        loading: false,
        error:
          error?.response?.data?.message || "Failed to fetch notifications",
      });
      return [];
    }
  },

  deleteAdminNotification: async (notiId) => {
    try {
      const res = await api.post(
        "/admin/deleteAdminNoti",
        { notiId },
        { withAuth: true },
      );

      set((state) => ({
        adminNotifications: state.adminNotifications.map((n) =>
          n.id === notiId ? { ...n, isDelete: res.data.result.isDelete } : n,
        ),
      }));

      return res.data;
    } catch (error) {
      console.error(error);
      set({
        error:
          error?.response?.data?.message || "Failed to delete notification",
      });
      throw error;
    }
  },
}));