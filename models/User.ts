import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Role Type ────────────────────────────────────────────────────────────────

export type UserRole = "owner" | "admin" | "user";

export const USER_ROLES: UserRole[] = ["owner", "admin", "user"];

// Role hierarchy — higher index = more permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  user:  1,
};

/** Returns true if `role` has at least the permissions of `required` */
export function hasRole(role: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[required];
}

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface IProfile {
  fullName:    string;
  jobTitle?:   string;
  companyName?: string;
  photo?:      string;
  bio?:        string;
  mobile?:     string;
  whatsapp?:   string;
  email?:      string;
  website?:    string;
  address?:    string;
  mapsUrl?:    string;
}

export interface ISocial {
  linkedin?:  string;
  facebook?:  string;
  instagram?: string;
  twitter?:   string;
  tiktok?:    string;
  youtube?:   string;
  github?:    string;
  behance?:   string;
  dribbble?:  string;
  telegram?:  string;
}

export interface IBusiness {
  logo?:            string;
  description?:     string;
  services:         string[];
  catalogPdf?:      string;
  brochurePdf?:     string;
  portfolioImages:  string[];
}

export interface IAppearance {
  theme:       "light" | "dark" | "auto";
  accentColor: string;
  fontStyle:   "default" | "modern" | "elegant" | "minimal";
}

export interface IAnalytics {
  totalViews:   number;
  monthlyViews: number;
  lastViewedAt?: Date;
  viewsHistory: Array<{ date: Date; count: number }>;
}

export interface IUser extends Document {
  _id:        mongoose.Types.ObjectId;
  username:   string;
  email:      string;
  password:   string;
  role:       UserRole;            // ← NEW
  profile:    IProfile;
  social:     ISocial;
  business:   IBusiness;
  appearance: IAppearance;
  analytics:  IAnalytics;
  isActive:   boolean;
  createdAt:  Date;
  updatedAt:  Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Omit<IUser, "password">;
  hasRole(required: UserRole): boolean;  // ← NEW
}

export interface IUserModel extends Model<IUser> {
  findByUsername(username: string): Promise<IUser | null>;
}

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────

const ProfileSchema = new Schema<IProfile>(
  {
    fullName:    { type: String, required: true, trim: true, maxlength: 100 },
    jobTitle:    { type: String, trim: true, maxlength: 100 },
    companyName: { type: String, trim: true, maxlength: 100 },
    photo:       { type: String, trim: true },
    bio:         { type: String, trim: true, maxlength: 500 },
    mobile:      { type: String, trim: true },
    whatsapp:    { type: String, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    website:     { type: String, trim: true },
    address:     { type: String, trim: true },
    mapsUrl:     { type: String, trim: true },
  },
  { _id: false }
);

const SocialSchema = new Schema<ISocial>(
  {
    linkedin:  { type: String, trim: true },
    facebook:  { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter:   { type: String, trim: true },
    tiktok:    { type: String, trim: true },
    youtube:   { type: String, trim: true },
    github:    { type: String, trim: true },
    behance:   { type: String, trim: true },
    dribbble:  { type: String, trim: true },
    telegram:  { type: String, trim: true },
  },
  { _id: false }
);

const BusinessSchema = new Schema<IBusiness>(
  {
    logo:            { type: String, trim: true },
    description:     { type: String, trim: true, maxlength: 1000 },
    services:        [{ type: String, trim: true, maxlength: 50 }],
    catalogPdf:      { type: String, trim: true },
    brochurePdf:     { type: String, trim: true },
    portfolioImages: [{ type: String, trim: true }],
  },
  { _id: false }
);

const AppearanceSchema = new Schema<IAppearance>(
  {
    theme:       { type: String, enum: ["light", "dark", "auto"], default: "dark" },
    accentColor: { type: String, default: "#6366f1", match: /^#[0-9a-fA-F]{6}$/ },
    fontStyle:   { type: String, enum: ["default", "modern", "elegant", "minimal"], default: "default" },
  },
  { _id: false }
);

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    totalViews:   { type: Number, default: 0 },
    monthlyViews: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
    viewsHistory: [{ date: { type: Date, required: true }, count: { type: Number, default: 0 }, _id: false }],
  },
  { _id: false }
);

// ─── Main User Schema ─────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      match: [/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",          // every new signup is "user" by default
      required: true,
    },
    profile:    { type: ProfileSchema,    default: () => ({ fullName: "New User" }) },
    social:     { type: SocialSchema,     default: () => ({}) },
    business:   { type: BusinessSchema,   default: () => ({ services: [], portfolioImages: [] }) },
    appearance: { type: AppearanceSchema, default: () => ({}) },
    analytics:  { type: AnalyticsSchema,  default: () => ({ totalViews: 0, monthlyViews: 0, viewsHistory: [] }) },
    isActive:   { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────


UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ "analytics.lastViewedAt": -1 });

// ─── Middleware ───────────────────────────────────────────────────────────────

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: unknown) {
    next(err as Error);
  }
});

UserSchema.pre("save", function (next) {
  const now = new Date();
  const lastView = this.analytics?.lastViewedAt;
  if (lastView) {
    const sameMonth =
      lastView.getMonth() === now.getMonth() &&
      lastView.getFullYear() === now.getFullYear();
    if (!sameMonth) this.analytics.monthlyViews = 0;
  }
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.email;
  delete obj.__v;
  return obj;
};

UserSchema.methods.hasRole = function (required: UserRole): boolean {
  return hasRole(this.role, required);
};

// ─── Static Methods ───────────────────────────────────────────────────────────

UserSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username: username.toLowerCase(), isActive: true });
};

// ─── Model Export ─────────────────────────────────────────────────────────────

const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
