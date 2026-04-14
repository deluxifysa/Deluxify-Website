import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  if (error) {
    // Unique violation — already subscribed
    if (error.code === "23505") {
      return NextResponse.json({ alreadySubscribed: true });
    }
    console.error("Supabase newsletter insert error:", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
