import { Icons } from "@/components/icons";
import ProxyInstallComponent from "@/components/widgets/proxy-install";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function HomePage() {
  return (
    <div className="container grid px-6 mx-auto">
      <h1 className="my-6 text-2xl font-semibold text-foreground">Welcome to xtreamium</h1>
      
      <Alert className="mb-8">
        <Icons.info className="h-4 w-4" />
        <AlertDescription>
          If you wish to play locally or schedule recordings then please
          follow the below instructions!
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">mpv Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground">
            <a 
              href="https://mpv.io/" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Follow the instructions for your operating system to install mpv
            </a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">mpv params</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-card-foreground">
              Default mpv params are:
            </p>
            <div
              className="bg-muted text-muted-foreground p-4 rounded-md text-sm font-mono whitespace-pre-wrap border"
              dangerouslySetInnerHTML={{
                __html:
                  import.meta.env.VITE_MPV_DEFAULTS?.replace(/ /g, "<br />") ??
                  "",
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
