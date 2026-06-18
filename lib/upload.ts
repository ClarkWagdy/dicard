import "server-only";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface UploadResult {
  url: string;
  filename: string;
  bytes: number;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadToLocal(
  buffer: Buffer,
  originalName: string,
  folder: string = "profiles",
): Promise<UploadResult> {
  await ensureDir();

  const ext = path.extname(originalName) || ".jpg";
  const filename = `${folder}-${randomUUID()}${ext}`;
  const folderPath = path.join(UPLOAD_DIR, folder);

  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(path.join(folderPath, filename), buffer);

  return {
    url: `/uploads/${folder}/${filename}`, // served as static file
    filename,
    bytes: buffer.length,
  };
}

export async function deleteFromLocal(url: string): Promise<void> {
  try {
    const relativePath = url.replace(/^\/uploads\//, "");
    await fs.unlink(path.join(UPLOAD_DIR, relativePath));
  } catch {
    // Silently ignore if file doesn't exist
  }
}
