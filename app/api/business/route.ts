import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { BusinessUpdateSchema } from "@/lib/validations";
import {
  ok,
  error,
  notFound,
  serverError,
  zodErrors,
  parseBody,
  getAuthenticatedUser,
  getUserByUsername,
} from "@/lib/api-helpers";

// Never cache this route, so GET always reads the latest data after a PUT.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Zod strips unknown keys. If the form sends different key names than the
    // schema expects, parsed.data is {} and the old code still returned 200
    // without saving. Fail loudly instead.
    const fields = Object.entries(parsed.data).filter(
      ([, v]) => v !== undefined,
    );
    if (fields.length === 0) {
      return error(
        `No valid business fields in request body. Received keys: ${Object.keys(body as object).join(", ") || "none"}`,
      );
    }

    // Update only the sent fields instead of replacing the whole object.
    const set = Object.fromEntries(
      fields.map(([k, v]) => [`business.${k}`, v]),
    );

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: set },
      {
        new: true,
        runValidators: true,
        // Throws if a key isn't in the Mongoose schema, instead of silently
        // dropping it (the usual cause of "200 but nothing saved").
        strict: "throw",
      },
    );

    if (!updated) return notFound("User");

    return ok({ business: updated.business });
  } catch (err) {
    return serverError(err);
  }
}
