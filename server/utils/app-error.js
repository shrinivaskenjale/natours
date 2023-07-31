// AppError - Custom error class
// All errors created using this class will be operational errors.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // 4XX - fail
    // 5XX - error
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";

    // We will send error messages to client only if the error is operational (in our case created using AppError class).
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// https://lucasfcosta.com/2017/02/17/JavaScript-Errors-and-Stack-Traces.html

// https://nodejs.org/dist/latest-v16.x/docs/api/errors.html#errorcapturestacktracetargetobject-constructoropt

// Basically, we call constructor of Error class here inside constructor of the AppError class with super(). So, stack property on instance of AppError will include AppError's constructor in the stack trace. We don't want this behaviour. We want stack trace up to the point where we instantiate AppError class (AppError's constructor not included).

// Calling Error.captureStackTrace() creates the stack trace up to the point where this method is called and puts it into the "stack" property of the object which is provided as first argument. Here we want "stack" property on the AppError instance therefore pass "this" as first argument. This will override the stack property inherited from Error class.

// Second argument to Error.captureStackTrace() is a function. Nothing will be added to stack trace after and including this function. Since we don't want AppError's constructor in stack trace, we pass this.constructor as second argument. This is because when we instantiate a class using new keyword, class's constructor is called.
