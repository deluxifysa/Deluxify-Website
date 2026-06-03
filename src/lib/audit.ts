import { supabase } from "@/lib/supabase";

export async function logAudit(
  action: "created" | "updated" | "deleted",
  table_name: string,
  record_label: string,
  details?: string,
  record_id?: string
): Promise<void> {
  try {
    console.log(`[audit] ▶ ${action} ${table_name}:`, record_label);
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) { console.error("[audit] getSession error:", sessErr); }
    const email = session?.user?.email ?? null;
    console.log("[audit] performed_by:", email ?? "(no session)");
    const { error } = await supabase.from("audit_logs").insert({
      action,
      table_name,
      record_label,
      performed_by: email,
      details: details ?? null,
      record_id: record_id ?? null,
    });
    if (error) {
      console.error("[audit] ❌ insert failed — code:", error.code, "| message:", error.message, error);
    } else {
      console.log("[audit] ✅ logged successfully");
    }
  } catch (err) {
    console.error("[audit] ❌ threw:", err);
  }
}
