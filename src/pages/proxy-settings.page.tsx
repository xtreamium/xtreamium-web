import React, { useState, useEffect, useCallback } from "react";
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
import { ProxyService, PROXY_PORT_STORAGE_KEY } from "@/services/proxy.service";
import { FolderBrowserDialog } from "@/components/widgets/folder-browser-dialog";
import { env } from "@/env";

const portSchema = z.object({
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .int("Port must be a whole number"),
});

const proxySettingsSchema = z.object({
  mediaPlayerPath: z.string().min(1, "Media player path is required"),
  mediaPlayerArguments: z.string(),
  recordingsPath: z.string().min(1, "Recordings path is required"),
});

type PortForm = z.infer<typeof portSchema>;
type ProxySettingsForm = z.infer<typeof proxySettingsSchema>;

function getDefaultPort(): number {
  const stored = localStorage.getItem(PROXY_PORT_STORAGE_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }
  try {
    return parseInt(env.VITE_PROXY_PORT || "5000", 10);
  } catch {
    return 8963;
  }
}

const ProxySettingsPage: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [showReachableAlert, setShowReachableAlert] = useState(false);
  const [folderBrowserOpen, setFolderBrowserOpen] = useState(false);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);

  const portForm = useForm<PortForm>({
    resolver: zodResolver(portSchema),
    defaultValues: { port: getDefaultPort() },
  });

  const settingsForm = useForm<ProxySettingsForm>({
    resolver: zodResolver(proxySettingsSchema),
    defaultValues: {
      mediaPlayerPath: "",
      mediaPlayerArguments: "",
      recordingsPath: "",
    },
  });

  const {
    setValue,
    reset,
    formState: { isSubmitting },
  } = settingsForm;

  const { data: settings, refetch } = useQuery({
    queryKey: ["proxy-settings"],
    queryFn: ProxyService.getSettings,
    retry: false,
    enabled: isReachable === true,
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        mediaPlayerPath: settings.mediaPlayerPath,
        mediaPlayerArguments: settings.mediaPlayerArguments,
        recordingsPath: settings.recordingsPath,
      });
    }
  }, [settings, reset]);

  const handleTestConnection = useCallback(async (port?: number, manual = false) => {
    const portValue = port ?? portForm.getValues("port");

    localStorage.setItem(PROXY_PORT_STORAGE_KEY, String(portValue));

    setIsTestingConnection(true);
    setIsReachable(null);
    setShowReachableAlert(false);
    try {
      const version = await ProxyService.getVersion();
      const reachable = version !== null;
      setIsReachable(reachable);
      if (reachable) {
        setShowReachableAlert(manual);
        await refetch();
      }
    } catch {
      setIsReachable(false);
    } finally {
      setIsTestingConnection(false);
    }
  }, [portForm, refetch]);

  useEffect(() => {
    void handleTestConnection();
  }, [handleTestConnection]);

  const onPortSubmit = async (data: PortForm) => {
    await handleTestConnection(data.port, true);
  };

  const onSettingsSubmit = async (data: ProxySettingsForm) => {
    try {
      await ProxyService.saveSettings({
        ...data,
        port: portForm.getValues("port"),
      });
      await refetch();
    } catch (_error) {
      // TODO: show error toast
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Proxy Settings
          </h1>
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <Icons.info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">
              What's all this about?
            </AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              A local proxy is required so that xtreamium can do things a
              browser is not allowed to - such as recording streams, transcoding
              video, and using custom media players.
            </AlertDescription>
          </Alert>
        </div>

        {/* Port card - always visible */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="rounded-lg bg-primary/10 p-2">
                <Icons.proxy className="h-5 w-5 text-primary" />
              </div>
              Proxy Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <Form {...portForm}>
              <form onSubmit={portForm.handleSubmit(onPortSubmit)}>
                <div className="flex items-center gap-3">
                  <FormField
                    control={portForm.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem className="flex-none">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8963"
                            min="1"
                            max="65535"
                            className="w-28 bg-background tabular-nums"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isTestingConnection}
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <>
                        <Icons.loader className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Icons.play className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {showReachableAlert && (
                  <Alert className="mt-4 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                    <Icons.check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Proxy is reachable - settings loaded below.
                    </AlertDescription>
                  </Alert>
                )}
                {isReachable === false && (
                  <Alert
                    variant="destructive"
                    className="mt-4 bg-destructive/5"
                  >
                    <Icons.info className="h-4 w-4" />
                    <AlertDescription className="block!">
                      Could not reach proxy on port{" "}
                      <span className="font-mono font-semibold">
                        {portForm.getValues("port")}
                      </span>
                      . Make sure it is running and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Settings - only shown once reachable */}
        {isReachable === true && (
          <Form {...settingsForm}>
            <form
              onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}
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
                <CardContent className="space-y-8 pb-8">
                  <FormField
                    control={settingsForm.control}
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
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="px-4 gap-2"
                              onClick={() => setFileBrowserOpen(true)}
                            >
                              <Icons.folderOpen className="h-4 w-4" />
                              Browse
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the executable path for your media player
                          (e.g., mpv, VLC).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
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
                          Enter custom arguments to customize playback behavior.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
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
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="px-4 gap-2"
                              onClick={() => setFolderBrowserOpen(true)}
                            >
                              <Icons.folderOpen className="h-4 w-4" />
                              Browse
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the folder where recorded streams will be
                          saved.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Icons.loader className="h-4 w-4 animate-spin" />
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
        )}
      </div>

      <FolderBrowserDialog
        open={folderBrowserOpen}
        onOpenChange={setFolderBrowserOpen}
        onSelect={(path) => setValue("recordingsPath", path)}
        title="Select Recordings Folder"
        mode="folder"
      />

      <FolderBrowserDialog
        open={fileBrowserOpen}
        onOpenChange={setFileBrowserOpen}
        onSelect={(path) => setValue("mediaPlayerPath", path)}
        title="Select Media Player"
        mode="file"
      />
    </div>
  );
};

export default ProxySettingsPage;
