import { NextRequest } from "next/server";
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

// GET /api/card/[username]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await UserModel.findByUsername(username);
    if (!user) return notFound("Card");

    void (async () => {
      try {
        await PageView.recordView(user._id.toString(), user.username, {
          referrer: req.headers.get("referer") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        });
        await UserModel.findByIdAndUpdate(user._id, {
          $inc: {
            "analytics.totalViews": 1,
            "analytics.monthlyViews": 1,
          },
          $set: { "analytics.lastViewedAt": new Date() },
        });
      } catch {
        // Silently ignore analytics errors
      }
    })();

    return ok({
      username: user.username,
      profile: user.profile,
      social: user.social,
      business: user.business,
      appearance: user.appearance,
    });
  } catch (err) {
    return serverError(err);
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
    if (!session?.user) return unauthorized();
    if (session.user.username !== username) return forbidden();

    const user = await UserModel.findByUsername(username);
    if (!user) return notFound("Card");

    // ✅ Guard: body must be a valid JSON object
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
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
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // ✅ Log the updates in dev so you can see what's being sent
    if (process.env.NODE_ENV === "development") {
      console.log("[PUT /api/card] updates:", JSON.stringify(updates, null, 2));
    }

    const result = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }, // ✅ runValidators catches schema mismatches
    );

    // ✅ Verify the document was actually found and updated
    if (!result) {
      return notFound("User");
    }

    return ok({ success: true });
  } catch (err) {
    // ✅ Log the real error in dev
    if (process.env.NODE_ENV === "development") {
      console.error("[PUT /api/card] error:", err);
    }
    return serverError(err);
  }
}
