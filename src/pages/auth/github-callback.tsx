import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/logger";

const GitHubCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        logger.error("GitHub OAuth error", { error }, "github-callback");
        setError("GitHub authentication failed. Please try again.");
        setTimeout(() => navigate("/auth/login"), 3000);
        return;
      }

      if (!code) {
        logger.error("No code in GitHub callback", {}, "github-callback");
        setError("Invalid callback from GitHub.");
        setTimeout(() => navigate("/auth/login"), 3000);
        return;
      }

      try {
        logger.info("GitHub callback received", { code: code.substring(0, 10) + "..." }, "github-callback");
        await auth.githubLogin(code);
        // Navigation is handled by githubLogin
      } catch (err: any) {
        logger.error("GitHub login failed", err, "github-callback");
        const errorMessage = err?.response?.data?.detail || "GitHub login failed. Please try again.";
        setError(errorMessage);
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-destructive text-lg font-semibold">{error}</div>
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
