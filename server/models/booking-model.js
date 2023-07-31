const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookingSchema = new Schema({
  tour: {
    type: mongoose.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a tour."],
  },
  user: {
    type: mongoose.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user."],
  },
  // Price of the tour might change in the future. But we should keep track of price at which booking was done in the past.
  price: {
    type: Number,
    required: [true, "Booking must have a price."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // If payment is done outside our application. For example, with cash at office.
  paid: {
    type: Boolean,
    default: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
