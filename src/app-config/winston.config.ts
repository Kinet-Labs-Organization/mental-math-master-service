
import * as winston from 'winston';
import { format } from 'winston';
import { trace, context } from '@opentelemetry/api';

// Add traceId from OTel
const addTraceId = format((info) => {
  const span = trace.getSpan(context.active());
  const traceId = span?.spanContext().traceId;
  if (traceId) {
    info.traceId = traceId;
  }
  return info;
});

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

winston.addColors(customColors);

export const WinstonOptions = {
  levels: customLevels,
  level: process.env.ENV === 'development' ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: format.combine(
        addTraceId(),
        format.colorize({ all: true }),
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.printf(
          ({
            timestamp,
            level,
            message,
            traceId,
            stack,
          }: {
            timestamp: string;
            level: string;
            message: string;
            traceId: string;
            stack: string;
          }) => {
            const context = process.env.APP_NAME || 'NestApp';
            const tracePart = traceId
              ? `\x1b[90m[TraceID: ${traceId}]\x1b[0m `
              : '';
            const base = `\x1b[34m[${timestamp}]\x1b[0m \x1b[37m[${context}]\x1b[0m [${level}] ${tracePart}${message}`;
            return stack ? `${base}\n${stack}` : base;
          },
        ),
      ),
    }),
  ],
};
