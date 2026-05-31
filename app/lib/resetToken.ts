import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

// ローカル開発用フォールバック（Redis未設定時）
const mem = new Map<string, { email: string; expiresAt: number }>();

const TOKEN_TTL_SECONDS = 60 * 60; // 1時間
const PREFIX = "reset_token:";

export async function createResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const key = PREFIX + token;

  if (redis) {
    await redis.set(key, email.toLowerCase(), { ex: TOKEN_TTL_SECONDS });
  } else {
    mem.set(key, { email: email.toLowerCase(), expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000 });
  }

  return token;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const key = PREFIX + token;

  if (redis) {
    const email = await redis.get<string>(key);
    return email ?? null;
  }

  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mem.delete(key);
    return null;
  }
  return entry.email;
}

export async function deleteResetToken(token: string): Promise<void> {
  const key = PREFIX + token;
  if (redis) {
    await redis.del(key);
  } else {
    mem.delete(key);
  }
}
