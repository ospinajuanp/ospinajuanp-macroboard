export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const RESET = '\x1b[0m';

const ACTIVE_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || 'info';

const USE_COLOR = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function formatTimestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>): string {
  const ts = formatTimestamp();
  const base = `[${ts}] [${level.toUpperCase()}] [${module}] ${message}`;
  if (!meta || Object.keys(meta).length === 0) {
    return base;
  }
  const serialized = Object.entries(meta)
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(' ');
  return `${base} ${serialized}`;
}

function emit(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[ACTIVE_LEVEL]) return;
  const line = format(level, module, message, meta);
  const out = USE_COLOR ? `${LEVEL_COLOR[level]}${line}${RESET}` : line;
  if (level === 'error' || level === 'warn') {
    process.stderr.write(out + '\n');
  } else {
    process.stdout.write(out + '\n');
  }
}

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  child: (submodule: string) => Logger;
}

export function createLogger(module: string): Logger {
  const log = (level: LogLevel) => (message: string, meta?: Record<string, unknown>) =>
    emit(level, module, message, meta);
  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    child: (submodule: string) => createLogger(`${module}:${submodule}`),
  };
}