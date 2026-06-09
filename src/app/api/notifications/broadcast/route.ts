import { addNotificationLog, listActiveDevices } from "@/lib/db-excel";
import { sendFcmToTokens } from "../../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      message?: string;
      url?: string;
    };

    if (!body.title || !body.message) {
      return Response.json(
        { error: "Title and message are required." },
        { status: 400 },
      );
    }

    const devices = listActiveDevices();
    const result = await sendFcmToTokens({
      tokens: devices.map((device) => device.token),
      title: body.title,
      body: body.message,
      url: body.url,
    });
    let log = null;
    let logError = "";
    try {
      log = addNotificationLog({
        target: "broadcast",
        deviceId: "",
        title: body.title,
        body: body.message,
        successCount: result.successCount,
        failureCount: result.failureCount,
        error: result.responses
          .map((response) => response.error?.message)
          .filter(Boolean)
          .join("; "),
      });
    } catch (error) {
      logError =
        error instanceof Error
          ? error.message
          : "Cannot save notification log.";
    }

    return Response.json({
      successCount: result.successCount,
      failureCount: result.failureCount,
      total: devices.length,
      log,
      logError,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Cannot send broadcast.",
      },
      { status: 500 },
    );
  }
}
