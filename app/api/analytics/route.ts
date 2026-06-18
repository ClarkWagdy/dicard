import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import PageView from "@/models/PageView";
import { ok, serverError, getAuthenticatedUser } from "@/lib/api-helpers";

// GET /api/analytics
export async function GET(_req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    await connectDB();

    const user = await UserModel.findById(authUser._id);

    const [dailyBreakdown, last7Days, last30Days] = await Promise.all([
      PageView.getDailyBreakdown(authUser._id.toString(), 30),
      PageView.getViewsForUser(authUser._id.toString(), 7),
      PageView.getViewsForUser(authUser._id.toString(), 30),
    ]);

    // Count uploaded files
    const business = user?.business;
    const filesUploaded =
      (business?.portfolioImages?.length ?? 0) +
      (business?.catalogPdf ? 1 : 0) +
      (business?.brochurePdf ? 1 : 0) +
      (user?.profile?.photo ? 1 : 0) +
      (business?.logo ? 1 : 0);

    return ok({
      totalViews:     user?.analytics?.totalViews ?? 0,
      monthlyViews:   user?.analytics?.monthlyViews ?? 0,
      last7Days,
      last30Days,
      filesUploaded,
      lastViewedAt:   user?.analytics?.lastViewedAt ?? null,
      dailyBreakdown,
    });
  } catch (err) {
    return serverError(err);
  }
}
