/**
 * Logger utility for development and production
 * Replaces console.log statements with more controlled logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
  }

  error(message: string, data?: any) {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.level >= LogLevel.INFO && this.isDevelopment) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  debug(message: string, data?: any) {
    if (this.level >= LogLevel.DEBUG && this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // Atlantis specific logging
  atlantis = {
    pointsUpdate: (userId: string, points: number, reason: string) => {
      this.debug(`Atlantis points update`, { userId, points, reason });
    },
    levelUp: (userId: string, newLevel: string) => {
      this.info(`Atlantis level up`, { userId, newLevel });
    },
    allianceAction: (action: string, allianceId: string, userId: string) => {
      this.debug(`Atlantis alliance action`, { action, allianceId, userId });
    }
  };
}

export const logger = new Logger();