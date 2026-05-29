import type { Request, Response } from "express";
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from "../../auth";
import { localDb } from "../../localDb";
import { nowIso } from "../shared/time";

export async function ensureDataAdminUser() {
  const username = process.env.DATA_ADMIN_USERNAME || "komora";
  const password = process.env.DATA_ADMIN_PASSWORD || "hospodarskakomora2026";

  const existingUser = localDb
    .prepare("SELECT id FROM admin_users WHERE username = ?")
    .get(username);
  if (existingUser) return;

  const passwordHash = await hashPassword(password);
  localDb
    .prepare(
      "INSERT INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)"
    )
    .run(username, passwordHash, nowIso());
  console.log(`Seeded data admin user "${username}"`);
}

export function authenticateDataRequest(req: Request, res: Response, secret: string) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({ error: "Missing auth token" });
    return null;
  }

  const payload = verifyAuthToken(token, secret);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired auth token" });
    return null;
  }

  return payload;
}

export async function loginDataAdmin(
  username: string,
  password: string,
  secret: string,
  tokenTtlSeconds: number
)
{
  const user = localDb
    .prepare(
      "SELECT username, password_hash AS passwordHash FROM admin_users WHERE username = ?"
    )
    .get(username.trim()) as { username: string; passwordHash: string } | undefined;
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    token: createAuthToken(
      {
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + tokenTtlSeconds,
      },
      secret
    ),
    username: user.username,
  };
}
