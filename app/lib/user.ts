import { Redis } from "@upstash/redis";
import type { UserPlan } from "./auth";

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

// ローカル開発用フォールバック（Redis未設定時）
const mem = new Map<string, User>();

export type User = {
  email: string;
  passwordHash: string;
  plan: UserPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  const k = `user:${email.toLowerCase()}`;
  if (redis) {
    try {
      return await redis.get<User>(k);
    } catch {
      /* fallthrough */
    }
  }
  return mem.get(k) ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<User> {
  const user: User = {
    email: email.toLowerCase(),
    passwordHash,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  const k = `user:${user.email}`;
  if (redis) {
    try {
      await redis.set(k, user);
      return user;
    } catch {
      /* fallthrough */
    }
  }
  mem.set(k, user);
  return user;
}

/** プランを更新し、Stripe顧客IDの逆引きマップも保存 */
export async function updateUserPlan(
  email: string,
  plan: UserPlan,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  const existing = await getUserByEmail(email);
  if (!existing) return;

  const updated: User = {
    ...existing,
    plan,
    ...(stripeCustomerId && { stripeCustomerId }),
    ...(stripeSubscriptionId && { stripeSubscriptionId }),
  };

  const k = `user:${email.toLowerCase()}`;
  if (redis) {
    try {
      await redis.set(k, updated);
      // 逆引き: stripe_customer:{customerId} → email
      if (stripeCustomerId) {
        await redis.set(
          `stripe_customer:${stripeCustomerId}`,
          email.toLowerCase()
        );
      }
      return;
    } catch {
      /* fallthrough */
    }
  }
  mem.set(k, updated);
}

/** Stripe顧客IDからユーザーを検索（サブスクリプション解約時に使用） */
export async function getUserByStripeCustomerId(
  customerId: string
): Promise<User | null> {
  if (redis) {
    try {
      const email = await redis.get<string>(`stripe_customer:${customerId}`);
      if (email) return getUserByEmail(email);
    } catch {
      /* fallthrough */
    }
  }
  // メモリフォールバック
  for (const user of mem.values()) {
    if (user.stripeCustomerId === customerId) return user;
  }
  return null;
}
