import NotificationSettings from "@/components/notifications/notification-settings.component";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configuration.
        </p>
      </div>

      <NotificationSettings />
    </div>
  );
}
