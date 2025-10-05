import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { logger } from "@/lib/logger";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const auth = useAuth();
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setFormError(null);
    try {
      await auth.login(data.email, data.password);
    } catch (error) {
      logger.debug("Error submitting login details", error, "login-page");
      setFormError("Invalid email or password. Please try again.");
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {import.meta.env.VITE_ENABLE_SOCIAL_AUTH !== "false" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full h-11">
                    <Icons.mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full h-11">
                    <Icons.github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}
            <form
              onSubmit={() => void handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in with Email"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="px-0 font-semibold"
            onClick={() => (window.location.href = "/auth/register")}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
