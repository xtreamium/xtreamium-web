/**
 * Robust logging utility that provides different log levels
 * and respects the environment (development vs production)
 */

import { isDev } from "@/env";

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

class Logger {
  private readonly isDevelopment = isDev;
  private readonly currentLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatMessage(level: LogLevel, context: string | undefined, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    };
    const levelName = levelNames[level];
    const contextStr = context ? `[${context}]` : '';
    
    return `${timestamp} ${levelName} ${contextStr} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private logToConsole(level: LogLevel, context: string | undefined, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, context, message, data);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        // Use console.warn in production to avoid ESLint warnings, but still have output
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.log(formattedMessage);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.logToConsole(LogLevel.DEBUG, context, message, data);
  }

  /**
   * Log general information
   */
  info(message: string, data?: unknown, context?: string): void {
    this.logToConsole(LogLevel.INFO, context, message, data);
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.logToConsole(LogLevel.WARN, context, message, data);
  }

  /**
   * Log errors
   */
  error(message: string, error?: unknown, context?: string): void {
    this.logToConsole(LogLevel.ERROR, context, message, error);
  }

  /**
   * Create a contextual logger for a specific module/component
   */
  withContext(context: string): ContextualLogger {
    return new ContextualLogger(this, context);
  }
}

class ContextualLogger {
  public readonly logger: Logger;
  public readonly context: string;

  constructor(logger: Logger, context: string) {
    this.logger = logger;
    this.context = context;
  }

  debug(message: string, data?: unknown): void {
    this.logger.debug(message, data, this.context);
  }

  info(message: string, data?: unknown): void {
    this.logger.info(message, data, this.context);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(message, data, this.context);
  }

  error(message: string, error?: unknown): void {
    this.logger.error(message, error, this.context);
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export for creating contextual loggers
export { Logger, ContextualLogger };