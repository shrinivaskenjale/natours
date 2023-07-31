const express = require("express");
const tourController = require("../controllers/tour-controller");
const authController = require("../controllers/auth-controller");
const reviewRouter = require("./review-routes");

const router = express.Router();

// Alias routes allow you to perform a operation that would noramally be the responsibility of another route.
// Getting top 5 cheap tours normally can be done using GET /tours endpoint by providing necessary query parameters. But, we created /top-5-cheap route to do the same task.
// Reason to create alias routes can be that specific data is requested all the time.
// We add query parameters using middleware.
// /:tourId route can can match this route, so place it after this route.
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopCheapTours, tourController.getAllTours);
router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/my-tours")
  .get(authController.protect, tourController.getMyTours);

router
  .route("/:tourId")
  .get(tourController.getOneTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

/**
 * Nested routes make sense when there is parent-child relationship between resources.
 * For example, each review is child of some tour.
 *
 * POST /tour/<tourId>/reviews => Create new review for a tour
 * GET /tour/<tourId>/reviews => Get all reviews for a tour
 * GET /tour/<tourId>/reviews/<reviewId> => Get a review for a tour
 */
// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );

router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
