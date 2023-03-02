const { QueryTypes, QueryError } = require("sequelize");
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
    throw new NotFoundError(
      "We could not find the review you are looking for..."
    );
  }

  return res.json(results);
};

exports.createReview = async (req, res) => {
  const { review_title, review_description, review_rating } = req.body;
  const storeId = req.params.storeId;
  const userId = req.user.userId;

  const [newReviewId] = await sequelize.query(
    `
    INSERT INTO reviews (review_title, review_description, review_rating, fk_user_id, fk_store_id)
    VALUES ($review_title, $review_description, $review_rating, $fk_user_id, $fk_store_id);
    `,
    {
      bind: {
        review_title: review_title,
        review_description: review_description,
        review_rating: review_rating,
        fk_user_id: userId,
        fk_store_id: storeId,
      },
      type: QueryTypes.INSERT,
    }
  );

  return res
    .setHeader(
      "Location",
      `${req.protocol}://${req.headers.host}/api/v1/reviews/${newReviewId.reviewId}`
    )
    .sendStatus(201);
};

exports.deleteReview = async (req, res) => {
  return res.send("yeeeeyeeeeyeeeeyeee");
};