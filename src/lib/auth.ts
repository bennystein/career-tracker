import { createHash, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "cst_auth";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** The cookie value set on successful login — a hash of the shared app password. */
export function cookieValueForPassword(password: string): string {
  return hashPassword(password);
}

/** Checks a submitted login-form password against APP_PASSWORD. */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return timingSafeStringEqual(candidate, expected);
}

/** Checks an incoming request's auth cookie against the current APP_PASSWORD. */
export function isValidAuthCookie(cookieValue: string | undefined | null): boolean {
  const password = process.env.APP_PASSWORD;
  if (!cookieValue || !password) return false;
  return timingSafeStringEqual(cookieValue, hashPassword(password));
}
