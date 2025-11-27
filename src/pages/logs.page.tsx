import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ProxyService } from "@/services/proxy.service";
import type { LogEntry } from "@/models/log-entry";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LOG_LEVELS = ["ALL", "DBG", "INF", "WRN", "ERR"] as const;
const LIMIT_OPTIONS = [50, 100, 250, 500, 1000] as const;

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(100);
  const [level, setLevel] = useState<string>("ALL");
  const [uploading, setUploading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProxyService.getLogs(
        limit,
        level === "ALL" ? undefined : level
      );
      setLogs(data.logs);
    } catch (_err) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [limit, level]);

  const uploadToPastebin = async () => {
    try {
      setUploading(true);
      const url = await ProxyService.uploadLogsToPastebin();
      await navigator.clipboard.writeText(url);
      toast.success("Logs uploaded! URL copied to clipboard", {
        description: url,
      });
    } catch (_err) {
      toast.error("Failed to upload logs to pastebin");
    } finally {
      setUploading(false);
    }
  };

  const getLevelBadgeClass = (logLevel: string) => {
    switch (logLevel) {
      case "ERR":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "WRN":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "INF":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "DBG":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getLevelLabel = (logLevel: string) => {
    switch (logLevel) {
      case "ERR":
        return "Error";
      case "WRN":
        return "Warning";
      case "INF":
        return "Info";
      case "DBG":
        return "Debug";
      default:
        return logLevel;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error && logs.length === 0) {
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Icons.info className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Logs</h1>
              <p className="text-lg text-muted-foreground">
                View proxy server logs
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {LOG_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l === "ALL" ? "All Levels" : getLevelLabel(l)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={limit.toString()}
              onValueChange={(v) => setLimit(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {l} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => void fetchLogs()}
              disabled={loading}
              className="gap-2"
            >
              <Icons.loader
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={() => void uploadToPastebin()}
              disabled={uploading}
              className="gap-2"
              title={uploading ? "Uploading..." : "Upload Pastebin"}
            >
              <Icons.upload
                className={`w-4 h-4 ${uploading ? "animate-pulse" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Timestamp</TableHead>
                <TableHead className="w-24">Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-48">File</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Icons.info className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No logs found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getLevelBadgeClass(
                          log.level
                        )}`}
                      >
                        {getLevelLabel(log.level)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-xl truncate">
                      {log.message}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.fileName}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with count */}
        <div className="text-sm text-muted-foreground text-right">
          Showing {logs.length} log entries
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
