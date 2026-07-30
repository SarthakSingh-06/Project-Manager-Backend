class ApiError extends Error {
    constructor(statusCode, message, stack="", errors=[]) {
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;

        if (stack)
            this.stack = stack;
        else
            this.stack = Error.captureStackTrace(this, this.constructor);
    };
};

export { ApiError };
