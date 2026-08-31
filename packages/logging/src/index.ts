import pino, { type Logger, type LoggerOptions } from "pino";

const REDACT_PATHS = [
  "privateKey",
  "seed",
  "mnemonic",
  "ENCRYPTION_KEY",
  "SESSION_SECRET",
  "TELEGRAM_BOT_TOKEN",
  "TRADING_API_KEY",
  "CIRCLE_KIT_KEY",
  "ADMIN_API_KEY",
  "ciphertext",
  "authTag",
  "entitySecret",
  "req.headers.authorization",
  "*.privateKey",
  "*.seedPhrase",
  "*.mnemonic",
  "*.encryptionKey",
];

export interface LogContext {
  requestId?: string;
  userId?: string;
  tradeId?: string;
  transactionHash?: string;
  operation?: string;
  status?: string;
  provider?: string;
}

export function createLogger(name: string, level = process.env.LOG_LEVEL ?? "info"): Logger {
  const options: LoggerOptions = {
    name,
    level,
    redact: {
      paths: REDACT_PATHS,
      censor: "[redacted]",
    },
    base: { service: name },
  };
  if (process.env.NODE_ENV === "development") {
    options.transport = { target: "pino/file", options: { destination: 1 } };
  }
  return pino(options);
}

export function childLogger(logger: Logger, ctx: LogContext): Logger {
  return logger.child(ctx);
}
