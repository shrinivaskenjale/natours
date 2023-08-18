const { promisify } = require("util");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const Email = require("../utils/email");

const signup = catchAsync(async (req, res, next) => {
  // Don't use request body as it is to create a user. Instead extract required fields.
  let { name, email, password, passwordConfirm } = req.body;
  if (password.length < 8) {
    return next(
      new AppError("Passwords should be at least 8 characters long.", 400)
    );
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Passwords should be encrypted before saving them to database everytime password field is modified.
  // Salt length adds random string of given length before hashing so that 2 same passwords do not generate same hash.
  password = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Send welcome email
  // const url = `${req.protocol}://${req.get("host")}/account`; // server rendered application
  // const url = `${req.get("origin")}/account`; // SPA
  const url = `${process.env.CLIENT_BASE_URL}/account`; // SPA
  await new Email(newUser, url).sendWelcome();

  // Send token
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Attach cookie to response
  res.cookie("jwt", token, {
    // Datetime when cookie expires
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // Cookie can't be modiefied by browser
    httpOnly: true,
    sameSite: "none",
    // Cookie should be used with HTTPS only
    secure: true,
    // secure: process.env.NODE_ENV === "production", // Not necessary that production app is HTTPS
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove sensitive fieds from user document before sending response.
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true,
    // secure: process.env.NODE_ENV === "production",
  });
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const logout = (req, res, next) => {
  // Option 1 - Overwrite old cookie with empty cookie with short expiry time.
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
    // secure: process.env.NODE_ENV === "production",
    // No need to set secure: true because no sensitive data here anymore
  });

  // Option 2 - Remove cookie
  // res.clearCookie("jwt", {
  //   // sameSite: "none",
  //   // secure: true,
  //   httpOnly: true,
  // });

  res.status(200).json({
    status: "success",
  });
};

// In order to protect routes, we create a middleware function which executes before other handlers for that route.
// If user is not authenticated then return error else call next middleware.
const protect = catchAsync(async (req, res, next) => {
  /**
   * Although client can send token using any way, common practice is to send a token using an http header with the request.
   * GET requests don't have body so we can't use body to send token.
   * Another option is query parameters but it is not standard.
   *
   * There is a standard for sending JWT tokens.
   * => Always use a header called 'authorization'.
   * => Value of the header should always start with 'Bearer', because we bear/have/possess this token.
   * => There should be single space between 'Bearer' and token, like 'Bearer <token>'.
   */
  const authHeader = req.get("Authorization");
  let token;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  // Verify the token
  // If token passes verification, verify method returns payload of the token, and if fails, throws an error.
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user exists
  // It may happen that someone stole the token but that user is deleted.
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Check if user changed password after the token was issued.
  // It may happen that someone stole the token so therefore user changed the password or user changed the password after token was issued.
  let isPasswordChanged = false;
  if (user.passwordChangedAt) {
    // Convert passwordChangedAt to seconds because JWT issued at timestamp is in seconds.
    // Note - After updating password, problem is since db stores passwordChangedAt in milliseconds, db has timestamp 1690095571.396 and token has 1690095571, and so token will be considered invalid. To fix this take floor value of timestamp after converting to seconds
    const passwordChangedAtTimestamp = Math.floor(
      user.passwordChangedAt.getTime() / 1000
    );
    isPasswordChanged = decodedToken.iat < passwordChangedAtTimestamp;
  }
  if (isPasswordChanged) {
    return next(
      new AppError(
        "User recently changed the password. Please log in again.",
        401
      )
    );
  }

  // User is authenticated. Move to next middleware.
  // Add the user object on request object.
  req.user = user;
  next();
});

// Always use protect middleware before restrictTo middleware on the route which requires authorization.
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // If role of logged in user is inside allowed allowedRoles array, then we move to next middleware.
    if (!allowedRoles.includes(req.user.role)) {
      // 403 - forbidden
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    // Authorized, move to next middleware.
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on provided email.
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError("There is no user with provided email address.", 404)
    );
  }

  // Generate random reset token.
  const resetToken = crypto.randomBytes(32).toString("hex");
  // If we store reset token as it is in DB, if DB data is leaked, attacker can use reset token to reset the password and get access to account. So just like password, we should store it by encrypting.
  // It is not necessary to use strong encryption for reset tokens.
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Set expiration time of reset token - 10 mins
  user.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  // 3. Send unencrypted token to email id.
  // Sending an email can fail. If it fails, we don't just want to send error message but handle few things. So we need to handle errors here.
  // Currently no page implemented on client.
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (error) {
    // If sending email fails, remove reset token and expiration time from DB for user.
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    return next(
      new AppError(
        "There was an error while sending the email. Try again later.",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to the email.",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.resetToken;
  // Get user based on the token which is not expired
  // In DB we have encrypted token and the one we receive is plain text.
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  // If token isn't expired and user exists, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired.", 400));
  }
  let { password, passwordConfirm } = req.body;
  if (password.length < 8) {
    return next(
      new AppError("Passwords should be at least 8 characters long.", 400)
    );
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }
  password = await bcrypt.hash(password, 12);
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  // Log the user in and send JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true,
    // secure: process.env.NODE_ENV === "production",
  });
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  let { password, passwordConfirm, passwordCurrent } = req.body;
  // Although only currently logged in user can change password but we still need current password to confirm the identity because if someone gets access to application in logged in state they can change password.

  // Check if submitted password is correct
  const isValid = await bcrypt.compare(passwordCurrent, req.user.password);
  if (!isValid) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  if (password.length < 8) {
    return next(
      new AppError("Passwords should be at least 8 characters long.", 400)
    );
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  password = await bcrypt.hash(password, 12);
  req.user.password = password;
  req.user.passwordChangedAt = Date.now();
  await req.user.save();
  // Note - We are not using findByIdAndUpdate() because we want validation (done by mongoose) and run middlewares before saving data to DB.

  // Send new JWT
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true,
    // secure: process.env.NODE_ENV === "production",
  });

  req.user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
