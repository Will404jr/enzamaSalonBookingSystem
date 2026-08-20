const globalForReminders = globalThis as unknown as {
  enzamaReminderTimer?: ReturnType<typeof setInterval>;
};

export function startReminderScheduler() {
  if (globalForReminders.enzamaReminderTimer) return;

  const run = () => {
    void import("@/lib/mail/booking-emails")
      .then(({ sendTodayReminders }) => sendTodayReminders())
      .then((result) => {
        if (result.sent > 0) {
          console.log(`[reminders] sent ${result.sent} of ${result.scanned}`);
        }
      })
      .catch((error) => console.error("[reminders]", error));
  };

  setTimeout(run, 20_000);
  globalForReminders.enzamaReminderTimer = setInterval(run, 15 * 60 * 1000);
}
