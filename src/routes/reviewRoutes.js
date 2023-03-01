const express = require("express");
const router = express.Router();
//const {
//  isAuthenticated,
//} = require("../middleware/authenticationMiddleware");
const {
  getAllReviews,
  getReviewById,
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.get("/:reviewId", getReviewById);

module.exports = router;
