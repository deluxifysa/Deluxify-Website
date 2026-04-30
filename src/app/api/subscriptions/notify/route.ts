import { NextRequest, NextResponse } from "next/server";

type EmailType = "payment_received" | "payment_reminder" | "overdue_notice";

interface NotifyBody {
  type: EmailType;
  clientName: string;
  clientEmail: string;
  planName: string;
  amount: string;        // formatted, e.g. "R 1 500.00"
  billingMonth: string;  // e.g. "April 2026"
  invoiceNo?: string;
  dueDate?: string;
}

const SUBJECTS: Record<EmailType, (planName: string) => string> = {
  payment_received: (p) => `Payment received — ${p}`,
  payment_reminder: (p) => `Payment reminder — ${p}`,
  overdue_notice:   (p) => `Overdue payment — ${p}`,
};

function buildHtml(body: NotifyBody): string {
  const { type, clientName, planName, amount, billingMonth, invoiceNo, dueDate } = body;

  const greeting = `Hi ${clientName},`;

  const messageMap: Record<EmailType, string> = {
    payment_received: `We've received your payment of <strong>${amount}</strong> for <strong>${planName}</strong> (${billingMonth}). Thank you — your subscription is active and up to date.`,
    payment_reminder: `This is a friendly reminder that your payment of <strong>${amount}</strong> for <strong>${planName}</strong> is due for <strong>${billingMonth}</strong>${dueDate ? ` by <strong>${dueDate}</strong>` : ""}. Please arrange payment at your earliest convenience.`,
    overdue_notice:   `Your payment of <strong>${amount}</strong> for <strong>${planName}</strong> (${billingMonth}) is now <strong style="color:#e53e3e">overdue</strong>. Please contact us as soon as possible to avoid service interruption.`,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SUBJECTS[type](planName)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#0d0d0f;padding:28px 32px;text-align:center">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">Deluxify</span>
          <span style="color:#3fe0d0;font-size:11px;font-weight:600;letter-spacing:2px;margin-left:8px;text-transform:uppercase">AI</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="margin:0 0 12px;color:#1a1a1a;font-size:15px">${greeting}</p>
          <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6">${messageMap[type]}</p>
          ${invoiceNo ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;margin-bottom:24px"><tr><td style="padding:16px 20px"><p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Invoice</p><p style="margin:4px 0 0;color:#1a1a1a;font-size:16px;font-weight:700">${invoiceNo}</p></td><td style="padding:16px 20px;text-align:right"><p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Amount</p><p style="margin:4px 0 0;color:#2f8f89;font-size:16px;font-weight:700">${amount}</p></td></tr></table>` : ""}
          <p style="margin:0;color:#888;font-size:13px;line-height:1.6">If you have any questions, please reply to this email or reach out to us directly.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
          <p style="margin:0;color:#bbb;font-size:12px">© ${new Date().getFullYear()} Deluxify AI · All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body: NotifyBody = await req.json();
  const { type, clientEmail, planName } = body;

  const resendKey = process.env.RESEND_API_KEY;

  // If no API key configured, return success silently (dev mode)
  if (!resendKey) {
    console.warn("[subscriptions/notify] RESEND_API_KEY not set — email skipped");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const html    = buildHtml(body);
  const subject = SUBJECTS[type](planName);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:    process.env.EMAIL_FROM ?? "Deluxify <noreply@deluxify.ai>",
      to:      [clientEmail],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[subscriptions/notify] Resend error:", err);
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
