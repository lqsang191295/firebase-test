import { listDevices, upsertDevice } from "@/lib/db-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ devices: listDevices() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot load devices." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      name?: string;
      userAgent?: string;
      platform?: string;
      language?: string;
      screen?: string;
      timezone?: string;
    };

    if (!body.token) {
      return Response.json({ error: "Token is required." }, { status: 400 });
    }

    console.log("body ======== ", body);

    const device = upsertDevice({
      token: body.token,
      name: body.name,
      userAgent: body.userAgent || request.headers.get("user-agent") || "",
      platform: body.platform,
      language: body.language,
      screen: body.screen,
      timezone: body.timezone,
    });

    console.log("device ======== ", device);

    return Response.json({ device }, { status: 201 });
  } catch (error) {
    console.log("error ======== ", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot save device." },
      { status: 500 },
    );
  }
}
