const express = require("express");
const router = express.Router();

// Middleware and utility functions
const utilities = require("../utilities");
const regValidate = require("../utilities/accountValidation");

// Controllers
const accountController = require("../controllers/accountController");

/* =============================
   GET Routes
============================= */

// Show login page
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

// Show registration page
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Show account dashboard (requires JWT authentication)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin, utilities.handleErrors(accountController.buildAccount)
);

// Route to update account info view
router.get("/update-account/:accountId",
  utilities.checkLogin, accountController.buildUpdateAccountView);

// Route to update password view
router.get("/update-password/:accountId",
  utilities.checkLogin, accountController.buildPasswordView);

router.get(
  "/logout", utilities.handleErrors(accountController.logout)
)

/* =============================
   POST Routes
============================= */

// Process update account info
router.post(
  "/update-account",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo));

// Process update password
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePassword,
  utilities.handleErrors(accountController.updatePassword));

// Handle registration form submission
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Handle login form submission
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* =============================
   Export the Router
============================= */
module.exports = router;