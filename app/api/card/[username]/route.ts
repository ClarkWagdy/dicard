import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import PageView from "@/models/PageView";
import { ok, notFound, serverError } from "@/lib/api-helpers";

// GET /api/card/[username]
// Returns all public data for rendering a digital card.
// Also records a page view asynchronously.
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    await connectDB();
    const { username } = await params; // ← await it

    const user = await UserModel.findByUsername(username);
    if (!user) return notFound("Card");

    // Record page view (fire and forget — don't block the response)
    void (async () => {
      try {
        await PageView.recordView(user._id.toString(), user.username, {
          referrer: req.headers.get("referer") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        });

        // Increment counters on the user document
        await UserModel.findByIdAndUpdate(user._id, {
          $inc: {
            "analytics.totalViews": 1,
            "analytics.monthlyViews": 1,
          },
          $set: {
            "analytics.lastViewedAt": new Date(),
          },
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await UserModel.findByUsername(username);
    if (!user) return notFound("Card");

    const body = await req.json();

    const allowedFields = ["profile", "social", "business", "appearance"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // ✅ Dot-notation: only touches e.g. "business.services", not "profile"
        const subDoc = body[field] as Record<string, unknown>;
        for (const [key, value] of Object.entries(subDoc)) {
          updates[`${field}.${key}`] = value;
        }
      }
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true },
    );

    return ok({ success: true });
  } catch (err) {
    return serverError(err);
  }
}