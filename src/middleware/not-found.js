/**
 * Middleware to handle 404 Not Found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
};

export default notFoundMiddleware; 