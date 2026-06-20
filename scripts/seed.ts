/**
 * Seed script — populates MongoDB with sample users for development.
 * Run with: npm run db:seed
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models AFTER env is loaded
import UserModel from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const SEED_USERS = [
  {
    username: "ahmed_dev",
    role: "owner" as const,
    email:    "ahmed@example.com",
    password: "Password123",
     profile: {
      fullName:    "Ahmed Hassan",
      jobTitle:    "Senior Full-Stack Developer",
      companyName: "TechVentures Egypt",
      bio:         "Passionate developer with 8+ years building scalable web apps. Open source contributor and tech speaker.",
      mobile:      "+201012345678",
      whatsapp:    "+201012345678",
      email:       "ahmed@example.com",
      website:     "https://ahmedhassan.dev",
      address:     "Cairo, Egypt",
      mapsUrl:     "https://maps.google.com/?q=Cairo+Egypt",
    },
    social: {
      linkedin:  "https://linkedin.com/in/ahmed-dev",
      github:    "https://github.com/ahmed-dev",
      twitter:   "https://twitter.com/ahmed_dev",
      instagram: "https://instagram.com/ahmed.dev",
    },
    business: {
      description: "Building cutting-edge web and mobile applications for businesses across the MENA region.",
      services:    ["Web Development", "Mobile Apps", "API Design", "Cloud Architecture", "DevOps"],
      portfolioImages: [],
    },
    appearance: {
      theme:       "dark" as const,
      accentColor: "#6366f1",
      fontStyle:   "modern" as const,
    },
  },
  {
    username: "sara_design",
    role: "admin" as const,
    email:    "sara@example.com",
    password: "Password123",
    profile: {
      fullName:    "Sara Mahmoud",
      jobTitle:    "UX/UI Designer & Brand Consultant",
      companyName: "Pixel Studio",
      bio:         "Crafting beautiful digital experiences for global brands. Specializing in mobile-first design and design systems.",
      mobile:      "+201098765432",
      whatsapp:    "+201098765432",
      email:       "sara@pixelstudio.io",
      website:     "https://saradesign.io",
      address:     "Alexandria, Egypt",
      mapsUrl:     "https://maps.google.com/?q=Alexandria+Egypt",
    },
    social: {
      linkedin:  "https://linkedin.com/in/sara-design",
      behance:   "https://behance.net/sara-design",
      dribbble:  "https://dribbble.com/sara-design",
      instagram: "https://instagram.com/sara.design",
    },
    business: {
      description: "Award-winning design studio specializing in brand identity, UI/UX, and digital product design.",
      services:    ["Brand Identity", "UI/UX Design", "Design Systems", "Motion Graphics", "Illustration"],
      portfolioImages: [],
    },
    appearance: {
      theme:       "dark" as const,
      accentColor: "#ec4899",
      fontStyle:   "elegant" as const,
    },
  },
  {
    username: "omar_consult",
    role: "user" as const,
    email:    "omar@example.com",
    password: "Password123",
     profile: {
      fullName:    "Omar Khaled",
      jobTitle:    "Business Development Manager",
      companyName: "Growth Partners MENA",
      bio:         "Helping startups and SMEs scale across the MENA region with strategic consulting and market entry support.",
      mobile:      "+201155566677",
      whatsapp:    "+201155566677",
      email:       "omar@growthpartners.me",
      website:     "https://growthpartners.me",
      address:     "New Cairo, Egypt",
      mapsUrl:     "https://maps.google.com/?q=New+Cairo+Egypt",
    },
    social: {
      linkedin: "https://linkedin.com/in/omar-khaled-bd",
      twitter:  "https://twitter.com/omar_biz",
      facebook: "https://facebook.com/OmarKhaledBD",
      telegram: "@omar_consult",
    },
    business: {
      description: "Strategic consulting firm focused on business growth, market entry, and operational excellence for MENA companies.",
      services:    ["Strategy Consulting", "Market Research", "Investor Relations", "Sales Training", "Partnership Development"],
      portfolioImages: [],
    },
    appearance: {
      theme:       "dark" as const,
      accentColor: "#10b981",
      fontStyle:   "default" as const,
    },
  },
];

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected");

    // Clear existing seed users (by known usernames) to allow re-running
    const usernames = SEED_USERS.map((u) => u.username);
    const deleted = await UserModel.deleteMany({ username: { $in: usernames } });
    console.log(`🗑️  Removed ${deleted.deletedCount} existing seed user(s)`);

    // Insert fresh seed users
    for (const userData of SEED_USERS) {
      const user = new UserModel(userData);
      await user.save();  // triggers password hashing middleware
      console.log(`✅ Created user: @${user.username} (${user.email})`);
    }

    console.log("\n✨ Seeding complete!");
    console.log("─────────────────────────────────────────");
    console.log("Test credentials:");
    SEED_USERS.forEach((u) =>
      console.log(`  @${u.username.padEnd(15)} → ${u.password}`)
    );
    console.log("─────────────────────────────────────────");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected");
  }
}

seed();
