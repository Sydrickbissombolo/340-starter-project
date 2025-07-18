const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// ROute to build inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildByInventoryId);

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional error for testing"));
});

module.exports = router;