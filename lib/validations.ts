import { z } from "zod";

// ─── Re-usable primitives ─────────────────────────────────────────────────────

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
    message: "Must be a valid URL starting with http:// or https://",
  })
  .optional()
  .or(z.literal(""));

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #6366f1)");

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "At most 30 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Only lowercase letters, numbers, hyphens and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  fullName: z.string().min(2, "At least 2 characters").max(100),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1), // accepts email OR username
  password: z.string().min(1),
});
// ─── Profile ──────────────────────────────────────────────────────────────────

export const ProfileUpdateSchema = z.object({
  fullName:    z.string().min(1, "Full name is required").max(100),
  jobTitle:    z.string().max(100).optional().or(z.literal("")),
  companyName: z.string().max(100).optional().or(z.literal("")),
  photo:       z.string().optional().or(z.literal("")),
  bio:         z.string().max(500).optional().or(z.literal("")),
  mobile:      z.string().max(20).optional().or(z.literal("")),
  whatsapp:    z.string().max(20).optional().or(z.literal("")),
  email:       z.string().email("Invalid email").optional().or(z.literal("")),
  website:     urlOrEmpty,
  address:     z.string().max(300).optional().or(z.literal("")),
  mapsUrl:     z.string().optional().or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// ─── Social ───────────────────────────────────────────────────────────────────

export const SocialUpdateSchema = z.object({
  linkedin:  urlOrEmpty,
  facebook:  urlOrEmpty,
  instagram: urlOrEmpty,
  twitter:   urlOrEmpty,
  tiktok:    urlOrEmpty,
  youtube:   urlOrEmpty,
  github:    urlOrEmpty,
  behance:   urlOrEmpty,
  dribbble:  urlOrEmpty,
  telegram:  z.string().optional().or(z.literal("")),
});

export type SocialUpdateInput = z.infer<typeof SocialUpdateSchema>;

// ─── Business ─────────────────────────────────────────────────────────────────

export const BusinessUpdateSchema = z.object({
  logo:            z.string().optional().or(z.literal("")),
  description:     z.string().max(1000).optional().or(z.literal("")),
  services:        z.array(z.string().max(50)).max(20).default([]),
  catalogPdf:      z.string().optional().or(z.literal("")),
  brochurePdf:     z.string().optional().or(z.literal("")),
  portfolioImages: z.array(z.string()).max(20).default([]),
});

export type BusinessUpdateInput = z.infer<typeof BusinessUpdateSchema>;

// ─── Appearance ───────────────────────────────────────────────────────────────

export const AppearanceUpdateSchema = z.object({
  theme:       z.enum(["light", "dark", "auto"]).default("dark"),
  accentColor: hexColor.default("#6366f1"),
  fontStyle:   z
    .enum(["default", "modern", "elegant", "minimal"])
    .default("default"),
});

export type AppearanceUpdateInput = z.infer<typeof AppearanceUpdateSchema>;

// ─── Register (with optional role for owner/admin creation) ──────────────────

export const RegisterWithRoleSchema = RegisterSchema.extend({
  role: z.enum(["owner", "admin", "user"]).default("user"),
});

export type RegisterWithRoleInput = z.infer<typeof RegisterWithRoleSchema>;

// ─── Role update (admin/owner only) ──────────────────────────────────────────

export const UpdateRoleSchema = z.object({
  role: z.enum(["owner", "admin", "user"]).refine((val) => !!val, {
    message: "Role is required",
  }),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
