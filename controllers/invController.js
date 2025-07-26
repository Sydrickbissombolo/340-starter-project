const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      const error = new Error("No vehicles found for this classification.");
      error.status = 404;
      return next(error);
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build inventory detail view by inventory ID
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      return next(error);
    }

    // Format price and miles
    itemData.inv_price = Number(itemData.inv_price);
    itemData.inv_miles = Number(itemData.inv_miles);

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("inventory/detail", {
      title: itemName,
      nav,
      item: itemData,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [],
      classification_name: "",
      flash: req.flash("notice")
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    let nav = await utilities.getNav();
    if (!errors.isEmpty()) {
      return res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: errors.array(),
        classification_name: req.body.classification_name,
        flash: req.flash("notice")
      });
    }

    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("notice", "Classification added successfully.");
      res.redirect("/inv/management");
    } else {
      req.flash("notice", "Failed to add classification.");
      res.redirect("/inv/add-classification");
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect: classifications.rows,
      errors: [],
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
      flash: req.flash("notice")
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    let nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    if (!errors.isEmpty()) {
      return res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationSelect: classifications.rows,
        errors: errors.array(),
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        classification_id: req.body.classification_id,
        flash: req.flash("notice")
      });
    }

    const vehicleData = req.body;
    const result = await invModel.addInventory(vehicleData);

    if (result) {
      req.flash("notice", "Vehicle added successfully.");
      res.redirect("/inv/management");
    } else {
      req.flash("notice", "Failed to add vehicle.");
      res.redirect("/inv/add-inventory");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = invCont;