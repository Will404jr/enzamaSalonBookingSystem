import { formatKampalaDateTime, formatUgx } from "@/lib/format";

export type EmailKind =
  | "received"
  | "confirmed"
  | "rejected"
  | "reminder"
  | "updated"
  | "completed";

export type BookingEmailData = {
  customerName: string;
  startAt: Date;
  professionalName: string;
  services: string[];
  total: number;
  location: string;
  phone: string;
  whatsapp: string;
  note?: string;
};

const COPY: Record<
  EmailKind,
  { eyebrow: string; title: string; body: string; subject: string }
> = {
  received: {
    eyebrow: "Request received",
    title: "We have your chair request",
    body: "The floor will confirm shortly. Sit tight — we will write again when your time is locked in.",
    subject: "We received your Enzama Looks booking",
  },
  confirmed: {
    eyebrow: "Confirmed",
    title: "You are booked",
    body: "Your appointment is confirmed. Come a few minutes early so we can settle you in.",
    subject: "Your Enzama Looks appointment is confirmed",
  },
  rejected: {
    eyebrow: "Unable to confirm",
    title: "That time is no longer free",
    body: "We could not hold this chair. Please pick another time on the booking page — we would still love to see you.",
    subject: "Update on your Enzama Looks booking",
  },
  reminder: {
    eyebrow: "Today",
    title: "Your appointment is today",
    body: "This is a reminder that you have a visit scheduled at Enzama Looks today. Come a few minutes early, and message us on WhatsApp if you are running late.",
    subject: "Today: your Enzama Looks appointment",
  },
  updated: {
    eyebrow: "Updated",
    title: "Your appointment was changed",
    body: "The salon updated your booking. Please review the new details below so you arrive at the right time.",
    subject: "Your Enzama Looks appointment was updated",
  },
  completed: {
    eyebrow: "Thank you",
    title: "It was a pleasure",
    body: "Thank you for sitting with us. When you are ready for the next cut, color, or set — the chair is yours.",
    subject: "Thank you for visiting Enzama Looks",
  },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bookingEmail(kind: EmailKind, data: BookingEmailData) {
  const copy = COPY[kind];
  const when = formatKampalaDateTime(data.startAt);
  const services = data.services.join(", ");
  const total = formatUgx(data.total);

  const rows = [
    ["When", when],
    ["With", data.professionalName],
    ["Services", services],
    ["Total", total],
    ["Salon", data.location],
  ];

  const detailsHtml = rows
    .map(
      ([label, value], index) => `
        <tr>
          <td style="padding:14px 0;border-top:${index === 0 ? "1px solid #e2e8f0" : "0"};border-bottom:1px solid #e2e8f0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;width:96px;vertical-align:top;">${label}</td>
          <td style="padding:14px 0;border-top:${index === 0 ? "1px solid #e2e8f0" : "0"};border-bottom:1px solid #e2e8f0;font-size:15px;color:#09090b;font-weight:500;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(copy.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;color:#09090b;font-family:Inter,Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:0 8px 20px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#ef4444;font-weight:600;font-family:Inter,Arial,sans-serif;">Enzama Looks</p>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="height:4px;background:#ef4444;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:36px 36px 12px;">
                      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#ef4444;font-family:Inter,Arial,sans-serif;">${copy.eyebrow}</p>
                      <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;font-weight:400;color:#09090b;">${copy.title}</h1>
                      <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#64748b;font-family:Inter,Arial,sans-serif;">Hello ${escapeHtml(data.customerName.split(" ")[0] ?? data.customerName)},</p>
                      <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;font-family:Inter,Arial,sans-serif;">${copy.body}</p>
                      ${
                        data.note
                          ? `<p style="margin:12px 0 0;padding:12px 14px;background:#fee2e2;color:#991b1b;font-size:14px;line-height:1.5;font-family:Inter,Arial,sans-serif;">${escapeHtml(data.note)}</p>`
                          : ""
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 36px 8px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailsHtml}</table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 36px 36px;font-family:Inter,Arial,sans-serif;">
                      <p style="margin:16px 0 0;font-size:13px;color:#64748b;">Questions? ${escapeHtml(data.phone)} · WhatsApp ${escapeHtml(data.whatsapp)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px 0;font-family:Inter,Arial,sans-serif;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">Entebbe salon · ${escapeHtml(data.location)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Enzama Looks — ${copy.eyebrow}`,
    copy.title,
    "",
    `Hello ${data.customerName},`,
    copy.body,
    data.note ? `\n${data.note}` : "",
    "",
    `When: ${when}`,
    `With: ${data.professionalName}`,
    `Services: ${services}`,
    `Total: ${total}`,
    `Salon: ${data.location}`,
    "",
    `Phone: ${data.phone}`,
    `WhatsApp: ${data.whatsapp}`,
  ].join("\n");

  return { subject: copy.subject, html, text };
}
