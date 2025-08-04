const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Handle errors for async functions
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

async function getNav() {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
    list += "</li>";
  });
  list += "</ul>";
  return list;
}

async function buildClassificationGrid(data) {
  let grid = "";
  if (data.length > 0) {
    grid += '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice"><hr />';
      grid += `<h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span></div>`;
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

function buildDetailView(vehicle) {
  const price = vehicle.inv_price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
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

async function buildClassificationList(selected = null) {
  let data = await invModel.getClassifications();
  let list = '<select id="classificationList" name="classification_id" required>';
  list += `<option value="">Choose a Classification</option>`;
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"`;
    if (selected === row.classification_id) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
}


/* ****************************************
* Middleware to check token validity
**************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
}

/* ****************************************
* Check login
**************************************** */
function checkLogin(req, res, next) {
  const token = req.cookies.jwt;

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
    res.locals.account = decoded;

    return next();
  });
}

const checkAdmin = (req, res, next) => {
  const accountType = res.locals.account_type;
  if (accountType === "Employee" || accountType === "Admin") {
    return next();
  }
  return res.status(403).render("account/login", {
    title: "Login",
    message: "Access denied. Admin or Employee only.",
  });
};

module.exports = {
  getNav,
  buildClassificationGrid,
  buildDetailView,
  handleErrors,
  buildClassificationList,
  checkJWTToken,
  checkLogin,
  checkAdmin
}
