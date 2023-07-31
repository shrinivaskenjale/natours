const express = require("express");
const userController = require("../controllers/user-controller");
const authController = require("../controllers/auth-controller");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:resetToken", authController.resetPassword);

// All routes coming after are protected.
router.use(authController.protect);

router.patch("/update-my-password", authController.updatePassword);
router
  .route("/me")
  .get(userController.getMe, userController.getUser)
  .delete(userController.deleteMe)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );

// All routes coming after are accessible by admin only
// router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getAllUsers);

router
  .route("/:userId")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
