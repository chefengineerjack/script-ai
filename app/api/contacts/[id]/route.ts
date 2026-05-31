import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, department, position, role, email, phone, notes, info_source } = body;

  const db = createServerClient();
  const { data, error } = await db
    .from("contacts")
    .update({
      ...(name !== undefined && { name }),
      ...(department !== undefined && { department: department || null }),
      ...(position !== undefined && { position: position || null }),
      ...(role !== undefined && { role: role || null }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(info_source !== undefined && { info_source }),
    })
    .eq("id", id)
    .eq("user_id", user.email)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ contact: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();

  const { error } = await db
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.email);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
