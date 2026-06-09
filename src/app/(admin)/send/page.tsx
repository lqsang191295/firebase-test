"use client";

import { useEffect, useState } from "react";
import { Loader2, Radio, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = {
  id: string;
  name: string;
  token: string;
  active: boolean;
  platform: string;
  lastSeenAt: string;
};

type Log = {
  id: string;
  target: "broadcast" | "single";
  deviceId: string;
  title: string;
  body: string;
  successCount: number;
  failureCount: number;
  error: string;
  createdAt: string;
};

export default function SendPage() {
  const [mode, setMode] = useState<"broadcast" | "single">("broadcast");
  const [title, setTitle] = useState("Thong bao moi");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/");
  const [sending, setSending] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const activeDevices = devices.filter((device) => device.active);
  const selectedDevice = devices.find((device) => device.id === deviceId);

  async function loadLogs() {
    const response = await fetch("/api/notifications/logs", { cache: "no-store" });
    const data = await response.json();
    setLogs(data.logs || []);
  }

  async function loadDevices() {
    const response = await fetch("/api/devices", { cache: "no-store" });
    const data = await response.json();
    const nextDevices = data.devices || [];
    setDevices(nextDevices);
    setDeviceId((current) => current || nextDevices.find((device: Device) => device.active)?.id || "");
  }

  async function sendNotification() {
    if (!title.trim() || !message.trim()) return;
    if (mode === "single" && !deviceId) {
      alert("Hay chon mot mobile de gui rieng.");
      return;
    }

    setSending(true);
    const response = await fetch(
      mode === "single" ? "/api/notifications/single" : "/api/notifications/broadcast",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "single" ? { deviceId, title, message, url } : { title, message, url },
        ),
      },
    );
    const data = await response.json();
    setSending(false);
    if (!response.ok) {
      alert(data.error || "Gui thong bao that bai.");
      return;
    }
    const target = mode === "single" ? selectedDevice?.name || "1 mobile" : `${data.total} mobile`;
    const logWarning = data.logError ? `\nLuu y: ${data.logError}` : "";
    alert(
      `Da gui den ${target}: ${data.successCount} thanh cong, ${data.failureCount} loi.${logWarning}`,
    );
    setMessage("");
    loadLogs();
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/devices", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/notifications/logs", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([deviceData, logData]) => {
      if (cancelled) return;
      const nextDevices = deviceData.devices || [];
      setDevices(nextDevices);
      setDeviceId(nextDevices.find((device: Device) => device.active)?.id || "");
      setLogs(logData.logs || []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Gui thong bao</h1>
        <p className="text-sm text-muted-foreground">Gui den tat ca mobile active hoac rieng tung mobile.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium ${
                mode === "broadcast" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setMode("broadcast")}
              type="button"
            >
              <Radio className="size-4" />
              Tat ca
            </button>
            <button
              className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium ${
                mode === "single" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setMode("single")}
              type="button"
            >
              <Smartphone className="size-4" />
              Tung mobile
            </button>
          </div>

          {mode === "single" ? (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="device">
                  Mobile nhan tin
                </label>
                <button
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                  onClick={loadDevices}
                  type="button"
                >
                  Tai lai
                </button>
              </div>
              <select
                id="device"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
              >
                {activeDevices.length === 0 ? (
                  <option value="">Chua co mobile active</option>
                ) : (
                  activeDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.platform ? `- ${device.platform}` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : null}

          <label className="text-sm font-medium" htmlFor="title">
            Tieu de
          </label>
          <input
            id="title"
            className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="message">
            Noi dung
          </label>
          <textarea
            id="message"
            className="mt-2 min-h-36 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Nhap noi dung tin nhan"
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="url">
            URL khi click
          </label>
          <input
            id="url"
            className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/"
          />

          <Button className="mt-5 w-full" onClick={sendNotification} disabled={sending}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
            {mode === "single" ? "Gui rieng mobile nay" : "Gui cho tat ca active mobile"}
          </Button>
        </section>

        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Lich su gui</h2>
          </div>
          <div className="divide-y">
            {logs.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Chua co log gui tin.</p>
            ) : (
              logs.slice(0, 12).map((log) => (
                <div className="p-4" key={log.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{log.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{log.body}</p>
                    </div>
                    <span className="rounded bg-muted px-2 py-1 text-xs">{log.target}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()} -{" "}
                    {log.deviceId
                      ? devices.find((device) => device.id === log.deviceId)?.name || log.deviceId
                      : "Tat ca mobile"}{" "}
                    - OK {log.successCount}, Loi {log.failureCount}
                  </p>
                  {log.error ? <p className="mt-1 text-xs text-destructive">{log.error}</p> : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
