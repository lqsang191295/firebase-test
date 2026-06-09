import { listNotificationLogs } from "@/lib/db-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ logs: listNotificationLogs() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot load notification logs." },
      { status: 500 },
    );
  }
}
