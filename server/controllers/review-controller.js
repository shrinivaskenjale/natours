const Review = require("../models/review-model");
const catchAsync = require("../utils/catch-async");
const QueryBuilder = require("../utils/query-builder");

// Middleware to add tourId to query from params so that filtering of reviews happens bases on tour.
const setTourId = (req, res, next) => {
  if (req.params.tourId) {
    req.query.tour = req.params.tourId;
  }
  next();
};

const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.tourId })
    .populate({
      path: "tour",
      select: "name",
    })
    .populate({
      path: "user",
      select: "name photo",
    });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

const getOneReview = catchAsync(async (req, res, next) => {
  // Use populate() to fetch referenced documents.
  const review = await Review.findById(req.params.reviewId)
    .populate({
      path: "tour",
      select: "name",
    })
    .populate({
      path: "user",
      select: "name photo",
    });

  if (!review) {
    return next(new AppError("No review found with specified id.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

const setTourUserIds = (req, res, next) => {
  // Don't accept user for the review from body/url parameters, instead use currently logged in user to create new review.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;
  next();
};

const createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create({
    ...req.body,
    tour: req.params.tourId,
    user: req.user._id,
  });
  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);

  if (!review) {
    return next(new AppError("No review found with specified ID.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(new AppError("No review found with specified id.", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getOneReview,
  setTourUserIds,
};
