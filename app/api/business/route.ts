import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { BusinessUpdateSchema } from "@/lib/validations";
import { ok, error, notFound, serverError, zodError, zodErrors, parseBody, getAuthenticatedUser, getUserByUsername } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) return error("username query param is required");

    const user = await getUserByUsername(username);
    if (!user) return notFound("User");

    return ok({ business: user.business });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = BusinessUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { business: parsed.data } },
      { new: true, runValidators: true }
    );

    return ok({ business: updated?.business });
  } catch (err) {
    return serverError(err);
  }
}
