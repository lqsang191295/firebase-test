import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FCM Mobile Notification Manager",
    short_name: "FCM Notify",
    description: "Dang ky mobile de nhan thong bao Firebase Cloud Messaging.",
    start_url: "/register",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    icons: [
      {
        src: "/window.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
