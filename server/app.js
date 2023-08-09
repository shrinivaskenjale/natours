const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const tourRouter = require("./routes/tour-routes");
const userRouter = require("./routes/user-routes");
const bookingRouter = require("./routes/booking-routes");
const AppError = require("./utils/app-error");
const errorHandler = require("./controllers/error-controller");
const { handleStripeEvents } = require("./controllers/booking-controller");

const app = express();

// app.enable("trust proxy");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors({ origin: process.env.CLIENT_BASE_URL, credentials: true }));
// Preflight requests use options http method which does not comes under use method.
app.options("*", cors());

/*
if (process.env.NODE_ENV !== "development") {
  // Limit requests to /api/* endpoints in production
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message:
        "Too many requests from this IP. Please try again after some time.",
    })
  );
}
*/

// app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Webhook endpoint for stripe (Stripe makes request to this endpoint when events occur).
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeEvents
);

// Parse JSON body
app.use(
  express.json({
    limit: "10kb",
  })
);

// Parse cookies
app.use(cookieParser());

// Data sanitization - Cleaning the body data. This middleware should come after body parsing middlewares.
// 1. Data sanitization for NoSQL query injection.
// {"email": {"$gt": ""},"password": "password"} this body will sign anyone in if they know password without knowing email.
app.use(mongoSanitize());
// 2. Data sanitization for XSS attack.
// Try sending HTML through some field in body.
app.use(xss());

// Prevent parameter pollution by clearing query string.
// We don't want ?sort=price&sort=name as it will throw error but we need ?duration=5&duration=9.
app.use(
  hpp({
    whitelist: ["duration"],
  })
);

// Compress responses
app.use(compression());

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Resource endpoints
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);

// Handle unhandled routes with 404 response
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
  // throw new AppError(`Can't find ${req.originalUrl} on this server.`, 404);
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
