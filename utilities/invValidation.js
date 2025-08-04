const inventoryModel = require("../models/inventory-model");
const { body, validationResult } = require('express-validator');
const utilities = require(".");

const validateClassification = [
    body('classification_name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Classification name is required')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Classification name must contain only letters and spaces')
];

const validateInventory = [
    body('inv_make')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Make is required'),
    body('inv_model')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Model is required'),
    body('inv_year')
        .isInt({ min: 1886, max: new Date().getFullYear() })
        .withMessage('Year must be a valid year'),
    body('inv_price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('inv_miles')
        .isInt({ min: 0 })
        .withMessage('Miles must be a non-negative integer'),
    body('inv_color')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Color is required'),
    body('inv_description')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Description is required'),
    body('inv_image')
        .trim()
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Image URL must be a valid string'),
    body('inv_thumbnail')
        .trim()
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Thumbnail URL must be a valid string'),
    body('classification_id')
        .isInt()
        .withMessage('Classification ID must be a valid integer')
];

// Check Results
const checkInvData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const classifications = await inventoryModel.getClassifications();
        res.render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            errors: errors.array(),
            classificationSelect: classifications.rows,
            ...req.body,
        });
        return;
    }
    next();
};

const checkClassData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: errors.array(),
            classification_name: req.body.classification_name,
        });
        return;
    }
    next();
}

const checkUpdateData = async (req, res, next) => {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        res.render("inventory/edit-inventory", {
            title: "Edit" + inv_make + " " + inv_model,
            nav,
            errors,
            classificationSelect,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
        return;
    }
    next();
}

module.exports = {
    validateClassification,
    validateInventory,
    checkInvData,
    checkClassData,
    checkUpdateData
};
    