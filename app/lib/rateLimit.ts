import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

const mem = new Map<string, number>();

export const FREE_DAILY_LIMIT = 2;   // フリープラン: 1日2回
export const GUEST_TOTAL_LIMIT = 1;  // 未ログイン: 合計1回

function dateKey(): string {
  return new Date().toISOString().split("T")[0]; // UTC "YYYY-MM-DD"
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  );
}

// ── Redis ヘルパー ─────────────────────────────────────────

async function kvGet(key: string): Promise<number> {
  if (redis) {
    try {
      return (await redis.get<number>(key)) ?? 0;
    } catch {
      /* fallthrough */
    }
  }
  return mem.get(key) ?? 0;
}

async function kvIncr(key: string, ttlSeconds?: number): Promise<number> {
  if (redis) {
    try {
      const n = await redis.incr(key);
      if (n === 1 && ttlSeconds) await redis.expire(key, ttlSeconds);
      return n;
    } catch {
      /* fallthrough */
    }
  }
  const n = (mem.get(key) ?? 0) + 1;
  mem.set(key, n);
  return n;
}

// ── ゲスト（未ログイン）────────────────────────────────────

/** ゲストの残り回数を取得（消費しない） */
export async function getGuestRemaining(guestToken: string): Promise<number> {
  const count = await kvGet(`guest:${guestToken}`);
  return Math.max(0, GUEST_TOTAL_LIMIT - count);
}

/** ゲストの制限チェック + 消費 */
export async function checkAndConsumeGuest(
  guestToken: string
): Promise<{ allowed: boolean; remaining: number }> {
  const k = `guest:${guestToken}`;
  const current = await kvGet(k);
  if (current >= GUEST_TOTAL_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  await kvIncr(k, 90 * 24 * 3600); // 90日TTL
  return { allowed: true, remaining: 0 }; // 使用後残り0
}

// ── フリープラン ───────────────────────────────────────────

/** フリープランの残り回数を取得（消費しない） */
export async function getFreeUserRemaining(email: string): Promise<number> {
  const count = await kvGet(`rl:user:${email}:${dateKey()}`);
  return Math.max(0, FREE_DAILY_LIMIT - count);
}

/** フリープランの制限チェック + 消費 */
export async function checkAndConsumeFreeUser(
  email: string
): Promise<{ allowed: boolean; remaining: number }> {
  const k = `rl:user:${email}:${dateKey()}`;
  const count = await kvIncr(k, 48 * 3600);
  const remaining = Math.max(0, FREE_DAILY_LIMIT - count);
  return { allowed: count <= FREE_DAILY_LIMIT, remaining };
}
