import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * POST /api/bookings
 * Called immediately when a visitor submits the booking form (before payment).
 * Always creates:
 *   1. A Client record with pipeline_stage = "lead"
 *   2. A Booking record with status = "pending", amount_paid = 0
 *
 * This ensures every form submission is captured, even if the visitor
 * abandons the payment step.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, company, topic, date, time, reference } = body;

  if (!name || !email || !date || !time || !reference) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // ── 1. Create client record (pipeline entry as Lead) ────────────────────
  const { data: client } = await supabase
    .from("clients")
    .insert({
      full_name: name,
      email,
      phone: phone || null,
      company: company || null,
      pipeline_stage: "lead",
      source: "book-call",
      notes: topic ? `Enquiry: ${topic}` : null,
    })
    .select("id")
    .single();

  // ── 2. Create pending booking ────────────────────────────────────────────
  const { error: bookingError } = await supabase.from("bookings").insert({
    name,
    email,
    phone: phone || null,
    company: company || null,
    topic: topic || null,
    date,
    time,
    amount_paid: 0,
    status: "pending",
    reference,
    client_id: client?.id ?? null,
  });

  if (bookingError) {
    console.error("Booking insert error:", bookingError);
    return NextResponse.json({ error: "Failed to save booking." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * PATCH /api/bookings
 * Called after payment is successfully processed.
 * Updates the existing booking (found by reference) to:
 *   - status = "confirmed"
 *   - amount_paid = 500
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { reference } = body;

  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed", amount_paid: 500 })
    .eq("reference", reference);

  if (error) {
    console.error("Booking confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm booking." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
