const AppError = require("../utils/app-error");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const duplicateValues = Object.values(err.keyValue).join(", ");
  const message = `Duplicate field values: ${duplicateValues}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMessages = Object.values(err.errors)
    .map((value) => value.message)
    .join(" ");
  const message = `Invalid input data. ${errorMessages}`;
  return new AppError(message, 400);
};

const handleJWTValidationError = (err) => {
  const message = "Invalid token. Please log in again.";
  return new AppError(message, 401);
};

const handleJWTExpiredError = (err) => {
  const message = "Your token has expired. Please log in again.";
  return new AppError(message, 401);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    // Some errors are not thrown by you but still they should considered as operational errors. For such errors use custom error class AppError to mark them operational errors.

    // Errors thrown by mongoose have unique names but, errors thrown by mongodb driver are named 'MongoError' with unique 'code' property.

    if (err.name === "CastError") {
      // Handle invalid db ids
      error = handleCastErrorDB(err);
    } else if (err.code === 11000) {
      // Handle duplicate fields
      error = handleDuplicateFieldDB(err);
    } else if (err.name === "ValidationError") {
      // Handle validation errors
      error = handleValidationErrorDB(err);
    } else if (err.name === "JsonWebTokenError") {
      // Handle JWT validation errors
      error = handleJWTValidationError(err);
    } else if (err.name === "TokenExpiredError") {
      // Handle JWT expired errors
      error = handleJWTExpiredError(err);
    }

    if (error.isOperational) {
      // Send error message for operational errors.
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // This log will be visible in console of hosting platform.
      console.error(`ERROR ❌ ${error}`);

      // Send generic message for programming/unknown errors.
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};

module.exports = errorHandler;
