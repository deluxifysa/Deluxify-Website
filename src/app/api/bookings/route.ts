import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, company, topic, date, time, reference } = body;

  if (!name || !email || !date || !time) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("bookings").insert({
    name,
    email,
    company: company || null,
    topic: topic || null,
    date,
    time,
    amount_paid: 500,
    status: "confirmed",
    reference,
  });

  if (error) {
    console.error("Supabase booking insert error:", error);
    return NextResponse.json({ error: "Failed to save booking." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
