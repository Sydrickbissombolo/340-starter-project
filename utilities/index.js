const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* *****************************
 * Handle async errors
 ******************************/
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/* *****************************
 * Build navigation
 ******************************/
async function getNav() {
  const data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
  });
  list += "</ul>";
  return list;
}

/* *****************************
 * Build classification grid
 ******************************/
async function buildClassificationGrid(data) {
  let grid = "";
  if (data.length > 0) {
    grid += '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice"><hr />
          <h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* *****************************
 * Build vehicle detail view
 ******************************/
function buildDetailView(vehicle) {
  const price = vehicle.inv_price.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const miles = vehicle.inv_miles.toLocaleString("en-US");

  return `
    <div class="vehicle-details">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </div>
  `;
}

/* *****************************
 * Build classification dropdown
 ******************************/
async function buildClassificationList(selected = null) {
  const data = await invModel.getClassifications();
  let list = '<select id="classificationList" name="classification_id" required>';
  list += '<option value="">Choose a Classification</option>';
  data.rows.forEach((row) => {
    const selectedAttr = selected === row.classification_id ? " selected" : "";
    list += `<option value="${row.classification_id}"${selectedAttr}>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
}

/* ****************************************
* Middleware to check token validity
**************************************** */
function checkJWTToken(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) return next();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      req.flash("notice", "Please log in");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }

    res.locals.account = accountData;
    res.locals.account_type = accountData.account_type;
    res.locals.loggedin = true;
    res.locals.firstname = accountData.account_firstname;

    next();
  });
}

/* ****************************************
* Check login
**************************************** */
function checkLogin(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) {
    res.locals.loggedin = false;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.locals.loggedin = false;
      return next();
    }

    res.locals.loggedin = true;
    res.locals.firstname = decoded.account_firstname;
    res.locals.account_type = decoded.account_type;
    res.locals.account = decoded;

    return next();
  });
}

/* ****************************************
* Check if user is Admin or Employee
**************************************** */
const checkAdmin = (req, res, next) => {
  const account = res.locals.account;
  if (account && (account.account_type === "Employee" || account.account_type === "Admin")) {
    return next();
  }

  req.flash("notice", "Access denied. Admin or Employee only.");
  return res.redirect("/");
};

module.exports = {
  getNav,
  buildClassificationGrid,
  buildDetailView,
  handleErrors,
  buildClassificationList,
  checkJWTToken,
  checkLogin,
  checkAdmin,
};