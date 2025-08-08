const contactModel = require("../models/contact-model");
const utilities = require("../utilities");

async function contactFormView(req, res) {
  const nav = await utilities.getNav();
  res.render("contact/contact-form", {
    title: "Contact Us",
    nav,
    errors: null
  });
}

async function submitMessage(req, res, next) {
  try {
    const { subject, message } = req.body;
    const account_id = res.locals.account?.account_id;

    if (!account_id) {
      req.flash("notice", "You must be logged in to send a message.");
      return res.redirect("/account/login");
    }

    if (!subject || !message) {
      req.flash("notice", "Subject and message are required.");
      return res.redirect("/contact");
    }

    await contactModel.insertMessage(account_id, subject, message);

    req.flash("notice", "Your message has been sent successfully!");
    res.redirect("/contact");
  } catch (err) {
    console.error("Error inserting contact message:", err);
    next(err);
  }
}

async function viewMessages(req, res, next) {
  try {
    const messages = await contactModel.getMessages();
    const nav = await utilities.getNav();
    res.render("contact/messages", {
      title: "Contact Messages",
      nav,
      messages
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { contactFormView, submitMessage, viewMessages };