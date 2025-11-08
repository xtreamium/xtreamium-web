import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ProxyService } from "@/services/proxy.service";
import { Recording } from "@/models/recording";
import { formatTime, formatDate } from "@/utils/date-utils";
import CopyButton from "@/components/widgets/copy-button";

const RecordingsPage: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRecordings, setDeletingRecordings] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const data = await ProxyService.getRecordings();
        setRecordings(data);
      } catch (_err) {
        setError("Failed to fetch recordings");
      } finally {
        setLoading(false);
      }
    };

    void fetchRecordings();
  }, []);

  const getRecordingStatus = (recording: Recording) => {
    const now = new Date();
    const startTime = new Date(recording.startTime);
    const endTime = new Date(recording.endTime);

    if (now > endTime && !recording.isRecorded) {
      return "failed";
    } else if (now >= startTime && now <= endTime) {
      return "in-progress";
    } else if (now > endTime && recording.isRecorded) {
      return "completed";
    } else {
      return "scheduled";
    }
  };

  const handlePlay = (_recording: Recording) => {
    // TODO: Implement play functionality
    // Will be provided later by user
  };

  const handleStop = (_recording: Recording) => {
    // TODO: Implement stop functionality
    // Will be provided later by user
  };

  const handleDelete = async (recording: Recording) => {
    // Start fade-out animation
    setDeletingRecordings((prev) => new Set(prev).add(recording.id));

    try {
      const result = await ProxyService.deleteRecording(recording.id);
      if (result) {
        // Wait for fade animation to complete before removing from list
        setTimeout(() => {
          setRecordings((prev) => prev.filter((r) => r.id !== recording.id));
          setDeletingRecordings((prev) => {
            const newSet = new Set(prev);
            newSet.delete(recording.id);
            return newSet;
          });
        }, 300); // Match the CSS transition duration
      } else {
        // If deletion fails, remove from deleting state
        setDeletingRecordings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recording.id);
          return newSet;
        });
        setError("Failed to delete recording");
      }
    } catch (_err) {
      // If deletion fails, remove from deleting state
      setDeletingRecordings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recording.id);
        return newSet;
      });
      setError("Failed to delete recording");
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
            onClick={() => handleDelete(recording)}
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
              onClick={() => handleDelete(recording)}
              className="gap-1"
            >
              <Icons.delete className="w-4 h-4" />
              Delete
            </Button>
          </div>
        );
      case "completed":
        return (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePlay(recording)}
              className="gap-1"
            >
              <Icons.play className="w-4 h-4" />
              Play
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(recording)}
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
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Icons.record className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Recordings</h1>
              <p className="text-lg text-muted-foreground">
                Manage your scheduled and completed recordings
              </p>
            </div>
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
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">
                        Recording
                      </span>
                    </div>
                  );
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
    </div>
  );
};

export default RecordingsPage;
