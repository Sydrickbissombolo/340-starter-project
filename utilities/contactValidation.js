const contactModel = require("../models/contact-model")
const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

/* *****************************
 * Rules for submitting a contact message
 ***************************** */
validate.contactRules = () => {
  return [
    body("subject")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Subject is required.")
      .isLength({ max: 255 })
      .withMessage("Subject must be less than 256 characters."),

    body("message")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Message is required."),
  ];
};

/* *****************************
 * Check contact message data
 ***************************** */
validate.checkContactData = async (req, res, next) => {
  const { subject, message } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("contact/contact-form", {
      title: "Contact Support",
      nav,
      errors: errors.array(),
      subject,
      message,
    });
  }
  next();
};

module.exports = validate;