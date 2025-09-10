import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services";

const ProxySettingsPage: React.FC = () => {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
    retry: false,
  });
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proxy Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your proxy settings to optimize streaming performance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mpv-args">MPV command line arguments</Label>
              <Textarea id="mpv-args" placeholder="" className="min-h-24" />
              <p className="text-sm text-muted-foreground">
                Use \ for line breaks.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port Number</Label>
              <Input
                id="port"
                type="number"
                placeholder="8080"
                min="1"
                max="65535"
              />
              <p className="text-sm text-muted-foreground">
                Enter a port number between 1 and 65535.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordings-path">Recordings Path</Label>
              <div className="flex gap-2">
                <Input
                  id="recordings-path"
                  type="text"
                  placeholder="/home/user/recordings"
                  readOnly
                  className="flex-1"
                />
                <input
                  type="file"
                  className="hidden"
                  id="recordings-path-input"
                  {...({ webkitdirectory: "true" } as Record<string, unknown>)}
                />
                <Button variant="outline" asChild>
                  <label
                    htmlFor="recordings-path-input"
                    className="cursor-pointer"
                  >
                    <Icons.server className="h-4 w-4" />
                    Browse
                  </label>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Select a folder where recordings will be saved.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <Icons.rocket className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button variant="secondary">
            <Icons.play className="h-4 w-4" />
            Test Connection
          </Button>
          <Button>
            <Icons.download className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        <Alert>
          <Icons.info className="h-4 w-4" />
          <AlertTitle>Need help?</AlertTitle>
          <AlertDescription>
            Proxy settings help route your streaming traffic through a secure
            connection. Contact your network administrator if you're unsure
            about these settings.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProxySettingsPage;
