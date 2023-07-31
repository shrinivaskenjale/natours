// Handling uncaught exceptions (errors in synchronous code outside express middlewares)
process.on("uncaughtException", (err) => {
  console.log("💥 UNCAUGHT EXCEPTION | Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config.env") });
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.DATABASE, {
  dbName: "natours",
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});

// Handling unhandled rejections (rejected promises outside express middlewares)
process.on("unhandledRejection", (err) => {
  console.log("💥 UNHANDLED REJECTION | Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
  // 0 - success
  // 1 - uncaught exception
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED | Shutting down...");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
