// src/services/firebaseMessaging.js
import React from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';

import { firebaseConfig } from '@/firebaseConfig';
import { useNotificationStore } from '@/zustand/Store/useNotificationStore';


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Replace with the VAPID key generated from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Requests permission, registers the service worker, and generates the FCM token.
 */
export async function generateFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was denied.');
      return null;
    }

    // Register service worker explicitly to avoid registration scope conflicts
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error('Error generating FCM token:', error);
    return null;
  }
}

/**
 * Starts foreground message listener and pipes incoming notifications to Zustand and in-app toast.
 */
export function initializeForegroundListener() {
  return onMessage(messaging, (payload) => {
    console.log('[Foreground message received]:', payload);
    useNotificationStore.getState().increaseUnreadCount();
    useNotificationStore.getState().getAdminToAdminNotification({ reset: true });

    const title =
      payload?.notification?.title ||
      payload?.data?.title ||
      'New Notification';
    const body =
      payload?.notification?.body ||
      payload?.data?.body ||
      payload?.data?.message ||
      '';

    toast.info(
      React.createElement(
        'div',
        null,
        React.createElement('p', { className: 'font-semibold text-sm' }, title),
        body ? React.createElement('p', { className: 'text-xs opacity-90 mt-0.5' }, body) : null
      ),
      {
        toastId: payload?.messageId || undefined,
        autoClose: 5000,
        closeOnClick: true,
      }
    );
  });
}