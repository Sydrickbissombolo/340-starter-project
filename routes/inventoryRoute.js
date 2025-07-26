const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidation = require("../utilities/invValidation");
const utilities = require("../utilities");

// ROute to build inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildByInventoryId);
router.get("/management", invController.buildManagement);
router.get("/add-classification", invController.buildAddClassification);
router.get("/", invController.buildManagement)
router.post(
  "/add-classification",
  invValidation.validateClassification,
  invValidation.checkClassData,
  invController.addClassification,
  utilities.handleErrors(invController.addClassification)
);
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  invValidation.validateInventory,
  invValidation.checkInvData,
  invController.addInventory,
  utilities.handleErrors(invController.addInventory)
  
);

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional error for testing"));
});

module.exports = router;