import { Redis } from "@upstash/redis";
import type { GenerateRequest, GenerateResult } from "@/app/types/generate";

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

export const FREE_HISTORY_LIMIT = 5;

export type HistoryEntry = {
  id: string;
  email: string;
  createdAt: number; // Unix timestamp (ms)
  inputs: GenerateRequest;
  result: GenerateResult;
};

const idxKey = (email: string) =>
  `history:idx:${email.toLowerCase()}`;
const dataKey = (id: string) => `history:data:${id}`;

/** 生成結果を保存。フリープランは最新5件を超えた分を古い順に削除 */
export async function saveHistory(
  email: string,
  plan: string,
  inputs: GenerateRequest,
  result: GenerateResult
): Promise<string | null> {
  if (!redis) return null;

  const id = crypto.randomUUID();
  const now = Date.now();

  const entry: HistoryEntry = {
    id,
    email: email.toLowerCase(),
    createdAt: now,
    inputs,
    result,
  };

  const idx = idxKey(email);

  await Promise.all([
    redis.set(dataKey(id), entry),
    redis.zadd(idx, { score: now, member: id }),
  ]);

  // フリープランは最新5件のみ保持
  if (plan === "free") {
    const count = await redis.zcard(idx);
    if (count > FREE_HISTORY_LIMIT) {
      const toRemove = (await redis.zrange(
        idx,
        0,
        count - FREE_HISTORY_LIMIT - 1
      )) as string[];
      if (toRemove.length > 0) {
        await Promise.all([
          redis.zrem(idx, ...toRemove),
          ...toRemove.map((oldId) => redis.del(dataKey(oldId))),
        ]);
      }
    }
  }

  return id;
}

/** 全履歴を新しい順で取得 */
export async function getHistoryList(email: string): Promise<HistoryEntry[]> {
  if (!redis) return [];

  const idx = idxKey(email);
  const ids = (await redis.zrange(idx, 0, -1, { rev: true })) as string[];
  if (!ids || ids.length === 0) return [];

  const entries = await Promise.all(
    ids.map((id) => redis.get<HistoryEntry>(dataKey(id)))
  );

  return entries.filter(Boolean) as HistoryEntry[];
}

/** 単一エントリを取得 */
export async function getHistoryEntry(
  id: string
): Promise<HistoryEntry | null> {
  if (!redis) return null;
  return redis.get<HistoryEntry>(dataKey(id));
}

/** 履歴エントリを削除 */
export async function deleteHistoryEntry(
  email: string,
  id: string
): Promise<void> {
  if (!redis) return;
  const idx = idxKey(email);
  await Promise.all([redis.zrem(idx, id), redis.del(dataKey(id))]);
}
