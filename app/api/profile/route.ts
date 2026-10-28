import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
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
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
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
    await connectDB();
    const user = await getAuthenticatedUser();

    const body = await parseBody(req);
 
    if (!body || typeof body !== "object") {
      return error("Invalid or empty request body");
    }

    // يقبل الشكلين:
    //   { fullName: "...", photo: "..." }            (flat)
    //   { profile: { fullName: "...", photo: "..." } } (nested، زي اللي الداشبورد/ProfileForm بيبعته)
    const raw = body as Record<string, unknown>;
    const payload: Record<string, unknown> =
      raw.profile &&
      typeof raw.profile === "object" &&
      !Array.isArray(raw.profile)
        ? (raw.profile as Record<string, unknown>)
        : raw;

    // partial(): الفورم ممكن يبعت جزء من الحقول
    const parsed = ProfileUpdateSchema.partial().safeParse(payload);
    if (!parsed.success) return zodErrors(parsed.error);

    // أي مفتاح اتبعت واتشال بصمت بواسطة Zod (يعني ناقص من الـ schema)
    const ignoredKeys = Object.keys(payload).filter((k) => !(k in parsed.data));

    const fields = Object.entries(parsed.data).filter(
      ([, v]) => v !== undefined,
    );
    if (fields.length === 0) {
      return error(
        `No valid profile fields in request body. Received keys: ${
          Object.keys(payload).join(", ") || "none"
        }`,
      );
    }

    // $set لكل حقل لوحده بدل استبدال profile كله
    const set = Object.fromEntries(fields.map(([k, v]) => [`profile.${k}`, v]));

    if (process.env.NODE_ENV === "development") {
 
      if (ignoredKeys.length) {
        console.warn(
          "[PUT /api/profile] stripped by ProfileUpdateSchema:",
          ignoredKeys,
        );
      }
    }

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

    // رجّع النسخة اللي اتقرت فعلًا من الداتا بيز + الحقول اللي اتجاهلت
    return ok({ profile: updated.profile, ignoredKeys });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/profile] error:", err);
    }
    return serverError(err);
  }
}
