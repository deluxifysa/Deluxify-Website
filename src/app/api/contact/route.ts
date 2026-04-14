import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, company, phone, service, message } = body;

  if (!name || !email || !service || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email,
    company: company || null,
    phone: phone || null,
    service,
    message,
  });

  if (error) {
    console.error("Supabase contact insert error:", error);
    return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
