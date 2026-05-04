/**
 * Custom error handler middleware
 * Provides consistent error responses
 */

// Error response function
const errorResponse = (res, statusCode, message, stack) => {
  const response = {
    success: false,
    error: {
      statusCode,
      message
    }
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV !== 'production' && stack) {
    response.error.stack = stack;
  }

  return res.status(statusCode).json(response);
};

// Not Found error handler - for 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} - ${message}`);
    console.error(err.stack);
  }
  
  errorResponse(res, statusCode, message, err.stack);
};

module.exports = {
  notFound,
  errorHandler
};
