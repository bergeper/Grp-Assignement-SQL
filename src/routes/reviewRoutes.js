const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authenticationMiddleware");
const {
  createNewReview,
  deleteReviewById,
  updateReviewById,
} = require("../controllers/reviewController");
const { reviewSchema } = require("../middleware/validation/validationSchemas");
const { validate } = require("../middleware/validation/validationMiddleware");

router.post(
  "/:storeId",
  validate(reviewSchema),
  isAuthenticated,
  createNewReview
);
router.delete("/:reviewId", isAuthenticated, deleteReviewById);
router.put("/:reviewId", isAuthenticated, updateReviewById);

module.exports = router;
