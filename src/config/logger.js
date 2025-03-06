import winston from 'winston';

// Custom format that only prints the message
const simpleFormat = winston.format.printf(({ level, message }) => {
  return message;
});

// Create different transports for different environments
const consoleTransport = new winston.transports.Console({
  format: simpleFormat
});

const fileTransports = [
  new winston.transports.File({ filename: 'error.log', level: 'error' }),
  new winston.transports.File({ filename: 'combined.log' })
];

// Use minimal logging in development, full logging in production
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    consoleTransport,
    ...(process.env.NODE_ENV === 'production' ? fileTransports : [])
  ]
});

export default logger; 