import { sendTodayReminders } from "@/lib/mail/booking-emails";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await sendTodayReminders();
  return Response.json({ ok: true, ...result });
}
