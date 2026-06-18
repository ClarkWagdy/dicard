// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import {
  error,
  serverError,
  ok,
  parseBody,
  zodErrors,
} from "@/lib/api-helpers";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const { username, password } = parsed.data;

    await connectDB();

    const user = await UserModel.findOne({
      username: username.toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!user) return error("Invalid username or password", 401);

    const isValid = await user.comparePassword(password);
    if (!isValid) return error("Invalid username or password", 401);

    // Return user data — let the CLIENT call signIn("credentials")
    // to actually create the NextAuth session/cookie
    return ok({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.profile.fullName,
    });
  } catch (err) {
    return serverError(err);
  }
}
