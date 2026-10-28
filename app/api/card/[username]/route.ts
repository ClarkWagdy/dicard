export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import PageView from "@/models/PageView";
import {
  ok,
  notFound,
  serverError,
  unauthorized,
  forbidden,
} from "@/lib/api-helpers";

// ── يمنع أي كاش (CDN / متصفح / back-forward cache) على الرد ───────────────────
const NO_STORE = "no-store, no-cache, must-revalidate, max-age=0";

function noStore<T extends Response>(res: T): T {
  res.headers.set("Cache-Control", NO_STORE);
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

// يبني شكل الكارت من الـ document اللي جاي من الداتا بيز
function toCardPayload(userData: any) {
  return {
    username: userData.username,
    profile: userData.profile,
    social: userData.social ?? {},
    business: {
      ...userData.business,
      services: userData.business?.services ?? [],
      portfolioImages: userData.business?.portfolioImages ?? [],
    },
    appearance: userData.appearance,
  };
}

// GET /api/card/[username]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    await connectDB();
    const { username } = await params;

    // دايمًا query جديدة على MongoDB في كل request
    const user = await UserModel.findByUsername(username);
    if (!user) return noStore(notFound("Card"));
    const userData = user.toObject();

    // after(): بيضمن إن الـ analytics تخلص حتى بعد ما الرد يتبعت (serverless)
    const userId = user._id.toString();
    const referrer = req.headers.get("referer") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    after(async () => {
      try {
        await PageView.recordView(userId, userData.username, {
          referrer,
          userAgent,
        });
        await UserModel.findByIdAndUpdate(userId, {
          $inc: {
            "analytics.totalViews": 1,
            "analytics.monthlyViews": 1,
          },
          $set: { "analytics.lastViewedAt": new Date() },
        });
      } catch {
        // Silently ignore analytics errors
      }
    });

    return noStore(ok(toCardPayload(userData)));
  } catch (err) {
    return noStore(serverError(err));
  }
}

// PUT /api/card/[username]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    await connectDB();
    const { username } = await params;

    // ✅ Auth check — ensure the caller owns this card
    const session = await getServerSession(authOptions);
    if (!session?.user) return noStore(unauthorized());
    if (session.user.username !== username) return noStore(forbidden());

    const user = await UserModel.findByUsername(username);
    if (!user) return noStore(notFound("Card"));

    // ✅ Guard: body must be a valid JSON object
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return noStore(
        Response.json({ error: "Invalid JSON body" }, { status: 400 }),
      );
    }

    const allowedFields = [
      "profile",
      "social",
      "business",
      "appearance",
    ] as const;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      const value = body[field];
      // ✅ Guard: skip non-object or null values
      if (
        value === undefined ||
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        continue;
      }
      const subDoc = value as Record<string, unknown>;
      for (const [key, val] of Object.entries(subDoc)) {
        updates[`${field}.${key}`] = val;
      }
    }

    // ✅ Guard: nothing valid to update
    if (Object.keys(updates).length === 0) {
      return noStore(
        Response.json({ error: "No valid fields to update" }, { status: 400 }),
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[PUT /api/card] updates:", JSON.stringify(updates, null, 2));
    }

    const result = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!result) {
      return noStore(notFound("User"));
    }

    // بنرجّع النسخة المحدّثة من الداتا بيز نفسها، فالـ client مش محتاج GET تاني
    return noStore(ok({ success: true, ...toCardPayload(result.toObject()) }));
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/card] error:", err);
    }
    return noStore(serverError(err));
  }
}
