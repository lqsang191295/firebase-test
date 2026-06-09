import { Button } from "@/components/ui/button";
import { Bell, Send, Smartphone } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <div className="mb-8 flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bell className="size-7" />
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-normal md:text-5xl">
          FCM Mobile Notification Manager
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Dang ky mobile, quan ly token trong file Excel va gui push
          notification bang Firebase Cloud Messaging.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              <Smartphone />
              Dang ky mobile
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              <Send />
              Vao admin
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
