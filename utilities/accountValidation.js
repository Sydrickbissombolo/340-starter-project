const accountModel = require("../models/account-model");
const utilities = require(".");
const { body, validationResult } = require('express-validator');
const validate = {}

validate.registrationRules = () => {
    return [
        body('account_firstname')
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage('First name is required'),

        body('account_lastname')
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage('Last name is required'),

        body('account_email')
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage('A valid email is required')
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error('Email already exists. Please log in or use a different email.');
                }
            }),

        body('account_password')
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage('Password does not meet requirements'),
    ]
};

/* *********************************
 * Check data and return errors or continue to registration
    *********************************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    let errors = []
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        return res.status(400).render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    }
    next();
}

validate.loginRules = () => {
    return [
        body('account_email')
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage('A valid email is required')
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (!emailExists) {
                    throw new Error('Email does not exist. Please register or use a different email.');
                }
            }),

        body('account_password')
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage('Password is required'),
    ]
};

validate.checkLoginData = async (req, res, next) => {
    const { account_email, account_password } = req.body;
    let errors = []
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        return res.status(400).render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        });
        return;
    }
    next();
}

module.exports = validate;