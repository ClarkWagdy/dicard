import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./auth";
import connectDB from "./mongodb";
import UserModel, { IUser, UserRole, hasRole } from "@/models/User";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSession {
  userId:   string;
  username: string;
  role:     UserRole;
}

// ─── Standard Responses ───────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}

export function forbidden(message = "Forbidden: insufficient permissions") {
  return error(message, 403);
}

export function notFound(resource = "Resource") {
  return error(`${resource} not found`, 404);
}

export function serverError(err: unknown) {
  console.error("API Error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return error(message, 500);
}

/** Return all Zod validation errors as field → message list */
export function zodErrors(zodErr: import("zod").ZodError) {
  const fields = zodErr.issues.map((e:any) => ({
    field:   e.path.join(".") || "root",
    message: e.message,
  }));
  return NextResponse.json(
    { success: false, error: "Validation failed", fields },
    { status: 400 }
  );
}

/** Parse JSON body safely — returns null on empty/invalid JSON */
export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch {
    return null;
  }
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function getSession(): Promise<ApiSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    userId:   session.user.id,
    username: session.user.username,
    role:     session.user.role,
  };
}

/** Require login — throws 401 if not authenticated */
export async function requireAuth(): Promise<ApiSession> {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}

/** Require a minimum role — throws 401/403 accordingly */
export async function requireRole(required: UserRole): Promise<ApiSession> {
  const session = await requireAuth();
  if (!hasRole(session.role, required)) throw forbidden();
  return session;
}

// ─── DB Helpers ───────────────────────────────────────────────────────────────

/** Get the full document for the currently logged-in user */
export async function getAuthenticatedUser(): Promise<IUser> {
  const session = await requireAuth();
  await connectDB();
  const user = await UserModel.findById(session.userId);
  if (!user) throw unauthorized();
  return user;
}

/** Get a user by username (public) */
export async function getUserByUsername(username: string): Promise<IUser | null> {
  await connectDB();
  return UserModel.findByUsername(username);
}
