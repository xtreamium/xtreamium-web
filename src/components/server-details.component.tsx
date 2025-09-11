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
import { useQuery } from "@tanstack/react-query";
import Loading from "./loading";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(1, { message: "Required" }),
  server: z.string().url({ message: "Invalid URL" }).min(1, { message: "Required" }),
  username: z.string().min(1, { message: "Required" }),
  password: z.string().min(4, { message: "Required" }),
  epgUrl: z.string().url({ message: "Invalid URL" }).min(1, { message: "Required" }),
});

type ServerSchema = z.infer<typeof schema>;

const ServerDetails = () => {
  const navigate = useNavigate();

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

  if (userQuery.isLoading) {
    return <Loading />;
  }

  const onSubmit = async (data: ServerSchema) => {
    const validated = await ApiService.addServer(
      data.name,
      data.server,
      data.username,
      data.password,
      data.epgUrl
    );
    if (validated) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">
        XTream Codes Details
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            disabled={form.formState.isSubmitting}
          >
            <Icons.rocket className="mr-2 h-4 w-4" />
            Let's go!
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ServerDetails;
