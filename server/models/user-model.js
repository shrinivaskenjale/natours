// const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Email is not valid."],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    // Hide this field by default when documents are queried. Use .select('+password') query to explicitly get this field in results.
    // This field will be present in newly created docs using save() or create(). It just hides the field from docs queried from DB using find methods.
    // select: false,
  },

  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpiresAt: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
