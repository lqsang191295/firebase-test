import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { requestFcmToken } from "../../lib/firebase-client";

type Status = "idle" | "loading" | "success" | "error";

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    platform?: string;
  };
  standalone?: boolean;
};

export default function RegisterPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "Nhấn nút bên dưới để cho phép thiết bị này nhận thông báo.",
  );
  const [errorDetail, setErrorDetail] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [clientReady, setClientReady] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const lastRegisterAt = useRef(0);

  useEffect(() => {
    setClientReady(true);

    console.log("=== DEVICE INFO ===");
    console.log("UA:", navigator.userAgent);
    console.log("Secure:", window.isSecureContext);
    console.log("Notification API:", "Notification" in window);
    console.log("Service Worker:", "serviceWorker" in navigator);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithUserAgentData).standalone === true;

    console.log("Standalone:", isStandalone);

    if ("Notification" in window) {
      console.log("Permission:", Notification.permission);
    }
  }, []);

  function getMobileData() {
    const width = window.screen?.width || 0;
    const height = window.screen?.height || 0;

    const platform =
      (navigator as NavigatorWithUserAgentData).userAgentData?.platform ||
      navigator.platform ||
      "";

    return {
      name: platform ? `Mobile - ${platform}` : "Mobile",
      userAgent: navigator.userAgent,
      platform,
      language: navigator.language || "",
      screen: width && height ? `${width}x${height}` : "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };
  }

  async function handleRegisterClick() {
    if (status === "loading") {
      return;
    }

    const now = Date.now();

    if (now - lastRegisterAt.current < 1000) {
      return;
    }

    lastRegisterAt.current = now;

    setTapCount((v) => v + 1);

    await register();
  }

  async function register() {
    let step = "Khởi tạo";

    try {
      setStatus("loading");
      setErrorDetail("");

      setMessage("Trình duyệt sắp hiển thị yêu cầu cấp quyền thông báo...");

      console.log("=== START REGISTER ===");

      step = "Kiểm tra Notification API";

      if (!("Notification" in window)) {
        throw new Error("Thiết bị không hỗ trợ Notification API.");
      }

      console.log("Permission:", Notification.permission);

      step = "Lấy FCM token";

      const token = await requestFcmToken();

      console.log("FCM TOKEN:", token);

      if (!token) {
        throw new Error("Không lấy được FCM token.");
      }

      const mobileData = getMobileData();

      step = "Lưu thiết bị";

      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          ...mobileData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không lưu được thiết bị.");
      }

      setStatus("success");

      setDeviceName(data.device?.name || mobileData.name);

      if (data.device?.id) {
        localStorage.setItem("fcm-device-id", data.device.id);
      }

      setMessage(
        "Đăng ký thành công. Thiết bị đã sẵn sàng nhận thông báo FCM.",
      );
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : "Đăng ký thất bại.";

      setStatus("error");
      setMessage(errorMessage);

      setErrorDetail(
        [
          `Bước lỗi: ${step}`,
          "",
          `Message: ${errorMessage}`,
          "",
          `URL: ${window.location.href}`,
          "",
          `Secure Context: ${window.isSecureContext ? "Có" : "Không"}`,
          "",
          `Notification API: ${"Notification" in window ? "Có" : "Không"}`,
          "",
          `Permission: ${
            "Notification" in window ? Notification.permission : "N/A"
          }`,
          "",
          `Service Worker: ${"serviceWorker" in navigator ? "Có" : "Không"}`,
          "",
          `Standalone/PWA: ${
            window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as NavigatorWithUserAgentData).standalone === true
              ? "Có"
              : "Không"
          }`,
          "",
          `User Agent: ${navigator.userAgent}`,
        ].join("\n"),
      );
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-8">
          <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="size-6" />
          </div>

          <h1 className="text-3xl font-semibold">
            Nhận thông báo trên điện thoại
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Cho phép trình duyệt lưu thiết bị này để admin có thể gửi FCM.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex gap-3 rounded-lg bg-muted p-3">
            <ShieldCheck className="mt-0.5 size-5" />

            <p className="text-sm text-muted-foreground">
              Khi nhấn nút bên dưới, trình duyệt sẽ yêu cầu quyền thông báo và
              lưu FCM token.
            </p>
          </div>

          <button
            type="button"
            disabled={status === "loading"}
            onClick={handleRegisterClick}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground disabled:opacity-70"
            style={{
              touchAction: "manipulation",
            }}>
            {status === "loading" ? (
              <Loader2 className="animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 />
            ) : (
              <MessageCircle />
            )}

            {status === "loading" ? "Đang xử lý..." : "Cho phép thông báo"}
          </button>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            JS: {clientReady ? "Ready" : "Loading"} | Click: {tapCount}
          </p>

          <div
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              status === "error"
                ? "bg-destructive/10 text-destructive"
                : status === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-muted text-muted-foreground"
            }`}>
            {message}
          </div>

          {deviceName && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Thiết bị: {deviceName}
            </p>
          )}

          {errorDetail && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <TriangleAlert className="size-4" />
                Chi tiết lỗi
              </div>

              <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs">
                {errorDetail}
              </pre>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
