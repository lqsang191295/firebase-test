importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js",
);

// Service Worker khong doc duoc NEXT_PUBLIC_* cua Next.js.
// Hay thay cac gia tri duoi day bang Firebase Web App config that cua ban.
firebase.initializeApp({
  apiKey: "AIzaSyC8sxeeUf7I3BGKAwkw6RLnUyAsz0lTO-o",
  authDomain: "send-mess-test.firebaseapp.com",
  projectId: "send-mess-test",
  storageBucket: "send-mess-test.firebasestorage.app",
  messagingSenderId: "311572677601",
  appId: "1:311572677601:web:040f17e0a11048321ac8a0",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Thong bao moi";
  const options = {
    body: payload.notification?.body || "",
    icon: "/window.svg",
    badge: "/window.svg",
    data: {
      url: payload.fcmOptions?.link || payload.data?.url || "/",
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
