import { Input, Label, Button, HelperText } from "./widgets";
import { useForm, SubmitHandler } from "react-hook-form";
import { ApiService } from "@/services";
import { Icons } from "./icons";
import { useQuery } from "@tanstack/react-query";
import Loading from "./widgets/loading.component";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

// type Inputs = {
//   name: string;
//   server: string;
//   username: string;
//   password: string;
//   epgUrl: string;
// };

const ServerDetails = () => {
  const navigate = useNavigate();

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  if (userQuery.isLoading) {
    return <Loading />;
  }

  const schema = z.object({
    name: z.string().min(1, { message: "Required" }),
    server: z.string().url({ message: "Invalid URL" }).min(1, { message: "Required" }),
    username: z.string().min(1, { message: "Required" }),
    password: z.string().min(4, { message: "Required" }),
    epgUrl: z.string().url({ message: "Invalid URL" }).min(1, { message: "Required" }),
  });
  type ServerSchema = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerSchema>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<ServerSchema> = async (data: {
    name: string;
    server: string;
    username: string;
    password: string;
    epgUrl: string;
  }) => {
    console.log("server-details.component", "onSubmit", errors);
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
    <div className="w-full">
      <h1 className="mb-4 text-xl font-semibold text-primary-content">
        XTream Codes Details
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="false">
        <Label>
          <span>Server Name</span>
          <Input
            className="flex-grow mt-1"
            type="text"
            placeholder="Name of your new server"
            autoComplete="off"
            {...register("name")}
          />
          {errors.name && (
            <HelperText valid={false}>{errors.name.message as string}</HelperText>
          )}
        </Label>
        <Label className="mt-4">
          <span>Server address</span>
          <Input
            className="flex-grow mt-1"
            type="text"
            placeholder="my.streams.com"
            autoComplete="off"
            {...register("server")}
          />
          {errors.server && (
            <HelperText valid={false}>{errors.server.message as string}</HelperText>
          )}
        </Label>
        <Label className="mt-4">
          <span>Username</span>
          <Input
            className="flex-grow mt-1"
            type="text"
            placeholder="username"
            autoComplete="off"
            data-lpignore="true"
            {...register("username")}
          />
          {errors.username && (
            <HelperText valid={false}>{errors.username.message as string}</HelperText>
          )}
        </Label>
        <Label className="mt-4">
          <span>Password</span>
          <Input
            className="flex-grow mt-1"
            type="password"
            autoComplete="off"
            data-lpignore="true"
            placeholder="***************"
            {...register("password")}
          />
          {errors.password && (
            <HelperText valid={false}>{errors.password.message as string}</HelperText>
          )}
        </Label>
        <Label className="mt-4">
          <span>EPG Url</span>
          <Input
            className="flex-grow mt-1"
            type="text"
            autoComplete="on"
            data-lpignore="true"
            placeholder="http://my.epg.com/xmltv.php?username=xxxx&password=xxxxx"
            {...register("epgUrl")}
          />
          {errors.epgUrl && (
            <HelperText valid={false}>{errors.epgUrl.message as string}</HelperText>
          )}
        </Label>

        <Button
          className="mt-4"
          block
          type="submit"
          aria-label="Submit"
          icon={Icons.rocket}
        >
          Let's go!
        </Button>
      </form>
    </div>
  );
};

export default ServerDetails;
