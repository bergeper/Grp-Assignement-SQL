const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../utils/errors");

exports.createNewReview = async (req, res) => {
  const { review_title, review_description, review_rating } = req.body;
  const storeId = req.params.storeId;
  const userId = req.user.userId;

  const [newReviewId] = await sequelize.query(
    `
      INSERT INTO review (review_title, review_description, review_rating, fk_user_id, fk_store_id)
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
      `${req.protocol}://${req.headers.host}/api/v1/users/${userId}`
    )
    .status(201)
    .json({ message: `You have created a review🚀` });
};

exports.deleteReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  const [review, reviewMeta] = await sequelize.query(
    `
  SELECT * FROM review
  WHERE review_id = $reviewId  
  `,
    {
      bind: { reviewId: reviewId },
      type: QueryTypes.SELECT,
    }
  );
  console.log(review);

  if (!review) {
    throw new NotFoundError("This review does not exist😢");
  }
  if (
    req.user.role == userRoles.ADMIN ||
    req.user.userId == review.fk_user_id
  ) {
    await sequelize.query(
      `
    DELETE FROM review
    WHERE review_id = $reviewId
    `,
      {
        bind: {
          reviewId: reviewId,
        },
        types: QueryTypes.DELETE,
      }
    );
    return res.sendStatus(204);
  } else {
    throw new UnauthorizedError("You are not allowed to delete this review⚠️");
  }
};

exports.updateReviewById = async (req, res) => {
  const { review_title, review_description, review_rating } = req.body;
  const reviewId = req.params.reviewId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (!review_description || !review_title || !review_rating) {
    throw new BadRequestError("You must enter values for each field⚠️");
  }

  const review = await sequelize.query(
    `
  SELECT * FROM review
  WHERE review_id = $reviewId  
  `,
    {
      bind: { reviewId: reviewId },
      type: QueryTypes.SELECT,
    }
  );

  if (review.length <= 0)
    throw new UnauthorizedError("Review does not exist😢");

  if (userRole == userRoles.ADMIN || userId == review[0].fk_user_id) {
    const [updateReview] = await sequelize.query(
      `
      UPDATE review SET review_title = $review_title, review_description = $review_description, review_rating = $review_rating
    WHERE review_id = $reviewId
    RETURNING *;
    `,
      {
        bind: {
          review_title: review_title,
          review_description: review_description,
          review_rating: review_rating,
          reviewId: reviewId,
        },
        type: QueryTypes.UPDATE,
      }
    );

    return res.json(updateReview);
  } else {
    throw new UnauthorizedError(
      "Your trying to update a review created by another user⚠️"
    );
  }
};
