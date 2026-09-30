import { Toast } from '@base-ui/react';
import { create } from 'zustand';
import api from '../axios';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  syncFCMToken: async (fcmToken) => {
    try {

      const res = await api.patch("/admin/saveAdminFcmToken", {fcmToken}, {
        withAuth: true, 
      });
      return res.data;
    } catch (error) {
      Toast.error(error)
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
}));