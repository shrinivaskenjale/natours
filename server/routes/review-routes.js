const express = require("express");
const reviewController = require("../controllers/review-controller");
const authController = require("../controllers/auth-controller");

const router = express.Router({ mergeParams: true });
// Since we want access to :tourId path parameter, we need to set mergeParams option to true.

// Protect all the routes
router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:reviewId")
  .get(reviewController.getOneReview)
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  );

module.exports = router;
