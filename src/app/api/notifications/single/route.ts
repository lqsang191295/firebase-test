import { addNotificationLog, getDevice } from "@/lib/db-excel";
import { sendFcmToTokens } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      deviceId?: string;
      title?: string;
      message?: string;
      url?: string;
    };

    if (!body.deviceId || !body.title || !body.message) {
      return Response.json(
        { error: "Device id, title and message are required." },
        { status: 400 },
      );
    }

    const device = getDevice(body.deviceId);
    if (!device) {
      return Response.json({ error: "Device not found." }, { status: 404 });
    }

    if (!device.active) {
      return Response.json({ error: "Device is inactive." }, { status: 400 });
    }

    const result = await sendFcmToTokens({
      tokens: [device.token],
      title: body.title,
      body: body.message,
      url: body.url,
    });
    let log = null;
    let logError = "";
    try {
      log = addNotificationLog({
        target: "single",
        deviceId: device.id,
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
      logError = error instanceof Error ? error.message : "Cannot save notification log.";
    }

    return Response.json({
      successCount: result.successCount,
      failureCount: result.failureCount,
      log,
      logError,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot send notification." },
      { status: 500 },
    );
  }
}
