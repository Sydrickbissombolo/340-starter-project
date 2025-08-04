const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const utilities = require("../utilities");
const accountModel = require("../models/account-model");

/* ============ Views ============ */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  const message = req.flash("notice");
  res.render("account/login", {
    title: "Login",
    nav,
    message,
    errors: [],
  });
}

async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  const message = req.flash("notice");
  res.render("account/register", {
    title: "Register",
    nav,
    message,
    errors: [],
  });
}

async function buildAccount(req, res) {
  const nav = await utilities.getNav();
  const accountData = res.locals.account;
  const message = req.flash("notice") || req.flash("message");
  res.render("account/management", {
    title: "Account Management",
    nav,
    account: accountData,
    message,
    errors: [],
  });
}

/* ============ Registration ============ */
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
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "An account with that email already exists.");
      return res.redirect("/account/register");
    }
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("notice", "An error occurred during registration. Please try again.");
    return res.redirect("/account/register");
  }
}

/* ============ Login with JWT ============ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
      req.flash("notice", "Login failed. Please check your email and password.");
      return res.redirect("/account/login");
    }

    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);
    if (!isPasswordValid) {
      req.flash("notice", "Incorrect password. Please try again.");
      return res.redirect("/account/login");
    }

    delete accountData.account_password;

    const payload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
  };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
  });

    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600000,
      ...(process.env.NODE_ENV !== "development" && { secure: true }),
    };

    res.cookie("jwt", token, cookieOptions);
    req.flash("notice", `Welcome, ${accountData.account_firstname}!`);
    res.redirect("/account");
  } catch (err) {
    console.error("JWT Login error:", err);
    req.flash("notice", "Something went wrong. Please try again.");
    return res.redirect("/account/login");
  }
}

/* ============ Show Update Account View ============ */
async function buildUpdateAccountView(req, res) {
  const nav = await utilities.getNav();
  const account_id = req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    errors: [],
  });
}

/* ============ Process Account Info Update ============ */
async function updateAccountInfo(req, res) {
  const nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("message", "Account information updated successfully.");
    } else {
      req.flash("message", "Update failed. Try again.");
    }

    res.redirect("/account");
  } catch (error) {
    console.error("Update account info error:", error);
    req.flash("message", "An error occurred. Try again.");
    res.redirect("/account");
  }
}

/* ============ Show Password Change View ============ */
async function buildPasswordView(req, res) {
  const nav = await utilities.getNav();
  const account_id = req.params.accountId;
  res.render("account/update-password", {
    title: "Change Password",
    nav,
    account_id,
    errors: [],
  });
}

/* ============ Process Password Change ============ */
async function updatePassword(req, res) {
  const nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("message", "Password updated successfully.");
    } else {
      req.flash("message", "Password update failed.");
    }

    res.redirect("/account");
  } catch (error) {
    console.error("Update password error:", error);
    req.flash("message", "An error occurred. Try again.");
    res.redirect("/account");
  }
}

/* ============ Logout ============ */
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  registerAccount,
  accountLogin,
  buildUpdateAccountView,
  updateAccountInfo,
  buildPasswordView,
  updatePassword,
  logout,
};
