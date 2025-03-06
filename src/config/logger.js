import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(({ level, message }) => {
        // Only return the message without timestamp
        return `${message}`;
    }),
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        // Write production logs to a file
        ...(process.env.NODE_ENV === 'production' ? [
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
            new winston.transports.File({ filename: 'combined.log' })
        ] : [])
    ]
});

export default logger; 