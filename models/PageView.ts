import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IPageView extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  viewedAt: Date;
  // Optional metadata
  referrer?: string;
  userAgent?: string;
  country?: string;
}

export interface IPageViewModel extends Model<IPageView> {
  recordView(userId: string, username: string, meta?: Partial<IPageView>): Promise<IPageView>;
  getViewsForUser(userId: string, days?: number): Promise<number>;
  getDailyBreakdown(userId: string, days?: number): Promise<Array<{ date: string; count: number }>>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const PageViewSchema = new Schema<IPageView, IPageViewModel>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username:  { type: String, required: true, index: true },
    viewedAt:  { type: Date, default: Date.now, index: true },
    referrer:  { type: String, trim: true },
    userAgent: { type: String, trim: true },
    country:   { type: String, trim: true },
  },
  {
    // TTL index: auto-delete records older than 90 days to keep collection lean
    expireAfterSeconds: 60 * 60 * 24 * 90,
    timestamps: false,
  }
);

// Compound index for efficient per-user time-range queries
PageViewSchema.index({ userId: 1, viewedAt: -1 });
PageViewSchema.index({ username: 1, viewedAt: -1 });

// ─── Static Methods ───────────────────────────────────────────────────────────

PageViewSchema.statics.recordView = async function (
  userId: string,
  username: string,
  meta: Partial<IPageView> = {}
): Promise<IPageView> {
  return this.create({
    userId,
    username,
    viewedAt: new Date(),
    ...meta,
  });
};

PageViewSchema.statics.getViewsForUser = async function (
  userId: string,
  days = 30
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return this.countDocuments({
    userId,
    viewedAt: { $gte: since },
  });
};

PageViewSchema.statics.getDailyBreakdown = async function (
  userId: string,
  days = 30
): Promise<Array<{ date: string; count: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await (this as Model<IPageView>).aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        viewedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
  ]);

  return results;
};

// ─── Model Export ─────────────────────────────────────────────────────────────

const PageView =
  (mongoose.models.PageView as IPageViewModel) ||
  mongoose.model<IPageView, IPageViewModel>("PageView", PageViewSchema);

export default PageView;
