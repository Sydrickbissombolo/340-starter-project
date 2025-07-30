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
  utilities.handleErrors(accountController.buildAccount)
);

/* =============================
   POST Routes
============================= */

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