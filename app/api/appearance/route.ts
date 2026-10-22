import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { AppearanceUpdateSchema } from "@/lib/validations";
import {
  ok,
  error,
  notFound,
  serverError,
  zodErrors,
  parseBody,
  getAuthenticatedUser,
} from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await parseBody(req);
    if (!body) return error("Invalid or empty request body");

    const parsed = AppearanceUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    // Zod strips unknown keys; an empty result used to save nothing and still
    // return 200. Fail loudly instead.
    const fields = Object.entries(parsed.data).filter(
      ([, v]) => v !== undefined,
    );
    if (fields.length === 0) {
      return error(
        `No valid appearance fields in request body. Received keys: ${Object.keys(body as object).join(", ") || "none"}`,
      );
    }

    // Update only the sent fields instead of replacing the whole object.
    const set = Object.fromEntries(
      fields.map(([k, v]) => [`appearance.${k}`, v]),
    );

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: set },
      {
        new: true,
        runValidators: true,
        // Throws if a key isn't in the Mongoose schema instead of silently
        // dropping it.
        strict: "throw",
      },
    );

    if (!updated) return notFound("User");

    return ok({ appearance: updated.appearance });
  } catch (err) {
    return serverError(err);
  }
}
