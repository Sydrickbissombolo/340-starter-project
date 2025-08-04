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
    const classificationSelect = await utilities.buildClassificationList();
    const classifications = await invModel.getClassifications();
    res.render("inventory/management", {
      title: "Vehicle Management",
      classificationSelect,
      classifications: classifications.rows,
      nav,
      error: [],
      flash: req.flash("notice"),
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

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

invCont.getInventory = async function (req, res, next) {
  try {
    const invData = await invModel.getInventoryByClassificationId(req.params.classification_id);
    if (invData.length === 0) {
      return res.status(404).json({ message: "No vehicles found for this classification." });
    }
    res.json(invData);
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

/* ***************************
 *  Edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};

/* ***************************
 *  Process update inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
// Deliver delete confirmation view
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const data = await invModel.getInventoryById(inv_id);
  const nav = await utilities.getNav();
  const itemName = `${data.inv_make} ${data.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_price: data.inv_price
  });
}

/* ***************************
 *  Process delete inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);
  if (deleteResult.rowCount > 0) {
    req.flash("notice", "The inventory item was successfully deleted.");
    res.redirect("/inv/management");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
}




module.exports = invCont;