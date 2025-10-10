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
        className="border bg-destructive/10 text-foreground py-4 relative"
      >
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="absolute top-2 right-2 h-8 w-8 shrink-0 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="font-semibold text-base text-destructive">
          Your local proxy is outdated!!
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          <div className="space-y-1 pr-8">
            <p className="text-sm">
              Your current version is{" "}
              <span className="font-semibold text-destructive">
                {currentVersion}
              </span>
              , but the latest version is{" "}
              <span className="font-semibold text-destructive">
                {latestVersion}
              </span>
              .
            </p>
            <p className="text-sm">
              Please download the latest version from{" "}
              <a
                href="https://github.com/xtreamium/xtreamium-proxy/releases"
                target="_blank"
                className="font-semibold text-destructive underline hover:text-destructive/80 transition-colors"
              >
                here
              </a>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
