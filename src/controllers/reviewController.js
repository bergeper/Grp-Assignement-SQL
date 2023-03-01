const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const { UnauthorizedError, NotFoundError } = require("../utils/errors");

exports.getAllReviews = async (req, res) => {
  const [reviews, metadata] = await sequelize.query(`
  SELECT * FROM reviews 
  `);

  return res.json(reviews);
};
exports.getReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  const [results, metadata] = await sequelize.query(
    `
  SELECT * FROM reviews s 
  WHERE review_id = $reviewId
  `,
    {
      bind: { reviewId: reviewId },
    }
  );

  if (!results || results.length == 0) {
    throw new NotFoundError("We could not find the list you are looking for");
  }

  return res.json(results);
};
