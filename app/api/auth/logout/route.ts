import { ok } from "@/lib/api-helpers";
import { destroySession } from "@/lib/session";

// POST /api/auth/logout
export async function POST() {
  await destroySession();
  return ok({ message: "Logged out" });
}
