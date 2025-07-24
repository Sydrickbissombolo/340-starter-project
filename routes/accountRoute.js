const express = require("express");
const router = express.Router();
const regValidate = require("../utilities/accountValidation");
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

/* Route to build the login view */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* Route to build the register view */
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* Route to handle registration submission */
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.loginAccount)
);

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;
