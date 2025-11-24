/**
 * Unified Logger System
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level}:`;

  switch (level) {
    case 'info':
      console.log(prefix, message, context || '');
      break;
    case 'warn':
      console.warn(prefix, message, context || '');
      break;
    case 'error':
      console.error(prefix, message, context || '');
      if (context?.error) console.error('Details:', context.error);
      break;
    case 'debug':
      console.debug(prefix, message, context || '');
      break;
  }
}

export const logger = {
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
};

export default logger;
