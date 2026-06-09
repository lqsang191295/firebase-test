import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getServiceAccountPrivateKey() {
  const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (
    privateKey.includes("...") ||
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY chua dung. Hay copy private_key that tu Firebase service account JSON vao .env.local.",
    );
  }

  return privateKey;
}

function getServiceAccountClientEmail() {
  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");

  if (!clientEmail.includes(".iam.gserviceaccount.com")) {
    throw new Error(
      "FIREBASE_CLIENT_EMAIL phai la client_email trong Firebase service account JSON, khong phai email dang nhap Firebase.",
    );
  }

  return clientEmail;
}

export function getAdminMessaging() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: requiredEnv("FIREBASE_PROJECT_ID"),
        clientEmail: getServiceAccountClientEmail(),
        privateKey: getServiceAccountPrivateKey(),
      }),
    });
  }

  return getMessaging();
}

export async function sendFcmToTokens(input: {
  tokens: string[];
  title: string;
  body: string;
  url?: string;
}) {
  if (!input.tokens.length) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  const message: MulticastMessage = {
    tokens: input.tokens,
    notification: {
      title: input.title,
      body: input.body,
    },
    webpush: {
      fcmOptions: {
        link: input.url || "/",
      },
      notification: {
        icon: "/window.svg",
        badge: "/window.svg",
      },
    },
  };

  return getAdminMessaging().sendEachForMulticast(message);
}
