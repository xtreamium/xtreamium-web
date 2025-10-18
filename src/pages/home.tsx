import { Icons } from "@/components/icons";
import ProxyInstallComponent from "@/components/widgets/proxy-install";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function HomePage() {
  return (
    <div className="container grid px-6 mx-auto">
      <h1 className="my-6 text-2xl font-semibold text-foreground">
        Welcome to xtreamium
      </h1>

      <Alert className="mb-8">
        <Icons.info className="h-4 w-4" />
        <AlertDescription>
          If you wish to play locally or schedule recordings then please follow
          the below instructions!
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Proxy Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <ProxyInstallComponent />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Media player params</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-card-foreground">
              We like mpv and use these details by default:
            </p>
            <div
              className="bg-muted text-muted-foreground p-4 rounded-md text-sm font-mono whitespace-pre-wrap border"
              dangerouslySetInnerHTML={{
                __html:
                  import.meta.env.VITE_DEFAULT_CLI_ARGS?.replace(
                    / /g,
                    "<br />"
                  ) ?? "",
              }}
            />
            <p className="text-muted-foreground">
              Change them in your settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
