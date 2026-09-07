import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ProxyService } from "@/services/proxy.service";
import { Recording } from "@/models/recording";
import { formatTime, formatDate } from "@/utils/date-utils";
import CopyButton from "@/components/widgets/copy-button";
import { useQueryClient } from "@tanstack/react-query";
import { useRecordings } from "@/hooks/use-recordings";
import RecordingProgress from "@/components/recording/recording-progress.component";
import InProgressBadge from "@/components/recording/recording-status-badge.component";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RecordingsPage: React.FC = () => {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingRecordings, setDeletingRecordings] = useState<Set<string>>(
    new Set()
  );
  const [recordingToDelete, setRecordingToDelete] = useState<Recording | null>(
    null
  );
  const queryClient = useQueryClient();

  // Shared with the app-wide watchers, so there is one poll interval rather than whichever
  // observer happened to ask for the shortest. The proxy pushes changes as they happen; the
  // poll behind this is only a reconciler.
  const {
    data: recordings = [],
    isLoading: loading,
    isError,
    isProxyConnected,
  } = useRecordings();

  const error = isError ? "Failed to fetch recordings" : deleteError;

  /**
   * The proxy owns the status - it is the only thing that knows whether ffmpeg is running,
   * finished, or fell over. The single clock check below is a fallback for a row the
   * scheduler never fired at all, which leaves it "pending" forever.
   */
  const getRecordingStatus = (recording: Recording) => {
    switch (recording.status) {
      case "recording":
        return "in-progress";
      case "complete":
        return "completed";
      case "partial":
        return "partial";
      case "failed":
        return "failed";
      case "pending":
      default:
        return new Date() > new Date(recording.endTime)
          ? "failed"
          : "scheduled";
    }
  };

  const handlePlay = async (recording: Recording) => {
    if (!recording.filePath) {
      toast.error("Recording file path not available");
      return;
    }

    try {
      const fileUrl = `file://${recording.filePath}`;
      const response = await ProxyService.play(fileUrl);
      if (!response) {
        toast(
          <>
            <div className="font-bold text-foreground">
              🚫 Unable to play recording!
            </div>
            <div className="text-muted-foreground font-sm">
              Cannot find media player installation.
            </div>
            <a
              className="font-bold text-primary"
              href="https://github.com/fergalmoran/xtreamium/#installmpv"
              target="_blank"
              rel="noreferrer noopener"
            >
              See here
            </a>
          </>,
          {
            position: "top-right",
          }
        );
      }
    } catch (e) {
      logger.error("recordings.page", "handlePlay", String(e));
      toast(
        <div>
          <div>🚫 Unable to play recording!</div>
          <div>
            <a
              href="https://github.com/xtreamium/xtreamium-proxy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Make sure you've installed the local server.
            </a>
          </div>
        </div>
      );
    }
  };

  const handleStop = (_recording: Recording) => {
    // TODO: Implement stop functionality
    // Will be provided later by user
  };

  const handleOpenRecordingsFolder = async () => {
    await ProxyService.openRecordingsFolder();
  };

  const handleDeleteClick = (recording: Recording) => {
    setRecordingToDelete(recording);
  };

  const handleConfirmDelete = async () => {
    if (!recordingToDelete) {
      return;
    }

    // Start fade-out animation
    setDeletingRecordings((prev) => new Set(prev).add(recordingToDelete.id));
    setRecordingToDelete(null);

    const clearDeletingState = () =>
      setDeletingRecordings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recordingToDelete.id);
        return newSet;
      });

    try {
      const result = await ProxyService.deleteRecording(recordingToDelete.id);
      if (result) {
        // Let the fade-out finish before the refetch drops the card from the list
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ["recordings"] });
          clearDeletingState();
        }, 300);
      } else {
        clearDeletingState();
        setDeleteError("Failed to delete recording");
      }
    } catch (_err) {
      clearDeletingState();
      setDeleteError("Failed to delete recording");
    }
  };

  const renderActionButtons = (recording: Recording, status: string) => {
    switch (status) {
      case "failed":
      case "scheduled":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(recording)}
            className="gap-1"
          >
            <Icons.delete className="w-4 h-4" />
            Delete
          </Button>
        );
      case "in-progress":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStop(recording)}
              className="gap-1"
            >
              <Icons.delete className="w-4 h-4" />
              Stop
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(recording)}
              className="gap-1"
            >
              <Icons.delete className="w-4 h-4" />
              Delete
            </Button>
          </div>
        );
      case "completed":
      case "partial":
        return (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              disabled={!recording.filePath}
              onClick={() => void handlePlay(recording)}
              className="gap-1"
            >
              <Icons.play className="w-4 h-4" />
              Play
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(recording)}
              className="gap-1"
            >
              <Icons.delete className="w-4 h-4" />
              Delete
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Without this, a proxy that is simply not running reads as "you have no recordings" -
  // the query never runs, so it never errors either.
  if (!isProxyConnected && !deleteError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Icons.proxy className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg font-medium">Proxy is not connected</p>
        <p className="text-sm text-muted-foreground">
          Please make sure the proxy server is installed and running
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Icons.delete className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">
          Please make sure the proxy server is installed and running
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Icons.record className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Recordings
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your scheduled and completed recordings
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => void handleOpenRecordingsFolder()}
              className="gap-2"
            >
              <Icons.folderOpen className="w-4 h-4" />
              Open Folder
            </Button>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="p-8 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30">
              <Icons.record className="w-16 h-16 text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">No recordings found</h2>
              <p className="text-muted-foreground max-w-md">
                You don't have any recordings yet. Start recording your favorite
                shows to see them here!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {recordings.map((recording) => {
              const status = getRecordingStatus(recording);

              let statusBadge = null;
              let cardVariant = "bg-card border hover:shadow-lg";

              switch (status) {
                case "failed":
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm font-medium text-destructive">
                        Failed
                      </span>
                    </div>
                  );
                  cardVariant =
                    "bg-card border-destructive/20 hover:shadow-lg hover:shadow-destructive/5";
                  break;
                case "in-progress":
                  statusBadge = <InProgressBadge recording={recording} />;
                  cardVariant =
                    "bg-card border-primary/20 hover:shadow-lg hover:shadow-primary/5";
                  break;
                case "completed":
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Icons.playCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Complete
                      </span>
                    </div>
                  );
                  cardVariant =
                    "bg-card border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5";
                  break;
                case "partial":
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Icons.playCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Partial
                      </span>
                    </div>
                  );
                  cardVariant =
                    "bg-card border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5";
                  break;
                case "scheduled":
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border">
                      <Icons.alarm className="w-3 h-3 text-secondary-foreground" />
                      <span className="text-sm font-medium text-secondary-foreground">
                        Scheduled
                      </span>
                    </div>
                  );
                  break;
              }

              const isDeleting = deletingRecordings.has(recording.id);

              return (
                <div
                  key={recording.id}
                  className={`rounded-xl border p-6 transition-all duration-300 transform ${
                    isDeleting
                      ? "opacity-0 scale-95 -translate-y-2"
                      : "opacity-100 scale-100 translate-y-0"
                  } ${cardVariant}`}
                  style={{
                    transitionProperty: "opacity, transform",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold leading-tight">
                          {recording.title}
                        </h3>
                        {statusBadge}
                      </div>

                      {/* Time Information */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                          <Icons.alarm className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">
                            {formatDate(recording.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                            {formatTime(recording.startTime)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                            {formatTime(recording.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      {renderActionButtons(recording, status)}
                    </div>
                  </div>

                  {status === "in-progress" && (
                    <RecordingProgress recording={recording} className="mb-4" />
                  )}

                  {/* File Path Section */}
                  {recording.filePath && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-muted">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.server className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Saved Location:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted/50 border rounded px-3 py-2 font-mono">
                          {recording.filePath}
                        </code>
                        <CopyButton
                          textToCopy={recording.filePath}
                          className="shrink-0"
                          title="Copy file path"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={recordingToDelete !== null}
        onOpenChange={(open) => !open && setRecordingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recordingToDelete?.title}"?
              {recordingToDelete?.isRecorded &&
                " This will permanently delete the recorded file from your system."}
              {!recordingToDelete?.isRecorded &&
                " This will cancel the scheduled recording."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecordingsPage;
