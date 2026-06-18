import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { AppearanceUpdateSchema } from "@/lib/validations";
import { ok, error, serverError, zodError, zodErrors, parseBody, getAuthenticatedUser } from "@/lib/api-helpers";

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = AppearanceUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { appearance: parsed.data } },
      { new: true, runValidators: true }
    );

    return ok({ appearance: updated?.appearance });
  } catch (err) {
    return serverError(err);
  }
}
