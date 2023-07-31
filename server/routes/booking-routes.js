const express = require("express");
const bookingController = require("../controllers/booking-controller");
const authController = require("../controllers/auth-controller");

const router = express.Router();

router.use(authController.protect);
router.post(
  "/create-checkout-session",
  bookingController.createCheckoutSession
);

router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:bookingId")
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
