const express = require("express");
const router = new express.Router();
const contactController = require("../controllers/contactController");
const utilities = require("../utilities");
const { checkAdmin } = require("../utilities");
const contactValidate = require("../utilities/contactValidation");

// Contact form view
router.get("/", utilities.handleErrors(contactController.contactFormView));

// Handle message submission with validation middleware
router.post(
  "/",
  utilities.checkLogin,
  contactValidate.contactRules(),
  contactValidate.checkContactData,
  utilities.handleErrors(contactController.submitMessage)
);

// Admin: view messages
router.get(
  "/admin/messages",
  utilities.checkLogin,
  checkAdmin,
  utilities.handleErrors(contactController.viewMessages)
);

module.exports = router;
