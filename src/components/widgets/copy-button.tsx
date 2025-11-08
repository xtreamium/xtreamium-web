import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface CopyButtonProps {
  textToCopy: string;
  variant?: "ghost" | "outline" | "default" | "destructive" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  successMessage?: string;
  title?: string;
  showText?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  variant = "ghost",
  size = "sm",
  className = "",
  successMessage = "Copied!",
  title,
  showText = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCopy = async () => {
    try {
      setIsProcessing(true);
      await navigator.clipboard.writeText(textToCopy);
      
      // Show success after a short delay to let spinner be visible
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(true);
        // Clear success state after 1.5 more seconds
        setTimeout(() => setShowSuccess(false), 1500);
      }, 500);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setTimeout(() => {
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1500);
        }, 500);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
        setIsProcessing(false);
      }
      document.body.removeChild(textArea);
    }
  };

  const displayTitle = title || (showSuccess ? successMessage : isProcessing ? "Copying..." : "Copy");

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
      title={displayTitle}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Icons.loader className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          {showText && <span className="ml-2">Copy</span>}
        </>
      ) : showSuccess ? (
        <>
          <Icons.loader className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {showText && <span className="ml-2">{successMessage}</span>}
        </>
      ) : (
        <>
          <Icons.copy className="w-4 h-4" />
          {showText && <span className="ml-2">Copy</span>}
        </>
      )}
    </Button>
  );
};

export default CopyButton;
