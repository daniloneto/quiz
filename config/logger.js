const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize } = format;
require('winston-mongodb');

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 5 
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 20 * 1024 * 1024, 
      maxFiles: 5 
    }),
    new transports.MongoDB({
      level: 'info',
      db: process.env.MONGODB_URI, 
      collection: 'log',
      tryReconnect: true      
    })
  ]
});

module.exports = logger;