import { StatusCodes } from 'http-status-codes';

/**
 * Base class for custom API errors
 */
class CustomAPIError extends Error {
    constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.construction);
    }
};

export default CustomAPIError;