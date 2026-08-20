import { SettingsForm } from "@/components/dashboard/settings-form";
import { getSalonSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const settings = await getSalonSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          House details, contact, and default hours. Professionals can override
          their own weekly schedule.
        </p>
      </div>
      <SettingsForm
        businessName={settings.businessName}
        location={settings.location}
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        email={settings.email}
        defaultOpenTime={settings.defaultOpenTime}
        defaultCloseTime={settings.defaultCloseTime}
        slotIntervalMin={settings.slotIntervalMin}
      />
    </div>
  );
}
