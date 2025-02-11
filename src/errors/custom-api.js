class CustomAPIError extends Error {
    constructor(message, StatusCode) {
        super(message);
        this.statusCode = StatusCode;
    }
};

export default CustomAPIError