import { StatusCodes } from 'http-status-codes';

const errorHandler = (err, req, res, next) => {
    // If response is already sent, pass to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Default error response
    const defaultError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong, try again later',
    };

    // Send error response
    res.status(defaultError.statusCode).json({
        success: false,
        error: {
            message: defaultError.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

export default errorHandler;