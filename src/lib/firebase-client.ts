const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIosBrowser() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

export async function requestFcmToken() {
  if (!window.isSecureContext) {
    throw new Error(
      "Trang phai chay bang HTTPS hoac localhost thi iPhone moi cho phep nhan thong bao.",
    );
  }

  if (isIosBrowser() && !isStandaloneApp()) {
    throw new Error(
      "iPhone can mo trang tu icon tren man hinh chinh. Hay bam Share > Add to Home Screen, sau do mo lai bang icon vua tao va bam Gui tin nhan.",
    );
  }

  if (!("Notification" in window)) {
    throw new Error(
      "Trinh duyet nay khong co Notification API. Tren iPhone, hay dung iOS 16.4+ va mo trang tu icon da Add to Home Screen.",
    );
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Trinh duyet khong ho tro Service Worker. Tren iPhone, hay mo trang tu icon da Add to Home Screen.",
    );
  }

  const firebaseApp = await import("firebase/app");
  const firebaseMessaging = await import("firebase/messaging");

  if (!(await firebaseMessaging.isSupported())) {
    throw new Error(
      "Trinh duyet nay khong ho tro Firebase Messaging. Tren iPhone, hay dung iOS 16.4+ va mo trang tu icon da Add to Home Screen.",
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Nguoi dung chua cap quyen nhan thong bao.");
  }
  const app = firebaseApp.getApps().length
    ? firebaseApp.getApp()
    : firebaseApp.initializeApp(firebaseConfig);
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const token = await firebaseMessaging.getToken(
    firebaseMessaging.getMessaging(app),
    {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    },
  );

  if (!token) {
    throw new Error("Khong lay duoc FCM token.");
  }

  return token;
}
