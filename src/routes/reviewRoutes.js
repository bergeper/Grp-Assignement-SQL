const express = require("express");
const router = express.Router();
//const {
//  isAuthenticated,
//} = require("../middleware/authenticationMiddleware");
const {
  getAllReviews,
  getReviewById,
  createReview,
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.get("/:reviewId", getReviewById);
router.post("/", createReview);

module.exports = router;
