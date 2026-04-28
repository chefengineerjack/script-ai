import { kv } from "@vercel/kv";

export const DAILY_LIMIT = 2;

// KV未設定時（ローカル開発）のインメモリフォールバック
const mem = new Map<string, number>();

/** UTC日付キー（0時リセット） */
function dateKey(): string {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/** リクエストからクライアントIPを取得 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  );
}

/** 今日の残り生成回数を返す（消費しない） */
export async function getRemainingCount(ip: string): Promise<number> {
  const k = `rl:${ip}:${dateKey()}`;
  try {
    const count = (await kv.get<number>(k)) ?? 0;
    return Math.max(0, DAILY_LIMIT - count);
  } catch {
    // KV未設定（ローカル開発）はメモリで代替
    return Math.max(0, DAILY_LIMIT - (mem.get(k) ?? 0));
  }
}

/** 1回消費して残り回数と許可フラグを返す */
export async function checkAndConsume(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const k = `rl:${ip}:${dateKey()}`;
  let count: number;

  try {
    count = await kv.incr(k);
    // 初回のみTTLを48時間に設定（翌日の未使用キーを自動削除）
    if (count === 1) await kv.expire(k, 48 * 3600);
  } catch {
    // KV未設定（ローカル開発）はメモリで代替
    count = (mem.get(k) ?? 0) + 1;
    mem.set(k, count);
  }

  return {
    allowed: count <= DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
  };
}
