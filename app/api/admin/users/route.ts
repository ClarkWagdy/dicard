import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import { ok, error, serverError, requireRole } from "@/lib/api-helpers";

// GET /api/admin/users — list all users (admin + owner only)
export async function GET(req: NextRequest) {
  try {
    await requireRole("admin");
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search)
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.fullName": { $regex: search, $options: "i" } },
      ];

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return ok({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password, role } = await req.json();

    const exists = await UserModel.findOne({
      username: username.toLowerCase(),
    });
    if (exists) {
      return Response.json(
        { message: "Username already taken" },
        { status: 400 },
      );
    }

    const user = await UserModel.create({
      username: username.toLowerCase(),
      email,
      password,
      role: role ?? "user",
      isActive: true,
    });

    return ok({ id: user._id.toString() });
  } catch (err) {
    return serverError(err);
  }
}