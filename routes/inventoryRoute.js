const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidation = require("../utilities/invValidation");
const utilities = require("../utilities");
const { checkAdmin } = require("../utilities")

// Route to build inventory by classification
router.get("/type/:classificationId", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.buildByClassificationId));

// JSON inventory fetch (for JS dynamic table)
router.get("/getInventory/:classification_id", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.getInventoryJSON));

// Detail view by inventory ID
router.get("/detail/:inv_id", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.buildByInventoryId));

// Management main page
router.get("/management", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.buildManagement));
router.get("/", utilities.handleErrors(invController.buildManagement));

// Add classification form
router.get("/add-classification", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.buildAddClassification));

// Edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.editInventoryView));

// Show Delete confirmation
router.get("/delete/:inv_id", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.buildDeleteInventory));

// Handle POST for deleting inventory
router.post("/delete", utilities.checkLogin, checkAdmin, utilities.handleErrors(invController.deleteInventory));

// Add classification submission
router.post(
  "/add-classification",
  invValidation.validateClassification,
  invValidation.checkClassData, utilities.checkLogin,
  checkAdmin,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory form
router.get("/add-inventory", utilities.checkLogin, utilities.checkAdmin, utilities.handleErrors(invController.buildAddInventory));

// Add inventory submission
router.post(
  "/add-inventory",
  invValidation.validateInventory,
  invValidation.checkInvData, utilities.checkLogin,
  checkAdmin,
  utilities.handleErrors(invController.addInventory)
);

// Update inventory submission
router.post(
  "/update",
  invValidation.validateInventory,
  invValidation.checkUpdateData,
  utilities.checkLogin, checkAdmin,
  utilities.handleErrors(invController.updateInventory)
);

// Intentional 500 error for testing error handling
router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional error for testing"));
});

module.exports = router;
