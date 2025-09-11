import React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProxyService } from "@/services/proxy.service";

// Zod schema for form validation
const proxySettingsSchema = z.object({
  mpvArguments: z.string().min(0, "MPV arguments must be a valid string"),
  recordingsPath: z.string().min(1, "Recordings path is required"),
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .int("Port must be a whole number"),
});

type ProxySettingsForm = z.infer<typeof proxySettingsSchema>;

const ProxySettingsPage: React.FC = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["proxy-settings"],
    queryFn: ProxyService.getSettings,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProxySettingsForm>({
    resolver: zodResolver(proxySettingsSchema),
    defaultValues: {
      mpvArguments: "",
      recordingsPath: "",
      port: 8080,
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (settings) {
      reset({
        mpvArguments: settings.mpvArguments,
        recordingsPath: settings.recordingsPath,
        port: settings.port,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: ProxySettingsForm) => {
    try {
      await ProxyService.saveSettings(data);
      // You might want to show a success message here
      await refetch();
    } catch (_error) {
      // Handle error (show toast, etc.)
    }
  };

  const handleRecordingsPathChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const path = files[0].webkitRelativePath.split("/")[0];
      setValue("recordingsPath", path);
    }
  };

  const handleTestConnection = async () => {
    try {
      // Here you would implement connection testing
      // Show success/failure message
    } catch (_error) {
      // Handle error
    }
  };

  const handleResetToDefaults = () => {
    reset({
      mpvArguments: "",
      recordingsPath: "",
      port: 8080,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Proxy Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Loading proxy settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <Icons.info className="h-4 w-4" />
          <AlertTitle>Error loading settings</AlertTitle>
          <AlertDescription>
            Failed to load proxy settings. Please make sure the proxy is
            installed and running.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proxy Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your proxy settings to optimize streaming performance
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Textarea
                  id="mpv-args"
                  placeholder=""
                  className="min-h-24"
                  {...register("mpvArguments")}
                />
                {errors.mpvArguments && (
                  <p className="text-sm text-destructive">
                    {errors.mpvArguments.message}
                  </p>
                )}
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
                  {...register("port", { valueAsNumber: true })}
                />
                {errors.port && (
                  <p className="text-sm text-destructive">
                    {errors.port.message}
                  </p>
                )}
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
                    {...register("recordingsPath")}
                  />
                  <input
                    type="file"
                    className="hidden"
                    id="recordings-path-input"
                    {...({ webkitdirectory: "true" } as Record<
                      string,
                      unknown
                    >)}
                    onChange={handleRecordingsPathChange}
                  />
                  <Button type="button" variant="outline" asChild>
                    <label
                      htmlFor="recordings-path-input"
                      className="cursor-pointer"
                    >
                      <Icons.server className="h-4 w-4" />
                      Browse
                    </label>
                  </Button>
                </div>
                {errors.recordingsPath && (
                  <p className="text-sm text-destructive">
                    {errors.recordingsPath.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Select a folder where recordings will be saved.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetToDefaults}
            >
              <Icons.rocket className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestConnection}
            >
              <Icons.play className="h-4 w-4" />
              Test Connection
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Icons.download className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>

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
