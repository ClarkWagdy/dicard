import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { ProfileUpdateSchema } from "@/lib/validations";
import { ok, error, notFound, serverError, zodErrors, parseBody, getAuthenticatedUser, getUserByUsername } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) return error("username query param is required");

    const user = await getUserByUsername(username);
    if (!user) return notFound("User");

    return ok({ profile: user.profile, appearance: user.appearance });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { profile: parsed.data } },
      { new: true, runValidators: true }
    );

    return ok({ profile: updated?.profile });
  } catch (err) {
    return serverError(err);
  }
}
