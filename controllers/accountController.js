const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const utilities = require("../utilities");
const accountModel = require("../models/account-model");

/* ============
 *  Views
 * ============ */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

async function buildAccount(req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: null,
  });
}

/* ======================
 *  Registration Process
 * ====================== */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("notice", "An error occurred during registration. Please try again.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }
}

/* =================
 *  Login with JWT
 * ================= */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
      req.flash("notice", "Login failed. Please check your email and password.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);
    if (!isPasswordValid) {
      req.flash("notice", "Incorrect password. Please try again.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    // Remove sensitive data
    delete accountData.account_password;

    const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600 * 1000,
      ...(process.env.NODE_ENV !== "development" && { secure: true }),
    };

    res.cookie("jwt", token, cookieOptions);
    res.redirect("/account/");
  } catch (err) {
    console.error("JWT Login error:", err);
    req.flash("notice", "Something went wrong. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}

/* ====================
 *  Deprecated or Plain Login
 * ==================== */
async function loginAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const loginResult = await accountModel.loginAccount(account_email, account_password);
  if (loginResult) {
    req.flash("notice", `Welcome back, ${loginResult.account_firstname}!`);
    return res.status(200).redirect("/");
  } else {
    req.flash("notice", "Login failed. Please check your email and password.");
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  registerAccount,
  accountLogin,
  loginAccount,
};
