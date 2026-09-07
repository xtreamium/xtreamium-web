import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { NotificationUnblockHelp } from "@/components/notifications/notification-unblock-help";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import useNotificationStore from "@/services/state/notification.state";

/**
 * The way back in for someone who dismissed or refused the browser prompt: the settings
 * page is easy to forget about, so this sits in the header whenever notifications are
 * switched on but the browser isn't letting them through. It stays out of the way
 * entirely for anyone who hasn't asked for notifications in the first place.
 */
export const NotificationStatus: React.FC = () => {
  const { enabled } = useNotificationStore();
  const { support, isGranted, isBlocked, request } = useNotificationPermission();
  const [open, setOpen] = useState(false);
  const [showUnblockHelp, setShowUnblockHelp] = useState(false);

  if (!enabled || support !== "supported" || isGranted) {
    return null;
  }

  const handleRequestPermission = async () => {
    const result = await request();
    if (result === "granted") {
      setOpen(false);
      setShowUnblockHelp(false);
      toast.success("Desktop notifications are on.");
      return;
    }
    // Already refused: the browser answers "denied" without prompting, so the only
    // thing left to offer is how to undo it in site settings.
    setShowUnblockHelp(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              title="Notification permission"
            >
              <span className="relative inline-flex p-0.5">
                <Icons.bellOff className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-destructive ring-1 ring-background" />
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-sm">
          Recording notifications aren't getting through
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="space-y-1">
          <p className="font-semibold">
            {isBlocked
              ? "Notifications are blocked"
              : "Notifications need permission"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isBlocked
              ? "Your browser is refusing notifications for Xtreamium, so you won't hear when a recording starts or finishes."
              : "Xtreamium needs your permission before it can tell you when a recording starts or finishes."}
          </p>
        </div>

        {showUnblockHelp && (
          <div className="rounded-md border bg-muted/40 p-3">
            <NotificationUnblockHelp />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleRequestPermission()}
            className="gap-2"
          >
            <Icons.bell className="h-4 w-4" />
            {isBlocked ? "Ask again" : "Allow notifications"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link to="/settings">Settings</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationStatus;
