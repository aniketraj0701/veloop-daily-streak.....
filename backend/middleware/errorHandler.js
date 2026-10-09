/**
 * Global centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Global Exception caught:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_RESOURCE',
      message: 'Duplicate key conflict. This reward may have already been claimed.',
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: messages.join(', '),
    });
  }

  // Handle JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid session token provided.',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'An unexpected internal server error occurred.',
  });
};

module.exports = errorHandler;
