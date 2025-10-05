import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProxyOutdatedProps {
  currentVersion: string;
  latestVersion: string;
  onDismiss?: () => void;
}

export function ProxyOutdated({
  currentVersion,
  latestVersion,
  onDismiss,
}: ProxyOutdatedProps) {
  return (
    <div className="sticky top-0 z-50 px-6 pt-4 pb-2 bg-background">
      <Alert
        variant="destructive"
        className="border-2 border-destructive bg-destructive text-destructive-foreground py-5 shadow-lg shadow-destructive/20 animate-in fade-in slide-in-from-top-2 duration-500"
      >
        <AlertTriangle className="h-6 w-6 animate-pulse" />
        <AlertTitle className="font-bold text-lg">
          Proxy Update Required
        </AlertTitle>
        <AlertDescription className="text-destructive-foreground">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-base text-destructive-foreground">
              Your local proxy is outdated (v{currentVersion}). Latest version
              is v{latestVersion}. Please update your proxy for the best
              experience.
            </p>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-8 w-8 shrink-0 hover:bg-destructive-foreground/10 text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
