/*******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const invRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");

/* ***********************
 * Middleware to serve static files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Middleware for parsing
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory Routes
app.use("/inv", invRoute);

// Skip favicon error
app.get("/favicon.ico", (req, res) => res.status(204));

/* ***********************
 * Intentional 500 Trigger Route
 *************************/
app.get("/trigger-error", (req, res, next) => {
  const error = new Error("Oh no! There was a crash. Maybe try a different route?");
  error.status = 500;
  throw error;
});

/* ***********************
 * 404 Handler - Catch all undefined routes
 *************************/
app.use(async (req, res) => {
  let nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "The page you are looking for does not exist.",
    nav,
  });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Server Error at "${req.originalUrl}":`, err.stack);

  const title = err.status === 404 ? "404 Not Found" : "Server Error";
  const message = err.message || "Something went wrong on the server.";

  res.status(err.status || 500).render("errors/error", {
    title,
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
