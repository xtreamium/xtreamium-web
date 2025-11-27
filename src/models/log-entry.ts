export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  fileName: string;
}

export interface LogsResponse {
  count: number;
  logs: LogEntry[];
}
