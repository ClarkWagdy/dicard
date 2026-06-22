import "server-only";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import path from "path";

export interface UploadResult {
  url: string;
  filename: string;
  bytes: number;
}

export async function uploadToLocal(
  buffer: Buffer,
  originalName: string,
  folder: string = "profiles",
): Promise<UploadResult> {
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${folder}-${randomUUID()}${ext}`;
  const pathname = `${folder}/${filename}`;

  const blob = await put(pathname, buffer, {
    access: "private",
    contentType: originalName.endsWith(".png")
      ? "image/png"
      : originalName.endsWith(".webp")
        ? "image/webp"
        : originalName.endsWith(".gif")
          ? "image/gif"
          : "image/jpeg",
  });

  return {
    url: blob.url,
    filename,
    bytes: buffer.length,
  };
}

export async function deleteFromLocal(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // Silently ignore
  }
}
