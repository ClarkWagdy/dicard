// lib/session.ts
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Augment iron-session's data shape
declare module "iron-session" {
  interface IronSessionData {
    user?: SessionUser;
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string, // min 32 chars
  cookieName: "app_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days (seconds)
    path: "/",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the raw iron-session instance (read/write).
 * Use this when you need full control (e.g. destroy, check).
 */
export async function getSession(): Promise<
  IronSession<{ user?: SessionUser }>
> {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}

/**
 * Creates (or overwrites) the session with the given user payload.
 * Called after successful login / registration.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const session = await getSession();
  session.user = user;
  await session.save();
}

/**
 * Returns the current session user, or null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user ?? null;
}

/**
 * Destroys the session (logout).
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
