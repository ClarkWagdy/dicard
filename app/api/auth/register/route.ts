import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import { RegisterSchema } from "@/lib/validations";
import { created, error, serverError, zodErrors, parseBody, getSession } from "@/lib/api-helpers";

// POST /api/auth/register
// - Anyone can register → role defaults to "user"
// - Owner/admin can pass a `role` field to create admin accounts
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const { username, email, password, fullName } = parsed.data;

    // Determine role
    let role: "owner" | "admin" | "user" = "user";
    const session = await getSession();
    const requestedRole = (body as Record<string, unknown>).role as string | undefined;

    if (requestedRole && requestedRole !== "user") {
      // Only owner can create admin/owner accounts
      if (session?.role === "admin") {
        if (requestedRole === "admin" ) {
          role = requestedRole as "admin" | "owner";
        }
      } else {
        return error("Only owners can assign elevated roles", 403);
      }
    }

    await connectDB();

    // First-ever user automatically becomes owner
    const count = await UserModel.countDocuments();
    if (count === 0) role = "owner";

    const existing = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const field = existing.username === username ? "username" : "email";
      return error(`This ${field} is already taken`, 409);
    }

    const user = await UserModel.create({
      username,
      email,
      password,
      role,
      profile: { fullName },
    });

    return created({
      id:       user._id,
      username: user.username,
      email:    user.email,
      role:     user.role,
    });
  } catch (err) {
    return serverError(err);
  }
}
 