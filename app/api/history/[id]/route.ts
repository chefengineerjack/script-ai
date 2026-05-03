import { getUserFromRequest } from "@/app/lib/auth";
import { getHistoryEntry, deleteHistoryEntry } from "@/app/lib/history";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwtUser = await getUserFromRequest(request);
  if (!jwtUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 本人の履歴のみ削除可能
  const entry = await getHistoryEntry(id);
  if (!entry || entry.email !== jwtUser.email.toLowerCase()) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await deleteHistoryEntry(jwtUser.email, id);
  return Response.json({ success: true });
}
