const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bycrypt = require("bcryptjs");

/* *************************
 * Deliver login view
    *************************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
}

/* *************************
 * Deliver register view
    *************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    });
}

/* *************************
 * Handle registration submission
    *************************/
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
    // Hash the password
    let hashedPassword;
  try {
    hashedPassword = await bycrypt.hashSync(account_password, 10);
    } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing your registration. Please try again later.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
}

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* *************************
 * Handle login submission
    *************************/
async function loginAccount(req, res) {
  const { account_email, account_password } = req.body
    const loginResult = await accountModel.loginAccount(account_email, account_password)
    if (loginResult) {
        req.flash("notice", `Welcome back, ${loginResult.account_firstname}!`)
        res.status(200).redirect("/");
    }
    else {
        req.flash("notice", "Login failed. Please check your email and password.")
        res.status(401).render("account/login", {
            title: "Login",
            nav: await utilities.getNav(),
        });
    }
    return;
}

module.exports = {
    buildLogin, buildRegister, registerAccount, loginAccount
};