// lib/session.ts
import { db } from "@/app/components/multiUserStore";
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// One shape for the cookie payload. createSession writes it and
// getSessionUser reads it, so they can never disagree again.
// (iron-session v8 has no IronSessionData to augment, so the
// `declare module` block was removed.)
export interface SessionData {
  user?: SessionUser;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const password = process.env.SESSION_SECRET;
if (!password || password.length < 32) {
  throw new Error("SESSION_SECRET must be set and at least 32 characters long");
}

export const sessionOptions: SessionOptions = {
  password,
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

/** Raw iron-session instance (read/write). */
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/** Creates (or overwrites) the session. Call after login / registration. */
export async function createSession(user: SessionUser): Promise<void> {
  const session = await getSession();
  session.user = user;
  await session.save();
}

/**
 * Current user, or null if not authenticated.
 * The cookie only proves WHO the user is; the role and existence are
 * re-checked in the database so deleted/banned/demoted users lose access.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session.user?.id) return null;

  const record = db.getById(session.user.id);

  // Don't call session.destroy() here: cookies can't be modified while
  // rendering a Server Component. Returning null is enough; the stale
  // cookie is cleared on the next logout/login.
  if (!record) return null;

  // Pick only what the app needs, so password hashes etc. never leak.
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    role: record.role,
  };
}

/** Destroys the session (logout). Call from a Route Handler or Server Action. */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
