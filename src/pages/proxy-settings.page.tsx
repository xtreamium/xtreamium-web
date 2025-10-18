import React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProxyService } from "@/services/proxy.service";

// Zod schema for form validation
const proxySettingsSchema = z.object({
  mediaPlayerPath: z.string().min(1, "Media player path is required"),
  mediaPlayerArguments: z.string().min(0, "Media player arguments must be a valid string"),
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

  const form = useForm<ProxySettingsForm>({
    resolver: zodResolver(proxySettingsSchema),
    defaultValues: {
      mediaPlayerPath: "",
      mediaPlayerArguments: "",
      recordingsPath: "",
      port: 8080,
    },
  });

  const {
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;

  // Update form when data is loaded
  React.useEffect(() => {
    if (settings) {
      reset({
        mediaPlayerPath: settings.mediaPlayerPath,
        mediaPlayerArguments: settings.mediaPlayerArguments,
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

  const handleMediaPlayerPathChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // @ts-ignore - File.path is available in Electron/desktop environments
      setValue("mediaPlayerPath", files[0].path || files[0].name);
    }
  };

  const handleTestConnection = () => {
    try {
      // Here you would implement connection testing
      // Show success/failure message
    } catch (_error) {
      // Handle error
    }
  };

  const handleResetToDefaults = () => {
    reset({
      mediaPlayerPath: "",
      mediaPlayerArguments: "",
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
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Proxy Settings
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Configure your proxy settings to optimize streaming performance and
            customize playback behavior.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icons.settings className="h-5 w-5 text-primary" />
                  </div>
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="mediaPlayerPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Media Player Location
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <Input
                            type="text"
                            placeholder="/usr/bin/mpv or C:\Program Files\VLC\vlc.exe"
                            readOnly
                            className="flex-1 bg-muted/50 cursor-not-allowed"
                            {...field}
                          />
                          <input
                            type="file"
                            className="hidden"
                            id="media-player-path-input"
                            onChange={handleMediaPlayerPathChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-4"
                            asChild
                          >
                            <label
                              htmlFor="media-player-path-input"
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Icons.play className="h-4 w-4" />
                              Browse
                            </label>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the executable path for your media player (e.g., mpv, VLC, etc.).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mediaPlayerArguments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Media Player Command Line Arguments
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="--no-border --ontop --screen=2 --cache=yes --demuxer-max-bytes=5GiB"
                          className="min-h-[100px] resize-none border-input bg-background text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter custom arguments to customize playback behavior. Use \ for line breaks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Port Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8080"
                          min="1"
                          max="65535"
                          className="max-w-xs bg-background"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        The port number for the proxy server (1-65535).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordingsPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Recordings Path
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <Input
                            type="text"
                            placeholder="/home/user/recordings"
                            readOnly
                            className="flex-1 bg-muted/50 cursor-not-allowed"
                            {...field}
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-4"
                            asChild
                          >
                            <label
                              htmlFor="recordings-path-input"
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Icons.server className="h-4 w-4" />
                              Browse
                            </label>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the folder where recorded streams will be saved.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleResetToDefaults()}
                className="gap-2"
              >
                <Icons.rocket className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleTestConnection()}
                className="gap-2"
              >
                <Icons.play className="h-4 w-4" />
                Test Connection
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Icons.download className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.download className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <Icons.info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Need help?
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
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
