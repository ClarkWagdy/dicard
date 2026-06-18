/**
 * Explicitly create all indexes in MongoDB.
 * Mongoose auto-creates indexes on startup, but running this script
 * ensures they exist before your first deployment.
 *
 * Run with: npm run db:indexes
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import UserModel from "../models/User";
import PageView from "../models/PageView";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set");
  process.exit(1);
}

async function createIndexes() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    console.log("\n📑 Creating User indexes...");
    await UserModel.ensureIndexes();
    const userIndexes = await UserModel.collection.indexes();
    userIndexes.forEach((idx) =>
      console.log("  ✓", JSON.stringify(idx.key), idx.unique ? "[unique]" : "")
    );

    console.log("\n📑 Creating PageView indexes...");
    await PageView.ensureIndexes();
    const pvIndexes = await PageView.collection.indexes();
    pvIndexes.forEach((idx) =>
      console.log("  ✓", JSON.stringify(idx.key))
    );

    console.log("\n✨ All indexes created successfully");
  } catch (err) {
    console.error("❌ Failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createIndexes();
