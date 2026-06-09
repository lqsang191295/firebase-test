import { LayoutDashboard, Send, Smartphone } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Thiet bi", icon: Smartphone },
  { href: "/send", label: "Gui thong bao", icon: Send },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="border-b bg-card md:flex md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="border-b p-6">
          <h2 className="text-lg font-bold">FCM Admin</h2>
          <p className="text-xs text-muted-foreground">Push Notification Manager</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t p-4 md:block">
          <Link
            href="/register"
            target="_blank"
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Trang dang ky public
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
