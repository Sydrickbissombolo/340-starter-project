/*******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const pgSession = require("connect-pg-simple")(session);
const env = require("dotenv").config();
const pool = require("./database/");
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const invRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const contactRoute = require("./routes/contactRoute");
const utilities = require("./utilities/");

const app = express();

/* ***********************
 * Middleware to serve static files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Middleware for parsing
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* ***********************
 * Session Middleware (must come BEFORE flash & routes)
 *************************/
app.use(session({
  store: new pgSession({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  cookie: { secure: false },
}));

/* ***********************
 * Flash Messages Middleware
 *************************/
app.use(flash());
app.use((req, res, next) => {
  res.locals.message = req.flash("message");
  res.locals.notice = req.flash("notice");
  next();
});

/* ***********************
 * JWT Token Middleware
 *************************/
app.use(utilities.checkJWTToken);

/* ***********************
 * Navigation for all views
 *************************/
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

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
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", invRoute);
app.use("/account", accountRoute);
app.use("/contact", contactRoute);
app.get("/favicon.ico", (req, res) => res.status(204));

/* ***********************
 * Intentional 500 Error Test
 *************************/
app.get("/trigger-error", (req, res) => {
  throw new Error("Oh no! There was a crash. Maybe try a different route?");
});

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res) => {
  const nav = await utilities.getNav();
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
  const nav = await utilities.getNav();
  console.error(`Server Error at "${req.originalUrl}":`, err.stack);
  res.status(err.status || 500).render("errors/error", {
    title: err.status === 404 ? "404 Not Found" : "Server Error",
    message: err.message || "Something went wrong on the server.",
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
