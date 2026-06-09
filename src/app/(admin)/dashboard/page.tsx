"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = { id: string; active: boolean };
type Log = { id: string; successCount: number; failureCount: number };

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const activeCount = useMemo(() => devices.filter((device) => device.active).length, [devices]);
  const successCount = useMemo(
    () => logs.reduce((total, log) => total + Number(log.successCount || 0), 0),
    [logs],
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/devices", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/notifications/logs", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([deviceData, logData]) => {
      setDevices(deviceData.devices || []);
      setLogs(logData.logs || []);
    });
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Tong quan he thong push notification.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Tong mobile" value={devices.length} icon={<Smartphone className="size-5" />} />
        <Stat title="Mobile active" value={activeCount} icon={<Bell className="size-5" />} />
        <Stat title="Lan gui thanh cong" value={successCount} icon={<Send className="size-5" />} />
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold">Dang ky mobile moi</h2>
          <p className="text-sm text-muted-foreground">Mo trang public tren dien thoai de cap quyen FCM.</p>
        </div>
        <Button asChild>
          <Link href="/register" target="_blank">
            Mo /register
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
