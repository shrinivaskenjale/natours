const Tour = require("../models/tour-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const QueryBuilder = require("../utils/query-builder");
const multer = require("multer");
const sharp = require("sharp");
const Booking = require("../models/booking-model");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// multiple files in multiple fields => upload.fields([]) => req.files ({field1: [file1], field2: [file1, file2]})
const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// single file in single field => upload.single('image') => req.file (file)
// multiple files in single field => upload.array('images', 5) => req.files ([file1, file2, ...])

const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Add paths of both fields direclty on body, because we direclty pass body to mongoose for update.

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.tourId}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.tourId}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

const getAllTours = catchAsync(async (req, res, next) => {
  // Construct the query
  const queryBuilder = new QueryBuilder(Tour, req.query)
    .filter()
    .sort()
    .select()
    .paginate();
  // Execute the query
  const tours = await queryBuilder.query.populate({
    path: "guides",
    select: "-__v -passwordChangedAt -password",
  });

  // We could send 404 error if 0 results are found or if requested page does not exist. But actually there was no error because DB searched for documents with specified filter and found 0 documents. So, 0 records are exactly what we will send to client with 200 status code.

  // But if there is any database failure, mongoose will automatically throw the error and it will be catched by global error handling middleware.

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
  // "results" is not part of JSend spec, but we send it in case data is array.
});

const getMyTours = catchAsync(async (req, res, next) => {
  // Find bookings by user
  const bookings = await Booking.find({ user: req.user._id });
  const tourIds = bookings.map((booking) => booking.tour);

  // Find all tour docs with tourIds
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getOneTour = catchAsync(async (req, res, next) => {
  // Use populate() to fetch referenced documents.
  // For front-end, we use slug instead of id, to get single tour
  // const tour = await Tour.findById(req.params.tourId)
  const tour = await Tour.findOne({ slug: req.params.tourId })
    .populate({
      path: "guides",
      select: "-__v -passwordChangedAt -password",
    })
    .populate({
      path: "reviews",
      select: "review rating user",
    });
  // .populate("reviews"); // populates all fields

  // NOTE - reviews is virtual field. So you need to enable virtuals for JSON representation of mongoose doc through schema.

  if (!tour) {
    return next(new AppError("No tour found with specified id.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: { ...tour._doc, reviews: tour.reviews },
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
    new: true,
    runValidators: true,
  });
  // By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.

  if (!tour) {
    return next(new AppError("No tour found with specified id.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.tourId);

  if (!tour) {
    return next(new AppError("No tour found with specified ID.", 404));
  }

  // Convention is to send response with no data with status code 204 back to user on delete request.
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const aliasTopCheapTours = (req, res, next) => {
  // Overwrite the query object
  req.query = {};
  req.query.sort = "price,-ratingsAverage";
  req.query.limit = "5";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        countTours: { $sum: 1 },
        countRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        $expr: { $eq: [year, { $year: "$startDates" }] },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        countTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

module.exports = {
  createTour,
  getAllTours,
  getMyTours,
  getOneTour,
  updateTour,
  deleteTour,
  aliasTopCheapTours,
  getTourStats,
  getMonthlyPlan,
  uploadTourImages,
  resizeTourImages,
};
