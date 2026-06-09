import { deleteDevice, getDevice, updateDevice } from "@/lib/db-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/devices/[id]">,
) {
  try {
    const { id } = await context.params;
    const device = getDevice(id);

    if (!device) {
      return Response.json({ error: "Device not found." }, { status: 404 });
    }

    return Response.json({ device });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot load device." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/devices/[id]">,
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      active?: boolean;
    };
    const device = updateDevice(id, {
      name: body.name,
      active: body.active,
    });

    if (!device) {
      return Response.json({ error: "Device not found." }, { status: 404 });
    }

    return Response.json({ device });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot update device." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/devices/[id]">,
) {
  try {
    const { id } = await context.params;
    const deleted = deleteDevice(id);

    if (!deleted) {
      return Response.json({ error: "Device not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Cannot delete device." },
      { status: 500 },
    );
  }
}
