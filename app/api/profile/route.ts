import { NextRequest } from "next/server";
import UserModel from "@/models/User";
import { ProfileUpdateSchema } from "@/lib/validations";
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

// لا كاش أبداً، عشان الـ GET يقرأ آخر داتا بعد الـ PUT
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // partial(): الفورم ممكن يبعت جزء من الحقول
    // مهم: ProfileUpdateSchema لازم يحتوي كل الحقول:
    // fullName, jobTitle, companyName, bio, mobile, whatsapp, email,
    // website, address, mapsUrl, photo. أي حقل ناقص Zod بيشيله بصمت.
    const parsed = ProfileUpdateSchema.partial().safeParse(body);
    if (!parsed.success) return zodErrors(parsed.error);

    const fields = Object.entries(parsed.data).filter(
      ([, v]) => v !== undefined,
    );
    if (fields.length === 0) {
      return error(
        `No valid profile fields in request body. Received keys: ${
          Object.keys(body as object).join(", ") || "none"
        }`,
      );
    }

    // $set لكل حقل لوحده بدل استبدال profile كله (كان بيمسح أي حقل مش مبعوت)
    const set = Object.fromEntries(fields.map(([k, v]) => [`profile.${k}`, v]));

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: set },
      {
        new: true,
        runValidators: true,
        // يرمي error لو الحقل مش في الـ Mongoose schema بدل ما يتجاهله
        strict: "throw",
      },
    );

    if (!updated) return notFound("User");

    return ok({ profile: updated.profile });
  } catch (err) {
    return serverError(err);
  }
}
