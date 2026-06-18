import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import { UpdateRoleSchema } from "@/lib/validations";
import {
  ok, error, notFound, forbidden, serverError,
  requireRole, parseBody, zodErrors, getSession,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/users/[id] — get single user detail
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole("admin");
    await connectDB();

    const { id } = await params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) return notFound("User");

    return ok({ user });
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/admin/users/[id] — update role (owner only)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("owner");
    await connectDB();

    const { id } = await params;

    // Prevent owner from changing their own role
    if (session.userId === id) {
      return error("You cannot change your own role", 400);
    }

    const body = await parseBody(req);
    if (!body) return error("Invalid request body");

    const parsed = UpdateRoleSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    // Only owner can assign "owner" role
    if (parsed.data.role === "owner") {
      return forbidden("Only existing owners can assign the owner role");
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: { role: parsed.data.role } },
      { new: true }
    ).select("-password");

    if (!user) return notFound("User");

    return ok({ user });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/admin/users/[id] — deactivate user (owner only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("owner");
    await connectDB();

    const { id } = await params;

    if (session.userId === id) {
      return error("You cannot deactivate your own account", 400);
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).select("-password");

    if (!user) return notFound("User");

    return ok({ message: `User @${user.username} has been deactivated` });
  } catch (err) {
    return serverError(err);
  }
}
