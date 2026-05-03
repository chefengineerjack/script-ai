import { getUserFromRequest } from "@/app/lib/auth";
import { getHistoryList } from "@/app/lib/history";

export async function GET(request: Request) {
  const jwtUser = await getUserFromRequest(request);
  if (!jwtUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getHistoryList(jwtUser.email);
  return Response.json({ entries });
}
