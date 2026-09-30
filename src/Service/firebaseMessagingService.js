// src/services/firebaseMessaging.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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
 * Starts foreground message listener and pipes incoming notifications to Zustand.
 */
export function initializeForegroundListener() {
  return onMessage(messaging, (payload) => {
    console.log('[Foreground message received]:', payload);

    // Push into Zustand store
    useNotificationStore.getState().addNotification({
      title: payload.notification?.title || payload.data?.title || 'Notification',
      body: payload.notification?.body || payload.data?.body || '',
      data: payload.data,
    });
  });
}