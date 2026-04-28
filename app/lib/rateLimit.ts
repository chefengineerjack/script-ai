import { Redis } from "@upstash/redis";

export const DAILY_LIMIT = 2;

// Upstash Redis クライアント（env未設定時はnull → メモリフォールバック）
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Redis未設定時（ローカル開発）のインメモリフォールバック
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
  if (redis) {
    try {
      const count = (await redis.get<number>(k)) ?? 0;
      return Math.max(0, DAILY_LIMIT - count);
    } catch {
      /* fallthrough to memory */
    }
  }
  return Math.max(0, DAILY_LIMIT - (mem.get(k) ?? 0));
}

/** 1回消費して残り回数と許可フラグを返す */
export async function checkAndConsume(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const k = `rl:${ip}:${dateKey()}`;
  let count: number;

  if (redis) {
    try {
      count = await redis.incr(k);
      // 初回のみTTLを48時間に設定（翌日の未使用キーを自動削除）
      if (count === 1) await redis.expire(k, 48 * 3600);
    } catch {
      count = (mem.get(k) ?? 0) + 1;
      mem.set(k, count);
    }
  } else {
    // Redis未設定（ローカル開発）はメモリで代替
    count = (mem.get(k) ?? 0) + 1;
    mem.set(k, count);
  }

  return {
    allowed: count <= DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
  };
}
