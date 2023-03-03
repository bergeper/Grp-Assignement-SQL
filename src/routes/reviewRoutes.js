const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authenticationMiddleware");
const {
  getAllReviews,
  getReviewById,
  createNewReview,
  deleteReviewById,
  updateReviewById,
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.get("/:reviewId", getReviewById);
router.post("/:storeId", isAuthenticated, createNewReview);
router.delete("/:reviewId", isAuthenticated, deleteReviewById);
router.put("/:reviewId", isAuthenticated, updateReviewById);

module.exports = router;
