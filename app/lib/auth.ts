import * as bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload as JosePayload } from "jose";
import { cookies } from "next/headers";

export type UserPlan = "free" | "standard";

export type TokenPayload = {
  email: string;
  plan: UserPlan;
};

export const COOKIE_NAME = "sai_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30日

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-only-secret-please-set-JWT_SECRET"
  );
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as JosePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** cookieにJWTをセット */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/** cookieを削除 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Route Handler の Request から認証済みユーザーを取得 */
export async function getUserFromRequest(
  request: Request
): Promise<TokenPayload | null> {
  // next/headers の cookies() を使う（Route Handler から呼ばれる想定）
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    // Edge runtime などで cookies() が使えない場合は request ヘッダから取得
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    const token = match?.slice(COOKIE_NAME.length + 1);
    if (!token) return null;
    return verifyToken(decodeURIComponent(token));
  }
}
