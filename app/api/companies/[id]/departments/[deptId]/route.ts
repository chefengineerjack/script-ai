import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; deptId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id, deptId } = await params;
  const body = await request.json();
  const { name, head_count, location, role, pain_points } = body;

  const db = createServerClient();

  const { data, error } = await db
    .from("departments")
    .update({
      ...(name !== undefined && { name }),
      ...(head_count !== undefined && { head_count }),
      ...(location !== undefined && { location }),
      ...(role !== undefined && { role }),
      ...(pain_points !== undefined && { pain_points }),
    })
    .eq("id", deptId)
    .eq("company_id", id)
    .eq("user_id", user.email)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ department: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; deptId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id, deptId } = await params;
  const db = createServerClient();

  const { error } = await db
    .from("departments")
    .delete()
    .eq("id", deptId)
    .eq("company_id", id)
    .eq("user_id", user.email);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
