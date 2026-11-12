import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Passwords are stored as scrypt hashes: "scrypt$N$r$p$salt$hash" (salt and hash in base64url).
 * Tokens (session cookies, setup links) are random; only their sha256 is stored.
 */

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scryptAsync(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

// A hash of a random password: checked when the email is unknown, so a wrong email takes as long as a wrong password.
let dummyHash: Promise<string> | null = null;

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const hash = stored ?? (await (dummyHash ??= hashPassword(randomBytes(16).toString("hex"))));
  const [kind, n, r, p, salt, key] = hash.split("$");
  if (kind !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p));
  return stored !== null && actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const randomToken = () => randomBytes(32).toString("base64url");

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
