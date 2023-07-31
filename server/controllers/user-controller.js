const User = require("../models/user-model");
const AppError = require("../utils/app-error");
const catchAsync = require("../utils/catch-async");
const multer = require("multer");
const sharp = require("sharp");

// Store file on the hard disk
// Not using this because we need to do image processing before storing it on disk.
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

// Store file in the memory
const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: storage, fileFilter: filter });

// Middleware to store user photo
const uploadUserPhoto = upload.single("photo");

// Middleware to edit the image
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // filename property is not set when using memoryStorage of multer. We need filename in route handler, so set it manually.
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  // Default fit value is cover
  // Default position value is center
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password -__v -passwordChangedAt");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError("User does not exist.", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Middleware adds current user's id in params object so that /me route then call getUser middleware.
const getMe = (req, res, next) => {
  req.params.userId = req.user._id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // Don't allow user to update password and role.
  // Use different route for updating password.
  // Extract the fields from body you should update. Don't use body directly to update the user.
  // console.log(req.file);
  // const { name, email } = req.body;
  const update = filterBody(req.body, "name", "email");
  if (req.file) {
    update.photo = req.file.filename;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const filterBody = (body, ...allowedFields) => {
  const filteredBody = {};
  for (const field in body) {
    if (allowedFields.includes(field)) {
      filteredBody[field] = body[field];
    }
  }
  return filteredBody;
};

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// When admin deletes someone
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError("No user found with specified ID.", 404));
  }

  // Convention is to send response with no data with status code 204 back to user on delete request.
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Do not update password with this
const updateUser = catchAsync(async (req, res, next) => {
  const { password, ...update } = req.body;
  const user = await User.findByIdAndUpdate(req.params.userId, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with specified id.", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

module.exports = {
  updateMe,
  deleteMe,
  getAllUsers,
  getMe,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
};
