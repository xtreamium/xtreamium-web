import React, { useState, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
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
import { env } from "@/env";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setFormError(null);
    try {
      await auth.login(data.email, data.password);
    } catch (error) {
      logger.debug("Error submitting login details", error, "login-page");
      setFormError("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setFormError(null);
    try {
      if (credentialResponse.credential) {
        await auth.googleLogin(credentialResponse.credential);
      }
    } catch (error) {
      logger.error("Google login failed", error, "login-page");
      setFormError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    logger.error("Google login error", {}, "login-page");
    setFormError("Google login failed. Please try again.");
  };
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-linear-to-br from-background to-muted/20">
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
              {env.VITE_ENABLE_SOCIAL_AUTH && googleClientId && (
                <>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      width="100%"
                    />
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
