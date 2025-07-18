const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// Build Detail View by Inventory ID
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)

  if (!itemData) {
    const error = new Error("Vehicle not found")
    error.status = 404
    return next(error)
  }

  // Format price and miles for display
  itemData.inv_price = Number(itemData.inv_price)
  itemData.inv_miles = Number(itemData.inv_miles)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/detail", {
    title: itemName,
    nav,
    item: itemData,
  })
}

module.exports = invCont;