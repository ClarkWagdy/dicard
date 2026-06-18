import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";
import { ok, notFound, serverError } from "@/lib/api-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { email, password, role } = await req.json();

    const updates: Record<string, unknown> = { email, role };
    if (password) updates.password = password;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    );
    if (!user) return notFound("User");

    return ok({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
