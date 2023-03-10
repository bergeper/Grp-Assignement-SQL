const { body } = require("express-validator");

exports.registerSchema = [
  body("username")
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage(
      "You must provide a username that is at least 3 characters long"
    ),
  body("email").isEmail().withMessage("You must provide a valid email address"),
  body("password")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage(
      "You must provide a password that is at least 6 characters long"
    ),
];

exports.updateUserSchema = [
  body("username")
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage(
      "You must provide a username that is at least 3 characters long"
    ),
  body("email").isEmail().withMessage("You must provide a valid email address"),
  body("password")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage(
      "You must provide a password that is at least 6 characters long"
    ),
];

exports.reviewSchema = [
  body("review_title")
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage("You must provide a title"),
  body("review_description")
    .not()
    .isEmpty()
    .isLength({ min: 0, max: 500 })
    .withMessage("You must provide a description with max 500 chars"),
  body("review_rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("You must provide a number between 1 and 5."),
];

exports.storeSchema = [
  body("store_name")
    .not()
    .isEmpty()
    .withMessage("You must provide a store name"),
  body("store_adress")
    .not()
    .isEmpty()
    .withMessage("You must provide a store adress"),
  body("store_zipcode")
    .isLength({ min: 6, max: 6 })
    .withMessage("You must provide a zipcode"),
];
exports.loginSchema = [
  body("username").not().isEmpty().withMessage("You must provide a username"),
  body("password").not().isEmpty().withMessage("You must provide a password"),
];
