const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authenticationMiddleware");
const {
  getAllReviews,
  getReviewById,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.get("/:reviewId", getReviewById);
router.post("/:storeId", isAuthenticated, createReview);
router.delete("/:reviewId", isAuthenticated, deleteReview);

module.exports = router;
