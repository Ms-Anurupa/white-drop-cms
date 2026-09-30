/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyA5tbGyKwmARmdTwzzYMKJzEHf2vc4T_2A",
  authDomain: "whitedrop-3df58.firebaseapp.com",
  projectId: "whitedrop-3df58",
  storageBucket: "whitedrop-3df58.firebasestorage.app",
  messagingSenderId: "562444610529",
  appId: "1:562444610529:web:7b6c9b558f16c1850640a0",
  measurementId: "G-4HRPPVV9VM",
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./icon-512.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
