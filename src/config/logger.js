import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';

const { combine, timestamp, printf, metadata } = format;

const logFormat = printf(({ level, message, timestamp, metadata }) => {
  const metaString = metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} ${level}: ${message} ${metaString}`;
});

const consoleFormat = combine(  
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

const mongoFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  logFormat
);

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: consoleFormat
    }),
    new transports.MongoDB({
      level: 'info',
      db: process.env.MONGODB_URI,
      collection: 'log',
      tryReconnect: true,
      format: mongoFormat,
      expireAfterSeconds: 2592000 // 30 dias
    })
  ]
});

export default logger;