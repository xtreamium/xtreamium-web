import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ApiService } from "@/services";
import { Icons } from "./icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "./loading";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useServerStore from "@/services/state/server.state";
import { logger } from "@/lib/logger";

const schema = z.object({
  name: z.string().min(1, { message: "Required" }),
  server: z
    .string()
    .url({ message: "Invalid URL" })
    .min(1, { message: "Required" }),
  username: z.string().min(1, { message: "Required" }),
  password: z.string().min(4, { message: "Required" }),
  epgUrl: z
    .string()
    .url({ message: "Invalid URL" })
    .min(1, { message: "Required" }),
});

type ServerSchema = z.infer<typeof schema>;

const ServerDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedServer } = useServerStore();
  const [epgCheckError, setEpgCheckError] = useState<string | null>(null);
  const [isCheckingEpg, setIsCheckingEpg] = useState(false);
  const [isRefreshingEpg, setIsRefreshingEpg] = useState(false);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });

  const form = useForm<ServerSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      server: "",
      username: "",
      password: "",
      epgUrl: "",
    },
  });

  const watchedFields = form.watch(["server", "username", "password"]);

  useEffect(() => {
    const [server, username, password] = watchedFields;

    if (server && username && password) {
      try {
        const serverUrl = new URL(server);
        const epgUrl = `${
          serverUrl.origin
        }/xmltv.php?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`;
        form.setValue("epgUrl", epgUrl);
      } catch (error) {
        logger.debug(
          "Error opening Server Details",
          error,
          "server-details.component"
        );
      }
    } else {
      form.setValue("epgUrl", "");
    }
  }, [watchedFields, form]);

  if (userQuery.isLoading) {
    return <Loading />;
  }

  const onSubmit = async (data: ServerSchema) => {
    setEpgCheckError(null);
    setIsCheckingEpg(true);

    try {
      const isEpgUrlAccessible = await ApiService.checkUrl(data.epgUrl);
      if (!isEpgUrlAccessible) {
        setEpgCheckError(
          "EPG URL is not accessible. Please check the URL and try again."
        );
        return;
      }

      const serverId = await ApiService.addServer(
        data.name,
        data.server,
        data.username,
        data.password,
        data.epgUrl
      );

      if (serverId) {
        setIsCheckingEpg(false);
        setIsRefreshingEpg(true);

        try {
          await ApiService.refreshEPG(serverId);

          // Set the newly added server as the selected server
          setSelectedServer(serverId);

          // Invalidate the user query to refresh server list
          await queryClient.invalidateQueries({ queryKey: ["user"] });

          await navigate("/");
        } catch (error) {
          logger.debug("Error seting EPG", error, "server-details.component");
          setEpgCheckError(
            "Failed to refresh EPG data. The server has been added but EPG data may not be available yet."
          );
        } finally {
          setIsRefreshingEpg(false);
        }
      } else {
        setEpgCheckError(
          "Failed to add server. Please check your details and try again."
        );
      }
    } catch (error) {
      logger.debug("Error seting EPG", error, "server-details.component");
      setEpgCheckError(
        "Failed to add server. Please check your details and try again."
      );
    } finally {
      setIsCheckingEpg(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">
        XTream Codes Details
      </h1>

      {epgCheckError && (
        <Alert className="mb-4 border-destructive">
          <Icons.info className="h-4 w-4" />
          <AlertDescription>{epgCheckError}</AlertDescription>
        </Alert>
      )}

      {/* EPG Refresh Overlay */}
      {isRefreshingEpg && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="bg-card border rounded-lg p-6 shadow-lg max-w-sm mx-4">
            <div className="text-center space-y-4">
              <Icons.loader className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Refreshing EPG Data</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  This may take up to 2 minutes. Please wait while we download
                  and process your EPG data...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={() => form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Name of your new server"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Address</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="my.streams.com"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="username"
                    autoComplete="off"
                    data-lpignore="true"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="off"
                    data-lpignore="true"
                    placeholder="***************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="epgUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>EPG URL</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="on"
                    data-lpignore="true"
                    placeholder="http://my.epg.com/xmltv.php?username=xxxx&password=xxxxx"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={
              form.formState.isSubmitting || isCheckingEpg || isRefreshingEpg
            }
          >
            {isCheckingEpg ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Checking EPG URL...
              </>
            ) : isRefreshingEpg ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Refreshing EPG data...
              </>
            ) : (
              <>
                <Icons.rocket className="mr-2 h-4 w-4" />
                Let's go!
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ServerDetails;
