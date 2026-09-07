import React, { useState } from "react";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { NotificationUnblockHelp } from "@/components/notifications/notification-unblock-help";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { showDesktopNotification } from "@/lib/notifications";
import useNotificationStore from "@/services/state/notification.state";

type ToggleRowProps = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProps> = ({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}) => (
  <div className="flex items-start justify-between gap-6">
    <div className="space-y-1">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className="mt-1 shrink-0"
    />
  </div>
);

export const NotificationSettings: React.FC = () => {
  const {
    enabled,
    notifyOnStart,
    notifyOnFinish,
    notifyOnFailure,
    setNotificationSetting,
  } = useNotificationStore();
  const { support, isGranted, isBlocked, canPrompt, request } =
    useNotificationPermission();
  const [showUnblockHelp, setShowUnblockHelp] = useState(false);

  const unavailable = support !== "supported";

  const handleToggleEnabled = async (checked: boolean) => {
    setNotificationSetting("enabled", checked);

    // Only ask when turning them on, and only when a prompt is actually possible -
    // a blocked permission needs the site settings, which the alert below explains.
    if (checked && canPrompt) {
      const result = await request();
      if (result !== "granted") {
        toast("Xtreamium won't be able to notify you until you allow it.");
      }
    }
  };

  const handleRequestPermission = async () => {
    const result = await request();
    if (result === "granted") {
      setShowUnblockHelp(false);
      toast.success("Desktop notifications are on.");
      return;
    }
    // A browser that has already been refused resolves straight back to "denied"
    // without prompting, so show the way out rather than leaving them clicking.
    setShowUnblockHelp(true);
  };

  const handleTestNotification = () => {
    const shown = showDesktopNotification({
      title: "Xtreamium",
      body: "Desktop notifications are working.",
      tag: "xtreamium-test-notification",
    });
    if (!shown) {
      toast.error("Your browser wouldn't show the notification.");
    }
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icons.bell className="h-5 w-5 text-primary" />
          </div>
          Desktop Notifications
        </CardTitle>
        <CardDescription>
          Get told when a recording starts or finishes, even when Xtreamium isn't
          the window you're looking at.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {support === "unsupported" && (
          <Alert>
            <Icons.info className="h-4 w-4" />
            <AlertTitle>Not available in this browser</AlertTitle>
            <AlertDescription>
              This browser doesn't support desktop notifications.
            </AlertDescription>
          </Alert>
        )}

        {support === "insecure-context" && (
          <Alert>
            <Icons.info className="h-4 w-4" />
            <AlertTitle>Not available over an insecure connection</AlertTitle>
            <AlertDescription>
              Browsers only allow notifications on https (or localhost). Open
              Xtreamium over https to use them.
            </AlertDescription>
          </Alert>
        )}

        {enabled && isBlocked && (
          <Alert variant="destructive" className="bg-destructive/5">
            <Icons.bellOff className="h-4 w-4" />
            <AlertTitle>Notifications are blocked</AlertTitle>
            <AlertDescription className="block! space-y-3">
              <p>
                Your browser is refusing notifications for Xtreamium, so nothing
                will appear while a recording runs.
              </p>
              {showUnblockHelp && <NotificationUnblockHelp />}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRequestPermission()}
                  className="gap-2"
                >
                  <Icons.refresh className="h-4 w-4" />
                  Ask again
                </Button>
                {!showUnblockHelp && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUnblockHelp(true)}
                  >
                    How do I unblock them?
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {enabled && canPrompt && (
          <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <Icons.bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              Permission needed
            </AlertTitle>
            <AlertDescription className="block! space-y-3 text-amber-800 dark:text-amber-200">
              <p>
                Xtreamium still needs your permission before it can show
                anything.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleRequestPermission()}
                className="gap-2"
              >
                <Icons.bell className="h-4 w-4" />
                Allow notifications
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ToggleRow
          id="notifications-enabled"
          label="Enable desktop notifications"
          description="Recording alerts from your browser, shown by your desktop."
          checked={enabled}
          disabled={unavailable}
          onCheckedChange={(checked) => void handleToggleEnabled(checked)}
        />

        <Separator />

        <div className="space-y-6">
          <ToggleRow
            id="notifications-on-start"
            label="When a recording starts"
            description="A heads up as the proxy begins recording a show."
            checked={notifyOnStart}
            disabled={unavailable || !enabled}
            onCheckedChange={(checked) =>
              setNotificationSetting("notifyOnStart", checked)
            }
          />
          <ToggleRow
            id="notifications-on-finish"
            label="When a recording finishes"
            description="Tells you the file is written and ready to watch."
            checked={notifyOnFinish}
            disabled={unavailable || !enabled}
            onCheckedChange={(checked) =>
              setNotificationSetting("notifyOnFinish", checked)
            }
          />
          <ToggleRow
            id="notifications-on-failure"
            label="When a recording fails"
            description="Lets you know a show never recorded, while there's still time to do something about it."
            checked={notifyOnFailure}
            disabled={unavailable || !enabled}
            onCheckedChange={(checked) =>
              setNotificationSetting("notifyOnFailure", checked)
            }
          />
        </div>

        {isGranted && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-6">
              <p className="text-sm text-muted-foreground">
                Not sure they're getting through? Send one to check.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="gap-2 shrink-0"
              >
                <Icons.bell className="h-4 w-4" />
                Send test notification
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
