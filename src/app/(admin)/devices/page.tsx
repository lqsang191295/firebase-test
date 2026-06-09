"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = {
  id: string;
  token: string;
  name: string;
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  lastSeenAt: string;
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");
  const [selected, setSelected] = useState<Device | null>(null);
  const [title, setTitle] = useState("Thong bao moi");
  const [message, setMessage] = useState("");
  const activeCount = useMemo(() => devices.filter((device) => device.active).length, [devices]);

  async function loadDevices() {
    setLoading(true);
    const response = await fetch("/api/devices", { cache: "no-store" });
    const data = await response.json();
    setDevices(data.devices || []);
    setLoading(false);
  }

  async function toggleDevice(device: Device) {
    const response = await fetch(`/api/devices/${device.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !device.active }),
    });
    if (response.ok) loadDevices();
  }

  async function deleteDevice(device: Device) {
    if (!confirm(`Xoa ${device.name}?`)) return;
    const response = await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
    if (response.ok) loadDevices();
  }

  async function sendSingle() {
    if (!selected || !title.trim() || !message.trim()) return;
    setSendingId(selected.id);
    const response = await fetch("/api/notifications/single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: selected.id, title, message }),
    });
    const data = await response.json();
    setSendingId("");
    if (!response.ok) {
      alert(data.error || "Gui that bai.");
      return;
    }
    const logWarning = data.logError ? `\nLuu y: ${data.logError}` : "";
    alert(`Da gui: ${data.successCount} thanh cong, ${data.failureCount} loi.${logWarning}`);
    setSelected(null);
    setMessage("");
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/devices", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setDevices(data.devices || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quan ly mobile</h1>
          <p className="text-sm text-muted-foreground">
            {devices.length} thiet bi, {activeCount} dang active
          </p>
        </div>
        <Button variant="outline" onClick={loadDevices} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Tai lai
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Thiet bi</th>
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Trang thai</th>
                <th className="px-4 py-3 font-medium">Lan cuoi</th>
                <th className="px-4 py-3 text-right font-medium">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                    Dang tai...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                    Chua co thiet bi nao dang ky.
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr className="border-b last:border-0" key={device.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{device.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {[device.platform, device.screen, device.language, device.timezone]
                          .filter(Boolean)
                          .join(" - ")}
                      </div>
                      <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {device.userAgent}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="block max-w-[220px] truncate rounded bg-muted px-2 py-1 text-xs">
                        {device.token}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`h-6 w-11 rounded-full p-0.5 transition ${
                          device.active ? "bg-emerald-600" : "bg-muted-foreground/30"
                        }`}
                        onClick={() => toggleDevice(device)}
                        aria-label="Toggle active"
                      >
                        <span
                          className={`block size-5 rounded-full bg-white transition ${
                            device.active ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Gui rieng"
                          onClick={() => setSelected(device)}
                        >
                          <Send />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          title="Xoa"
                          onClick={() => deleteDevice(device)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-20 flex items-end bg-black/30 p-4 md:items-center md:justify-center">
          <div className="w-full rounded-lg bg-background p-5 shadow-xl md:max-w-md">
            <h2 className="text-lg font-semibold">Gui rieng: {selected.name}</h2>
            <input
              className="mt-4 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Tieu de"
            />
            <textarea
              className="mt-3 min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Noi dung tin nhan"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Huy
              </Button>
              <Button onClick={sendSingle} disabled={sendingId === selected.id}>
                {sendingId === selected.id ? <Loader2 className="animate-spin" /> : <Send />}
                Gui
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
