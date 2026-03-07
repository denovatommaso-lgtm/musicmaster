import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase-admin";

type CreateProfileBody = {
  userId?: string;
  username?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateProfileBody;
  const userId = body.userId?.trim();
  const username = body.username?.trim();

  if (!userId || !username) {
    return NextResponse.json(
      { error: "userId and username are required." },
      { status: 400 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message ?? "User not found." },
      { status: 400 },
    );
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      username,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
