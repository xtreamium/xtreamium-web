import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/logger";

const GitHubCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const hasTriggered = useRef(false);

  const { mutate: processGitHubCallback, error, isError } = useMutation({
    mutationFn: async (code: string) => {
      logger.info("GitHub callback received", { code: code.substring(0, 10) + "..." }, "github-callback");
      await auth.githubLogin(code);
    },
    onError: (err: any) => {
      logger.error("GitHub login failed", err, "github-callback");
      setTimeout(() => navigate("/auth/login"), 3000);
    },
  });

  useEffect(() => {
    // Prevent multiple executions
    if (hasTriggered.current) {
      return;
    }

    const oauthError = searchParams.get("error");
    const code = searchParams.get("code");

    if (oauthError) {
      logger.error("GitHub OAuth error", { error: oauthError }, "github-callback");
      setTimeout(() => navigate("/auth/login"), 3000);
      return;
    }

    if (!code) {
      logger.error("No code in GitHub callback", {}, "github-callback");
      setTimeout(() => navigate("/auth/login"), 3000);
      return;
    }

    // Mark as triggered and process the callback
    hasTriggered.current = true;
    processGitHubCallback(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorMessage = isError
    ? (error as any)?.response?.data?.detail || "GitHub login failed. Please try again."
    : searchParams.get("error")
    ? "GitHub authentication failed. Please try again."
    : !searchParams.get("code")
    ? "Invalid callback from GitHub."
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {errorMessage ? (
          <>
            <div className="text-destructive text-lg font-semibold">{errorMessage}</div>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Completing GitHub authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallbackPage;
